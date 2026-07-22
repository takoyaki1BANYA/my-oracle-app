export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY が設定されていません。' });
  }

  try {
    const { system, messages } = req.body;
    const userPrompt = messages?.[0]?.content || '';

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: system || '' }]
        },
        contents: [
          {
            role: 'user',
            parts: [{ text: userPrompt }]
          }
        ],
        generationConfig: {
          maxOutputTokens: 8192,
          temperature: 0.8,
        }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Gemini API Error:', data);
      return res.status(response.status).json({ error: data.error?.message || 'Gemini API エラーが発生しました' });
    }

    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    return res.status(200).json({
      content: [
        {
          type: 'text',
          text: generatedText
        }
      ]
    });

  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ error: 'サーバー内部エラーが発生しました。' });
  }
}
