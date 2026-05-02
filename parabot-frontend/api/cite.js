import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { text, style = 'APA' } = req.body;
  if (!text) return res.status(400).json({ error: 'No text provided' });

  const systemPrompt = `You are a helpful citation generator. Generate a citation in the requested style.
Format Guide:
- APA 7th: Author, A. A. (Year). Title of work. Publisher.
- MLA 9th: Author Last Name, First Name. *Title of Work*. Publisher, Year.
- Chicago: Author First Name Last Name, *Title of Work* (Place: Publisher, Year).
Respond ONLY with the formatted citation.`;

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Generate a citation in ${style} format for: "${text}"` }
      ],
      model: 'llama-3.1-8b-instant', temperature: 0.2, max_tokens: 512,
    });
    res.json({ citation: chatCompletion.choices[0]?.message?.content?.trim() || 'Could not generate citation.' });
  } catch (error) {
    console.error('Citation error:', error);
    res.status(500).json({ error: 'Failed to generate citation.' });
  }
}
