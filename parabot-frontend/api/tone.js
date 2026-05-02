import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'No text provided' });

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: `Analyze the tone of the provided text. Identify the primary and secondary tones (e.g., Formal, Informal, Joyful, Sad, Optimistic, Pessimistic, Assertive, Confident, Friendly, Humorous, Serious, Sarcastic, Empathetic, Neutral).\nRespond ONLY with a JSON object: {"primary": "Formal", "secondary": "Assertive", "confidence": 90}` },
        { role: 'user', content: text }
      ],
      model: 'llama-3.1-8b-instant', temperature: 0.2, max_tokens: 150,
    });
    let raw = chatCompletion.choices[0]?.message?.content?.trim() || '{}';
    raw = raw.replace(/```json|```/g, '').trim();
    const start = raw.indexOf('{');
    const end = raw.lastIndexOf('}');
    if (start !== -1 && end !== -1 && start < end) raw = raw.substring(start, end + 1);
    res.json(JSON.parse(raw));
  } catch (error) {
    console.error('Tone error:', error);
    res.status(500).json({ error: 'Failed to detect tone.' });
  }
}
