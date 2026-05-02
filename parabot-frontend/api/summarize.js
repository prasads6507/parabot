import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { text, mode = 'paragraph', wordLimit = 1200 } = req.body;
  if (!text) return res.status(400).json({ error: 'No text provided' });

  const modeHint = mode === 'keypoints'
    ? 'Present the summary as a numbered list of key points.'
    : 'Write the summary as a coherent paragraph.';

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: `You are an expert text summarizer. Create a concise summary of the provided text, not exceeding ${wordLimit} words.\n${modeHint}\nCapture all critical information and main ideas. Only return the summary, no other text.` },
        { role: 'user', content: text }
      ],
      model: 'llama-3.1-8b-instant', temperature: 0.3, max_tokens: 1024,
    });
    res.json({ summary: chatCompletion.choices[0]?.message?.content?.trim() || 'Could not summarize.' });
  } catch (error) {
    console.error('Summarize error:', error);
    res.status(500).json({ error: 'Failed to summarize.' });
  }
}
