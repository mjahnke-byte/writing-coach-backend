export default async function handler(req, res) {
  // Handle the browser's automatic security check
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Safely grab the API key
  const API_KEY = process.env.GEMINI_API_KEY;
  if (!API_KEY) {
    return res.status(500).json({ error: 'API key is missing in Vercel settings.' });
  }

  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

  // Forward request to Gemini
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
