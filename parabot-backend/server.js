require('dotenv').config();
const express = require('express');
const cors = require('cors');
const Groq = require('groq-sdk');

const app = express();
app.use(cors());
app.use(express.json());

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// ══════════════════════════════════════════════════════════════
//  MODE INSTRUCTIONS (Paraphraser)
// ══════════════════════════════════════════════════════════════
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
  if (grammarOnly) {
    return "Fix all grammar and spelling mistakes in the text, but do NOT change the style or vocabulary. Only return the corrected text, no explanations.";
  }
  if (!modes || modes.length === 0) modes = ['fluency'];
  const instructions = modes.filter(m => modeInstructions[m]).map(m => modeInstructions[m]);
  if (instructions.length === 0) return "Paraphrase the text. Only return the rewritten version.";
  return instructions.join(' ') + " Only return the rewritten text, no explanations.";
}

function buildUserPrompt(text, modes, synonymLevel) {
  let synonymNote = '';
  if (synonymLevel <= 20) synonymNote = ' Use almost the same words as the original.';
  else if (synonymLevel >= 80) synonymNote = ' Aggressively replace words with synonyms while keeping the meaning.';
  else synonymNote = ' Replace some words with appropriate synonyms.';
  const modeNames = modes.join(' + ');
  return `Original text: "${text}"\nModes: ${modeNames}.${synonymNote}\nRewritten:`;
}

// ══════════════════════════════════════════════════════════════
//  1. PARAPHRASE ENDPOINT
// ══════════════════════════════════════════════════════════════
app.post('/api/paraphrase', async (req, res) => {
  const { text, modes = ['fluency'], synonymLevel = 50, grammarOnly = false } = req.body;
  if (!text) return res.status(400).json({ error: 'No text' });

  const finalModes = grammarOnly ? [] : modes;
  const systemPrompt = buildSystemPrompt(finalModes, grammarOnly);
  const userPrompt = buildUserPrompt(text, finalModes, synonymLevel);

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      model: 'llama-3.1-8b-instant',
      temperature: 0.7,
      max_tokens: 1024,
    });
    const paraphrased = chatCompletion.choices[0]?.message?.content?.trim() || 'Could not paraphrase.';
    res.json({ paraphrasedText: paraphrased });
  } catch (error) {
    console.error('Groq error:', error);
    res.status(500).json({ error: 'Failed to paraphrase. Check your Groq API key.' });
  }
});

// ══════════════════════════════════════════════════════════════
//  2. SUMMARIZER ENDPOINT
// ══════════════════════════════════════════════════════════════
app.post('/api/summarize', async (req, res) => {
  const { text, mode = 'paragraph', wordLimit = 1200 } = req.body;
  if (!text) return res.status(400).json({ error: 'No text provided' });

  const modeHint = mode === 'keypoints'
    ? 'Present the summary as a numbered list of key points.'
    : 'Write the summary as a coherent paragraph.';

  const systemPrompt = `You are an expert text summarizer. Create a concise summary of the provided text, not exceeding ${wordLimit} words.
${modeHint}
Capture all critical information and main ideas. The summary must be original and avoid plagiarism. Only return the summary, no other text.`;

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: text }
      ],
      model: 'llama-3.1-8b-instant',
      temperature: 0.3,
      max_tokens: 1024,
    });
    const summary = chatCompletion.choices[0]?.message?.content?.trim() || 'Could not summarize.';
    res.json({ summary });
  } catch (error) {
    console.error('Summarizer error:', error);
    res.status(500).json({ error: 'Failed to summarize text.' });
  }
});

// ══════════════════════════════════════════════════════════════
//  3. GRAMMAR CHECKER ENDPOINT
// ══════════════════════════════════════════════════════════════
app.post('/api/grammar-check', async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'No text provided' });

  const systemPrompt = `Analyze the provided text for spelling, grammar, punctuation, and word misuse errors.
Return your analysis as a JSON array. Each object must have three keys: "error" (the incorrect text), "correction" (the suggested fix), and "explanation" (a brief, user-friendly explanation of the rule).
If there are no errors, return an empty array [].
ONLY return the JSON array, no other text.`;

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: text }
      ],
      model: 'llama-3.1-8b-instant',
      temperature: 0.1,
      max_tokens: 1024,
    });
    let raw = chatCompletion.choices[0]?.message?.content?.trim() || '[]';
    raw = raw.replace(/```json|```/g, '').trim();
    // Find array boundaries
    const start = raw.indexOf('[');
    const end = raw.lastIndexOf(']');
    if (start !== -1 && end !== -1 && start < end) {
      raw = raw.substring(start, end + 1);
    }
    const corrections = JSON.parse(raw);
    res.json({ corrections });
  } catch (error) {
    console.error('Grammar check error:', error);
    res.status(500).json({ error: 'Failed to check grammar.' });
  }
});

// ══════════════════════════════════════════════════════════════
//  4. CITATION GENERATOR ENDPOINT
// ══════════════════════════════════════════════════════════════
const citationPrompt = `You are a helpful citation generator. When the user provides text, you will attempt to identify the source and generate a citation in the requested style (APA, MLA, or Chicago).
If you cannot find enough information, respond with: "I could not find enough information to generate a citation. Please provide the source details."

Format Guide:
- APA 7th: Author, A. A. (Year). Title of work: Capital letter also for subtitle. Publisher.
- MLA 9th: Author Last Name, First Name. *Title of Work*. Publisher, Year.
- Chicago (Notes-Bib): Author First Name Last Name, *Title of Work* (Place of Publication: Publisher, Year).

Respond ONLY with the formatted citation, ready to copy.`;

app.post('/api/cite', async (req, res) => {
  const { text, style = 'APA' } = req.body;
  if (!text) return res.status(400).json({ error: 'No text provided' });

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: citationPrompt },
        { role: 'user', content: `Generate a citation in ${style} format for the following content: "${text}"` }
      ],
      model: 'llama-3.1-8b-instant',
      temperature: 0.2,
      max_tokens: 512,
    });
    const citation = chatCompletion.choices[0]?.message?.content?.trim() || 'Could not generate citation.';
    res.json({ citation });
  } catch (error) {
    console.error('Citation error:', error);
    res.status(500).json({ error: 'Failed to generate citation.' });
  }
});

// ══════════════════════════════════════════════════════════════
//  5. TONE DETECTOR ENDPOINT
// ══════════════════════════════════════════════════════════════
app.post('/api/tone', async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'No text provided' });

  const systemPrompt = `Analyze the tone of the provided text. Identify the primary and secondary tones (e.g., Formal, Informal, Joyful, Sad, Optimistic, Pessimistic, Assertive, Aggressive, Confident, Insecure, Friendly, Hostile, Humorous, Serious, Sarcastic, Empathetic, Neutral).
Respond ONLY with a JSON object like this: {"primary": "Formal", "secondary": "Assertive", "confidence": 90}`;

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: text }
      ],
      model: 'llama-3.1-8b-instant',
      temperature: 0.2,
      max_tokens: 150,
    });
    let raw = chatCompletion.choices[0]?.message?.content?.trim() || '{}';
    raw = raw.replace(/```json|```/g, '').trim();
    const start = raw.indexOf('{');
    const end = raw.lastIndexOf('}');
    if (start !== -1 && end !== -1 && start < end) {
      raw = raw.substring(start, end + 1);
    }
    const tone = JSON.parse(raw);
    res.json(tone);
  } catch (error) {
    console.error('Tone detection error:', error);
    res.status(500).json({ error: 'Failed to detect tone.' });
  }
});

// ══════════════════════════════════════════════════════════════
//  6. AI / HUMAN DETECTION ENDPOINT
// ══════════════════════════════════════════════════════════════
app.post('/api/analyze', async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'No text provided' });

  const systemPrompt = `You are a forensic text analyst. Your job is to determine whether a piece of text was written by a human or generated by an AI.

First, check the text for the following indicators of AI generation:
- Overly uniform sentence lengths and structures.
- Repetition of phrases or ideas.
- Lack of emotional nuance, personal anecdotes, or spontaneity.
- Overuse of formal transitions ("moreover", "therefore", "in conclusion").
- Too perfect grammar with no minor errors.
- Generic, predictable statements and cliches.

Then, for human writing, look for:
- Variation in sentence rhythm and length.
- Occasional minor grammatical quirks (e.g., "um", "like", informal phrasing).
- Personal stories, humor, or subjective expressions.
- Contextual richness and unexpected word choices.

After your analysis, assign a percentage score for AI-generated content (aiPercentage) and human-written content (humanPercentage). The two must add to 100.

Respond ONLY with a valid JSON object in this exact format:
{"aiPercentage": number, "humanPercentage": number}`;

  let raw = '';
  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: text }
      ],
      model: 'llama-3.1-8b-instant',
      temperature: 0.2,
      max_tokens: 150,
    });

    raw = chatCompletion.choices[0]?.message?.content?.trim() || '{}';
    raw = raw.replace(/```json|```/g, '').trim();
    const start = raw.indexOf('{');
    const end = raw.lastIndexOf('}');
    if (start !== -1 && end !== -1 && start < end) {
      raw = raw.substring(start, end + 1);
    }

    const parsed = JSON.parse(raw);
    if (parsed.aiPercentage === undefined || parsed.humanPercentage === undefined) {
      throw new Error('Invalid analysis result');
    }
    // Ensure they sum to 100
    const total = parsed.aiPercentage + parsed.humanPercentage;
    parsed.aiPercentage = Math.round((parsed.aiPercentage / (total || 1)) * 100);
    parsed.humanPercentage = 100 - parsed.aiPercentage;

    res.json(parsed);
  } catch (error) {
    console.error('Analyze error:', error, 'Raw:', raw || 'none');
    res.status(500).json({ error: 'Analysis failed. The text may be too short or unusual.' });
  }
});

// ══════════════════════════════════════════════════════════════
//  START SERVER
// ══════════════════════════════════════════════════════════════
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`ParaBot running on http://localhost:${PORT}`));