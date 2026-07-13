export default async function handler(req, res) {
  // Allow only POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email } = req.body;

  if (!email || !email.endsWith('@gmail.com')) {
    return res.status(400).json({ error: 'A valid Gmail address is required.' });
  }

  // Grab your credentials securely from Vercel's Environment Variables
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/registered_users`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates' // Prevents crashing if someone tries to register twice
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(errText);
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Supabase integration error:', error);
    return res.status(500).json({ error: 'Failed to record email registration.' });
  }
}
