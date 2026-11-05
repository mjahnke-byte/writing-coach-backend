export default async function handler(req, res) {
  // 1. Set security headers (Credentials removed to prevent CORS conflict)
  res.setHeader('Access-Control-Allow-Origin', '*'); 
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Handle pre-flight check from browsers
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  // 2. Safely grab your API key
  const API_KEY = process.env.GEMINI_API_KEY;
  if (!API_KEY) {
    return res.status(500).json({ error: 'API key is not configured in Vercel.' });
  }

  // 3. Connect to the Gemini 1.5 Flash model
  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });

    const data = await response.json();
    
    // Catch Google API specific errors
    if (!response.ok) {
      console.error("Google API Error:", data);
      return res.status(response.status).json({ error: "Google API rejected the request.", details: data });
    }
    
    res.status(200).json(data);
  } catch (error) {
    console.error("Vercel Server Error:", error);
    res.status(500).json({ error: 'Failed to communicate with AI Coach', details: error.message });
  }
}
