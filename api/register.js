export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email } = req.body;

  if (!email || !email.endsWith('@gmail.com')) {
    return res.status(400).json({ error: 'A valid Gmail address is required.' });
  }

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

  try {
    // Appending the apikey directly to the URL helps avoid routing blocks with newer token prefixes
    const targetUrl = `${SUPABASE_URL}/rest/v1/registered_users?apikey=${SUPABASE_SERVICE_ROLE_KEY}`;

    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates'
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Supabase raw error response:', errText);
      throw new Error(errText);
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Supabase integration error:', error);
    return res.status(500).json({ error: 'Failed to record email registration.' });
  }
}
