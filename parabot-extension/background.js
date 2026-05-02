const BACKEND_URL = "https://parabot-nine.vercel.app";


// ─── Create context menus on install ───
chrome.runtime.onInstalled.addListener(() => {
  // Parent: Paraphrase
  chrome.contextMenus.create({ id: "parabot-paraphrase", title: "Paraphrase with ParaBot", contexts: ["selection"] });
  chrome.contextMenus.create({ id: "para-fluency", parentId: "parabot-paraphrase", title: "Fluency", contexts: ["selection"] });
  chrome.contextMenus.create({ id: "para-formal", parentId: "parabot-paraphrase", title: "Formal", contexts: ["selection"] });
  chrome.contextMenus.create({ id: "para-creative", parentId: "parabot-paraphrase", title: "Creative", contexts: ["selection"] });
  chrome.contextMenus.create({ id: "para-shorten", parentId: "parabot-paraphrase", title: "Shorten", contexts: ["selection"] });
  chrome.contextMenus.create({ id: "para-humanize", parentId: "parabot-paraphrase", title: "Humanize", contexts: ["selection"] });

  // Summarize
  chrome.contextMenus.create({ id: "parabot-summarize", title: "📝 Summarize with ParaBot", contexts: ["selection"] });

  // Grammar
  chrome.contextMenus.create({ id: "parabot-grammar", title: "✅ Check Grammar with ParaBot", contexts: ["selection"] });

  // Tone
  chrome.contextMenus.create({ id: "parabot-tone", title: "🎭 Detect Tone with ParaBot", contexts: ["selection"] });
});

// ─── Handle context menu clicks ───
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  const text = info.selectionText;
  if (!text) return;

  const menuId = info.menuItemId.toString();

  try {
    let result = '';

    // Paraphrase modes
    if (menuId.startsWith('para-')) {
      const mode = menuId.replace('para-', '');
      const res = await fetch(`${BACKEND_URL}/api/paraphrase`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, modes: [mode], synonymLevel: 50, grammarOnly: false })
      });
      const data = await res.json();
      result = data.paraphrasedText || data.error;
    }

    // Summarize
    if (menuId === 'parabot-summarize') {
      const res = await fetch(`${BACKEND_URL}/api/summarize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, mode: 'paragraph' })
      });
      const data = await res.json();
      result = data.summary || data.error;
    }

    // Grammar
    if (menuId === 'parabot-grammar') {
      const res = await fetch(`${BACKEND_URL}/api/grammar-check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
      const data = await res.json();
      if (data.corrections && data.corrections.length > 0) {
        result = data.corrections.map(c => `${c.error} → ${c.correction} (${c.explanation})`).join('\n');
      } else {
        result = '✅ No grammar errors found!';
      }
    }

    // Tone
    if (menuId === 'parabot-tone') {
      const res = await fetch(`${BACKEND_URL}/api/tone`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
      const data = await res.json();
      result = `Tone: ${data.primary} (Secondary: ${data.secondary}, Confidence: ${data.confidence}%)`;
    }

    if (result) {
      // Try to replace text in active element, otherwise show alert
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: (newText) => {
          const el = document.activeElement;
          if (el && (el.tagName === 'TEXTAREA' || el.tagName === 'INPUT')) {
            const start = el.selectionStart;
            const end = el.selectionEnd;
            el.value = el.value.slice(0, start) + newText + el.value.slice(end);
          } else {
            alert("ParaBot Result:\n\n" + newText);
          }
        },
        args: [result]
      });
    }

  } catch (error) {
    console.error("ParaBot Error:", error);
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icon.png',
      title: 'ParaBot Error',
      message: 'Could not connect to ParaBot server. Make sure it is running on localhost:5000.'
    });
  }
});
