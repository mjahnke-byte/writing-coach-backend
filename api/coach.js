module.exports = async function handler(req, res) {
  // 1. Attach CORS headers immediately
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // 2. Handle the browser's automatic security check (OPTIONS request)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 3. Block anything that isn't a POST request
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST requests allowed.' });
  }

  // 4. Securely grab the API key
  const API_KEY = process.env.GEMINI_API_KEY;
  if (!API_KEY) {
    return res.status(500).json({ error: 'API key is missing in Vercel settings.' });
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
    return res.status(200).json(data);
    
  } catch (error) {
    console.error("Vercel Server Error:", error);
    return res.status(500).json({ error: 'Failed to communicate with AI' });
  }
}
