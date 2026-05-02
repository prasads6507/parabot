import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const modeInstructions = {
  fluency: "Rewrite the text to be perfectly fluent and grammatically correct while keeping the original style.",
  formal: "Rewrite the text in a highly formal and professional tone.",
  creative: "Rewrite the text in a creative, engaging style using vivid language.",
  expand: "Expand the text by adding more details and explanation, making it longer without repetition.",
  shorten: "Summarise and shorten the text while preserving its core meaning.",
  humanize: `Rewrite the text so it sounds exactly like a native English speaker writing casually online.
You MUST:
- Use contractions (don't, can't, it's, I'm, you'll).
- Use informal vocabulary and everyday expressions (awesome, a bit, kind of, stuff).
- Add occasional filler words or casual phrases (well, you know, basically, honestly).
- Vary sentence lengths — mix short and long sentences, even fragments.
- Introduce tiny, natural imperfections: a missing comma, a casual run-on, or a slightly informal structure.
- If appropriate, express personal opinion or emotion (I think, honestly, I feel).
- Avoid all formal transitions (moreover, therefore, in conclusion) and robotic phrasing.
The result must be indistinguishable from something a real person typed in a chat or informal email.`
};

function buildSystemPrompt(modes, grammarOnly) {
  if (grammarOnly) return "Fix all grammar and spelling mistakes in the text, but do NOT change the style or vocabulary. Only return the corrected text, no explanations.";
  if (!modes || modes.length === 0) modes = ['fluency'];
  const instructions = modes.filter(m => modeInstructions[m]).map(m => modeInstructions[m]);
  if (instructions.length === 0) return "Paraphrase the text. Only return the rewritten version.";
  return instructions.join(' ') + " Only return the rewritten text, no explanations.";
}

function buildUserPrompt(text, modes, synonymLevel) {
  let note = '';
  if (synonymLevel <= 20) note = ' Use almost the same words as the original.';
  else if (synonymLevel >= 80) note = ' Aggressively replace words with synonyms while keeping the meaning.';
  else note = ' Replace some words with appropriate synonyms.';
  return `Original text: "${text}"\nModes: ${modes.join(' + ')}.${note}\nRewritten:`;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { text, modes = ['fluency'], synonymLevel = 50, grammarOnly = false } = req.body;
  if (!text) return res.status(400).json({ error: 'No text' });

  const finalModes = grammarOnly ? [] : modes;
  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: buildSystemPrompt(finalModes, grammarOnly) },
        { role: 'user', content: buildUserPrompt(text, finalModes, synonymLevel) }
      ],
      model: 'llama-3.1-8b-instant', temperature: 0.7, max_tokens: 1024,
    });
    res.json({ paraphrasedText: chatCompletion.choices[0]?.message?.content?.trim() || 'Could not paraphrase.' });
  } catch (error) {
    console.error('Paraphrase error:', error);
    res.status(500).json({ error: 'Failed to paraphrase.' });
  }
}
