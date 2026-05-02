// api/generateContent.js
// Vercel Serverless Function — runs on Node.js, never exposed to the client
// OpenAI API key is read from Vercel Environment Variables (OPENAI_API_KEY)

import OpenAI from "openai";

const client = new OpenAI();

// Build the prompt sent to GPT-4o mini
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

  const safeMode = mode === 'creative' ? 'creative' : 'structured'

  try {
    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: safeMode === 'structured' ? 0.3 : 0.7,
      max_tokens: 800,
      messages: [
        {
          role: 'system',
          content: 'You convert raw event data into simple structured poster content and clear social media captions. Always return valid JSON only, no markdown.'
        },
        {
          role: 'user',
          content: buildPrompt(rawText.trim(), safeMode)
        }
      ]
    })

    const content = response.choices[0].message.content

    if (!content) {
      return res.status(502).json({ error: 'Empty response from OpenAI.' })
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

  } catch (err) {
    console.error('Unexpected error:', err)
    return res.status(500).json({ error: 'Internal server error.' })
  }
}

