# ParaBot — AI Writing Suite 🤖✍️

A full-featured AI-powered writing platform similar to QuillBot, built with **React**, **Tailwind CSS**, and the **Groq API** (Llama 3.1).

![ParaBot](https://img.shields.io/badge/ParaBot-AI%20Writing%20Suite-6366f1?style=for-the-badge)

## Features

| Tool | Description |
|---|---|
| ✍️ **Paraphraser** | 6 modes (Fluency, Formal, Creative, Expand, Shorten, Humanize) with synonym intensity slider |
| 📝 **Summarizer** | Paragraph or Key Points summary modes |
| ✅ **Grammar Checker** | Detects spelling, grammar, and punctuation errors with explanations |
| 📚 **Citation Generator** | Generate citations in APA, MLA, or Chicago format |
| 🎭 **Tone Detector** | Analyze emotional tone with confidence scoring |
| 🤖 **AI Detector** | Forensic analysis to detect AI-generated content |

## Tech Stack

- **Frontend:** React + TypeScript + Tailwind CSS + Vite
- **Backend:** Node.js + Express
- **AI:** Groq API (Llama 3.1 8B Instant)
- **Extension:** Chrome Manifest V3

## Setup

### 1. Backend
```bash
cd parabot-backend
npm install
# Add your Groq API key to .env
echo "GROQ_API_KEY=your_key_here" > .env
node server.js
```

### 2. Frontend
```bash
cd parabot-frontend
npm install
npm run dev
```

### 3. Chrome Extension
1. Go to `chrome://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked** → select `parabot-extension` folder

## License
MIT
