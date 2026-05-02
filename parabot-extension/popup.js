const BACKEND_URL = "https://parabot-nine.vercel.app";


const toolSelect = document.getElementById('toolSelect');
const modeSelect = document.getElementById('modeSelect');
const actionBtn = document.getElementById('actionBtn');
const inputText = document.getElementById('inputText');
const outputText = document.getElementById('outputText');
const loading = document.getElementById('loading');
const copyBtn = document.getElementById('copyBtn');

// Show/hide mode selector based on tool
toolSelect.addEventListener('change', () => {
  modeSelect.style.display = toolSelect.value === 'paraphrase' ? 'block' : 'none';
});

actionBtn.addEventListener('click', async () => {
  const text = inputText.value.trim();
  if (!text) return;

  const tool = toolSelect.value;
  loading.classList.remove('hidden');
  actionBtn.disabled = true;
  outputText.value = '';
  copyBtn.classList.add('hidden');

  try {
    let endpoint = '';
    let body = {};

    switch (tool) {
      case 'paraphrase':
        endpoint = '/api/paraphrase';
        body = { text, modes: [modeSelect.value], synonymLevel: 50, grammarOnly: false };
        break;
      case 'summarize':
        endpoint = '/api/summarize';
        body = { text, mode: 'paragraph' };
        break;
      case 'grammar':
        endpoint = '/api/grammar-check';
        body = { text };
        break;
      case 'tone':
        endpoint = '/api/tone';
        body = { text };
        break;
      case 'ai-detect':
        endpoint = '/api/analyze';
        body = { text };
        break;
    }

    const res = await fetch(BACKEND_URL + endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    const data = await res.json();
    let result = '';

    switch (tool) {
      case 'paraphrase':
        result = data.paraphrasedText || data.error;
        break;
      case 'summarize':
        result = data.summary || data.error;
        break;
      case 'grammar':
        if (data.corrections && data.corrections.length > 0) {
          result = data.corrections.map(c => `❌ ${c.error}\n✅ ${c.correction}\n💡 ${c.explanation}`).join('\n\n');
        } else {
          result = '✅ No grammar errors found!';
        }
        break;
      case 'tone':
        result = `🎭 Primary: ${data.primary}\n🎭 Secondary: ${data.secondary}\n📊 Confidence: ${data.confidence}%`;
        break;
      case 'ai-detect':
        result = `🤖 AI: ${data.aiPercentage}%\n✍️ Human: ${data.humanPercentage}%`;
        break;
    }

    outputText.value = result;
    copyBtn.classList.remove('hidden');
  } catch (err) {
    outputText.value = 'Error: Could not connect to backend.';
  } finally {
    loading.classList.add('hidden');
    actionBtn.disabled = false;
  }
});

copyBtn.addEventListener('click', () => {
  navigator.clipboard.writeText(outputText.value);
  copyBtn.innerText = '✓ Copied!';
  setTimeout(() => copyBtn.innerText = '📋 Copy Result', 2000);
});
