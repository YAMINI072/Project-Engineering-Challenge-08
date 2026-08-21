const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;
const allowedOrigin = process.env.FRONTEND_URL || '*';

app.use(cors({ origin: allowedOrigin }));
app.use(express.json({ limit: '200kb' }));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'diffdraft-api', timestamp: new Date().toISOString() });
});

function validateDiff(diff) {
  if (typeof diff !== 'string' || diff.trim().length === 0) {
    return 'Paste a git diff before generating a description.';
  }
  if (diff.length > 120000) {
    return 'This diff is too large. Please paste a focused change set under 120,000 characters.';
  }
  return null;
}

function buildPrompt(diff) {
  return `You are a senior software engineer writing a concise, useful pull request description. Analyze the git diff below and return Markdown with exactly these sections: ## Summary, ## Why, ## What to Review, ## Testing. Be specific, do not invent behavior or tests, and call out uncertainty when the diff does not provide enough evidence.\n\nGIT DIFF:\n${diff}`;
}

async function generateDescription(diff) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error('AI service is not configured. Add OPENROUTER_API_KEY to the backend environment.');
  }

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.FRONTEND_URL || 'http://localhost:5173',
      'X-Title': 'DiffDraft'
    },
    body: JSON.stringify({
      model: 'openai/gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You turn code changes into accurate pull request documentation.' },
        { role: 'user', content: buildPrompt(diff) }
      ],
      temperature: 0.2,
      max_tokens: 900
    })
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload?.error?.message || 'The AI provider returned an error.');
  }
  return payload.choices?.[0]?.message?.content?.trim() || 'The AI provider returned an empty description.';
}

app.post('/api/generate', async (req, res) => {
  const validationError = validateDiff(req.body?.diff);
  if (validationError) return res.status(400).json({ error: validationError });

  try {
    const description = await generateDescription(req.body.diff);
    return res.json({ description, model: 'openai/gpt-4o-mini' });
  } catch (error) {
    console.error('Generation failed:', error.message);
    return res.status(502).json({ error: error.message });
  }
});

app.use((_req, res) => res.status(404).json({ error: 'Route not found.' }));

app.listen(port, () => console.log(`DiffDraft API listening on port ${port}`));
