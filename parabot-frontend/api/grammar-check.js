import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'No text provided' });

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: `Analyze the provided text for spelling, grammar, punctuation, and word misuse errors.\nReturn your analysis as a JSON array. Each object must have three keys: "error" (the incorrect text), "correction" (the suggested fix), and "explanation" (a brief explanation).\nIf there are no errors, return an empty array [].\nONLY return the JSON array, no other text.` },
        { role: 'user', content: text }
      ],
      model: 'llama-3.1-8b-instant', temperature: 0.1, max_tokens: 1024,
    });
    let raw = chatCompletion.choices[0]?.message?.content?.trim() || '[]';
    raw = raw.replace(/```json|```/g, '').trim();
    const start = raw.indexOf('[');
    const end = raw.lastIndexOf(']');
    if (start !== -1 && end !== -1 && start < end) raw = raw.substring(start, end + 1);
    res.json({ corrections: JSON.parse(raw) });
  } catch (error) {
    console.error('Grammar error:', error);
    res.status(500).json({ error: 'Failed to check grammar.' });
  }
}
