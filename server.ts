import express from 'express';
import { generateAiResponse } from './src/lib/geminiClient';
import { evaluatePronunciation } from './src/lib/speechEngine';

const app = express();
app.use(express.json());

// Health check endpoint for Local AI & System
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    system: 'DialectAI Core Engine v1.0',
    localAiStatus: 'active',
    ollamaQwenModel: 'qwen2.5:3b-dialect-ready',
    geminiBackend: process.env.GEMINI_API_KEY ? 'connected' : 'fallback-mode',
    timestamp: new Date().toISOString()
  });
});

// Chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { text, dialect, history, scenarioPrompt } = req.body;
    const response = await generateAiResponse(text, dialect || 'en-US', history || [], scenarioPrompt);
    res.json(response);
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Chat generation failed' });
  }
});

// Pronunciation evaluation endpoint
app.post('/api/pronunciation', (req, res) => {
  try {
    const { targetPhrase, userTranscript, dialect } = req.body;
    const result = evaluatePronunciation(targetPhrase, userTranscript, dialect || 'en-US');
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Pronunciation evaluation failed' });
  }
});

const PORT = 3000;
if (process.env.NODE_ENV === 'production' && process.argv[1] && (process.argv[1].endsWith('server.ts') || process.argv[1].endsWith('server.js'))) {
  app.use(express.static('dist'));
  app.listen(PORT, () => {
    console.log(`DialectAI Server running on port ${PORT}`);
  });
}

export default app;
