import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Initialize GoogleGenAI SDK (reads GEMINI_API_KEY from process.env)
const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

// ==========================================
// API ROUTE: AI Tutor & Chat Support
// ==========================================
app.post('/api/chat', async (req, res) => {
  try {
    const { message, history = [], context = {} } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    if (!ai) {
      // Fallback response if API key is not yet set
      return res.json({
        reply: `[Udyama Tutor Assistant] I received your question about "${message.slice(0, 40)}...". (AI key not detected in environment; please check GEMINI_API_KEY in Secrets). Here is a standard guidance note: Focus on defining the metrics clearly, practicing SQL aggregations with CTEs, and breaking complex problems into verifiable milestones.`,
      });
    }

    const systemInstruction = `You are the Udyama Career & Learning Intelligence Tutor, built directly into the Udyama Productivity OS.
Your audience: career switchers, data analysts, business analysts, software engineers, and learners preparing for technical roles.
Core principles:
1. Be concise, pedagogical, and rigorous. Never use marketing fluff.
2. If the user asks for code (SQL, Python, TypeScript), provide well-commented, production-ready syntax.
3. If they ask about metrics or business cases, break down the KPIs (e.g. CAC, LTV, Retention cohorts) step-by-step.
4. Recommend actionable next tasks they can schedule into their daily Udyama task queue.
Context: User is focusing on ${context.targetRole || 'Data Analyst & Software Engineering'}, current study track: ${context.trackSlug || 'data-analyst'}.`;

    const chatContents = [
      ...history.slice(-6).map((msg: { role: string; content: string }) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }],
      })),
      {
        role: 'user',
        parts: [{ text: message }],
      },
    ];

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: chatContents,
      config: {
        systemInstruction,
        temperature: 0.6,
      },
    });

    const reply = response.text || 'I could not generate an answer right now. Please try rephrasing.';
    return res.json({ reply });
  } catch (error: any) {
    console.error('Gemini API Error in /api/chat:', error);
    return res.status(500).json({
      error: 'Failed to generate response from AI Tutor',
      details: error?.message || String(error),
    });
  }
});

// ==========================================
// API ROUTE: Mock Interview Evaluation
// ==========================================
app.post('/api/interview/evaluate', async (req, res) => {
  try {
    const { questionPrompt, questionCategory, candidateAnswer, targetRole = 'Data Analyst' } = req.body;

    if (!candidateAnswer || typeof candidateAnswer !== 'string') {
      return res.status(400).json({ error: 'Candidate answer is required' });
    }

    if (!ai) {
      return res.json({
        score: 78,
        clarityScore: 80,
        technicalScore: 75,
        communicationScore: 80,
        strengths: ['Addressed the main question', 'Clear terminology'],
        improvements: ['Include more specific metric examples', 'Adopt the STAR framework (Situation, Task, Action, Result)'],
        revisedModelAnswer: 'A high-impact answer begins by framing the business objective, defining the quantitative metrics, detailing your analytical steps, and concluding with measured ROI.',
      });
    }

    const evaluationPrompt = `You are a Senior Hiring Manager and Interview Evaluator for ${targetRole} positions at a premier technology company.
Evaluate the following candidate response to an interview question.

Question: "${questionPrompt}"
Category: "${questionCategory}"
Candidate Response: "${candidateAnswer}"

Return your evaluation strictly as valid JSON matching this schema:
{
  "score": number (0-100),
  "clarityScore": number (0-100),
  "technicalScore": number (0-100),
  "communicationScore": number (0-100),
  "strengths": string[],
  "improvements": string[],
  "revisedModelAnswer": string
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: evaluationPrompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Gemini API Error in /api/interview/evaluate:', error);
    return res.status(500).json({
      error: 'Failed to evaluate interview response',
      details: error?.message || String(error),
    });
  }
});

// ==========================================
// API ROUTE: Quick Fact / Micro-Learning
// ==========================================
app.get('/api/daily-fact', async (_req, res) => {
  try {
    if (!ai) {
      return res.json({
        fact: "PostgreSQL's DENSE_RANK() function never skips rank numbers after ties, unlike RANK() which leaves gaps (e.g. 1, 2, 2, 4 vs 1, 2, 2, 3).",
        domain: "SQL & Databases",
        source: "PostgreSQL Official Documentation",
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Provide one verified, fascinating, and high-yield technical micro-fact for a Data Analyst, Software Engineer, or Business Analyst.
Return JSON with { "fact": string, "domain": string, "source": string }. Keep "fact" under 40 words.`,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (e) {
    return res.json({
      fact: "In cohort retention analyses, computing Day 1, Day 7, and Day 30 retention provides an early warning signal of churn weeks before monthly active user numbers drop.",
      domain: "Analytics & Product",
      source: "Product Analytics Handbook",
    });
  }
});

// ==========================================
// Vite Middleware / Static Serving
// ==========================================
async function setupApp() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Udyama Full-Stack OS running on http://localhost:${port}`);
  });
}

setupApp();
