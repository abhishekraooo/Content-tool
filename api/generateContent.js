// api/generateContent.js
// Vercel Serverless Function — runs on Node.js, never exposed to the client
// API keys are read from Vercel Environment Variables (GEMINI_API_KEY, GROQ_API_KEY)

import { GoogleGenAI } from "@google/genai";
import Groq from "groq-sdk";

// Build the prompt sent to AI
function buildPrompt(rawText, mode) {
  const modeInstruction =
    mode === 'structured'
      ? 'Use clean, professional, predictable language. No flair.'
      : 'Be slightly engaging and warm, but keep it simple and concise.'

  return `
Extract information from the raw text below and generate poster content and social media captions.

Raw text:
"""
${rawText}
"""

Instructions:
- ${modeInstruction}
- Extract: team name, event/hackathon name, position/achievement, location, member names.
- Generate all fields listed below.
- Return ONLY a valid JSON object. No explanation, no markdown, no code fences.

JSON format:
{
  "poster": {
    "title": "Short punchy title for the poster (e.g., '1st Place Win!')",
    "achievement": "Clear achievement statement (e.g., '1st Place at XYZ Hackathon')",
    "teamName": "Team name",
    "members": "Comma-separated member names",
    "location": "City or venue",
    "highlightLine": "1-2 line motivational or descriptive line for the poster"
  },
  "media": {
    "instagramCaption": "Full Instagram caption with context and emotion (2-4 sentences)",
    "shortCaption": "One punchy sentence for Twitter/LinkedIn",
    "storyCaption": "Short 1-2 line caption for Instagram/WhatsApp story",
    "hashtags": "8-10 relevant hashtags separated by spaces"
  }
}
`.trim()
}

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' })
  }

  const { rawText, mode } = req.body

  // Basic validation
  if (!rawText || typeof rawText !== 'string' || !rawText.trim()) {
    return res.status(400).json({ error: 'rawText is required.' })
  }

  // Read API keys from environment
  const geminiApiKey = process.env.GEMINI_API_KEY;
  const groqApiKey = process.env.GROQ_API_KEY;

  if (!geminiApiKey && !groqApiKey) {
    console.error('Neither GEMINI_API_KEY nor GROQ_API_KEY is set.');
    return res.status(500).json({ error: 'Server configuration error.' });
  }

  const safeMode = mode === 'creative' ? 'creative' : 'structured'
  const systemPrompt = 'You convert raw event data into simple structured poster content and clear social media captions. Always return valid JSON only, no markdown.';
  const userPrompt = buildPrompt(rawText.trim(), safeMode);
  
  let content = null;

  // 1. Try Gemini First
  if (geminiApiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey: geminiApiKey });
      const fullPrompt = `${systemPrompt}\n\n${userPrompt}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: fullPrompt,
      });

      content = response.text;
      console.log("Successfully generated content using Gemini.");
    } catch (err) {
      console.warn("Gemini failed, falling back to Groq:", err.message);
    }
  }

  // 2. Fallback to Groq
  if (!content && groqApiKey) {
    try {
      const groq = new Groq({ apiKey: groqApiKey });
      const chatCompletion = await groq.chat.completions.create({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        model: "llama-3.3-70b-versatile",
        temperature: safeMode === 'structured' ? 0.3 : 0.7,
      });

      content = chatCompletion.choices[0].message.content;
      console.log("Successfully generated content using Groq.");
    } catch (err) {
      console.error("Groq fallback also failed:", err.message);
    }
  }

  if (!content) {
    return res.status(502).json({ error: 'All AI providers failed. Please check limits or try again.' })
  }

  // Strip any accidental markdown fences and parse JSON
  const cleaned = content.replace(/```json|```/g, '').trim()
  let parsed

  try {
    parsed = JSON.parse(cleaned)
  } catch {
    console.error('JSON parse failed. Raw content:', content)
    return res.status(502).json({ error: 'Could not parse model response. Try again.' })
  }

  if (!parsed.poster || !parsed.media) {
    return res.status(502).json({ error: 'Model returned unexpected structure.' })
  }

  return res.status(200).json(parsed)
}
