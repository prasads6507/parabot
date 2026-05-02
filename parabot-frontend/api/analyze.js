import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'No text provided' });

  const systemPrompt = `You are a forensic text analyst. Determine whether text was written by a human or AI.
Check for AI indicators: uniform sentence lengths, repetition, lack of emotion, formal transitions, perfect grammar, generic statements.
Check for human indicators: varied rhythm, minor quirks, personal stories, humor, unexpected word choices.
Respond ONLY with: {"aiPercentage": number, "humanPercentage": number}. They must add to 100.`;

  let raw = '';
  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: text }
      ],
      model: 'llama-3.1-8b-instant', temperature: 0.2, max_tokens: 150,
    });
    raw = chatCompletion.choices[0]?.message?.content?.trim() || '{}';
    raw = raw.replace(/```json|```/g, '').trim();
    const start = raw.indexOf('{');
    const end = raw.lastIndexOf('}');
    if (start !== -1 && end !== -1 && start < end) raw = raw.substring(start, end + 1);
    const parsed = JSON.parse(raw);
    if (parsed.aiPercentage === undefined || parsed.humanPercentage === undefined) throw new Error('Invalid');
    const total = parsed.aiPercentage + parsed.humanPercentage;
    parsed.aiPercentage = Math.round((parsed.aiPercentage / (total || 1)) * 100);
    parsed.humanPercentage = 100 - parsed.aiPercentage;
    res.json(parsed);
  } catch (error) {
    console.error('Analyze error:', error, 'Raw:', raw);
    res.status(500).json({ error: 'Analysis failed.' });
  }
}
