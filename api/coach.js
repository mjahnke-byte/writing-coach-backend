module.exports = async function handler(req, res) {
  // 1. Force CORS headers on EVERY response before doing anything else
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // 2. Immediately intercept and approve the browser's security preflight check (OPTIONS)
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // 3. Block non-POST requests
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Only POST requests allowed.' });
    return;
  }

  // 4. Securely grab the API key
  const API_KEY = process.env.GEMINI_API_KEY;
  if (!API_KEY) {
    res.status(500).json({ error: 'API key is missing in Vercel settings.' });
    return;
  }

  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

  // 5. Forward request to Gemini
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });

    const data = await response.json();
    res.status(200).json(data);
    
  } catch (error) {
    console.error("Vercel Server Error:", error);
    res.status(500).json({ error: 'Failed to communicate with AI', details: error.toString() });
  }
}
