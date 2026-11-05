export default async function handler(req, res) {
  // 1. Set security headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*'); 
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

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

  // UPDATED: Using the standard 1.5-flash model
  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });

    const data = await response.json();
    
    // Catch Google API specific errors (like invalid keys)
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
```
*Note: After you commit this change in GitHub, Vercel will automatically rebuild your server. Wait about 30 seconds before testing.*

### 2. The Environment Variable Redeploy Trap
If you added your `GEMINI_API_KEY` in Vercel *after* your first deployment, Vercel doesn't automatically attach it to your running code. 
**How to fix it:** In your Vercel Dashboard, go to your project, click the **Deployments** tab, click the three dots (`...`) next to your most recent deployment, and hit **Redeploy**.

### 3. Making the Frontend Smarter (HTML Update)
I will update your HTML code so that if it fails again, it will print the *exact* reason in your browser's developer console (which you can open by pressing `F12` and clicking the "Console" tab).

Here is the code diff to improve your error handling:

```html:MS(2) AI Writing Coach:index.html
<!-- ... existing code ... -->
                let retries = 3;
                let delay = 1000;
                let response;
                
                while (retries > 0) {
                    response = await fetch(API_URL, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    });

                    if (response.ok) break;
                    if (response.status === 429) {
                        retries--;
                        await new Promise(res => setTimeout(res, delay));
                        delay *= 2;
                    } else {
                        // Grab the exact error message from Vercel/Google
                        const errorData = await response.text();
                        console.error("Backend Error Details:", errorData);
                        throw new Error(`API Error: ${response.status} - ${errorData}`);
                    }
                }

                if (!response.ok) throw new Error("Failed after retries");

                const result = await response.json();
<!-- ... existing code ... -->
