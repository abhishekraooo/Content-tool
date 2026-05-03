// api/generateContent.js
// Vercel Serverless Function — runs on Node.js, never exposed to the client
// API keys are read from Vercel Environment Variables (GEMINI_API_KEY, GROQ_API_KEY)

import { GoogleGenAI } from "@google/genai";
import Groq from "groq-sdk";

// Build the prompt sent to AI
function buildPrompt(rawText, mode, outputType) {
  const modeInstruction = mode === 'structured'
    ? 'Use formal, professional, congratulatory language. Clean and predictable.'
    : 'Use warm, slightly expressive language. Can use 1-2 relevant emojis for achievements (🏆🥈🥉). Still concise.'

  let jsonFormat = '';

  if (outputType === 'both') {
    jsonFormat = `{
  "poster": {
    "title": "Short punchy title or highlight line (e.g. '1st Place at Robo Habba 2026')",
    "names": "Full individual or member name(s)",
    "description": "Complete detailed description with individual or members name, event details, achievement and every detail"
  },
  "media": {
    "fullCaption": "Complete ready-to-post caption modelled closely on the examples above. Include all details — names, semester, event, date, prize, project if available. End with the highlight line.",
    "shortCaption": "One punchy sentence for quick sharing",
    "storyCaption": "2-3 lines for Instagram/WhatsApp story — punchy and visual",
    "hashtags": "All hashtags space-separated"
  },
  "niche": "one of: placement | hackathon | technical | cultural | academic"
}`;
  } else if (outputType === 'poster') {
    jsonFormat = `{
  "poster": {
    "title": "Short punchy title or highlight line (e.g. '1st Place at Robo Habba 2026')",
    "names": "Full individual or member name(s)",
    "description": "Complete detailed description with individual or members name, event details, achievement and every detail"
  },
  "niche": "one of: placement | hackathon | technical | cultural | academic"
}`;
  } else if (outputType === 'media') {
    jsonFormat = `{
  "media": {
    "fullCaption": "Complete ready-to-post caption modelled closely on the examples above. Include all details — names, semester, event, date, prize, project if available. End with the highlight line.",
    "shortCaption": "One punchy sentence for quick sharing",
    "storyCaption": "2-3 lines for Instagram/WhatsApp story — punchy and visual",
    "hashtags": "All hashtags space-separated"
  },
  "niche": "one of: placement | hackathon | technical | cultural | academic"
}`;
  }

  return `
You generate achievement post content for the Department of Robotics & AI (RAI), 
Bangalore Institute of Technology (BIT Bangalore).

Study these real examples from the team to understand tone, structure, and style:

EXAMPLE 1 (Placement):
"We are pleased to share that Alice Smith from the Department of Robotics & AI 
has been successfully placed at Toyota as a Graduate Engineer Trainee.
Wishing her great success and a promising career ahead.
#Congratulations #ProudMoment #BITBangalore #DepartmentOfRAI #campusplacement"

EXAMPLE 2 (Cultural - Music):
"Congratulations to Team Diminished 7th!
Secured 1st Prize with a cash award of ₹8000 at the Battle of Bands (24/04/26, Manthan Fest).
A great reflection of their talent and teamwork—keep rocking!"

EXAMPLE 3 (Cultural - Poetry):
"Congratulations to John Doe!
Secured 2nd Prize with a cash award of ₹1000 in the Poetry Competition (25/04/26).
A wonderful reflection of his creativity and passion."

EXAMPLE 4 (Technical - Multiple wins):
"Students of RAI DEPT, Michael Johnson and David Lee (RAI, 6th Sem) excelled 
at Robo Habba 2026, Acharya Institute of Technology.
🏆 Winners – Robo Exhibition
🥈 Runners-Up – Robo Triathlon
For their Unconditional Learning Native AI with SynapticX-6X.
A proud moment for the department."

EXAMPLE 5 (Cultural - Film, detailed):
"Proudly representing the Department of Robotics & Artificial Intelligence at Manthan 2026,
Emma (4th sem) and Oliver (6th sem) secured 1st Place in the Short Film 
Competition, along with a cash prize of ₹3000.
Their film Goodmann, written by Emma and co-directed by Emma and Oliver, 
beautifully portrays a heartfelt reunion between two best friends.
A commendable achievement that reflects creativity and teamwork!"

---

Now process this raw input:
"""
${rawText}
"""

Instructions:
- ${modeInstruction}
- Extract EVERY detail present in the raw text. Do not skip or generalise any field.
- If event date is mentioned, always include it in the poster and captions.
- If cash prize is mentioned, always include the exact amount with ₹ symbol.
- If semester/year of students is mentioned, include it in brackets after their name.
- If a project name or work title is mentioned, include it.
- If multiple achievements are mentioned (e.g. winner of one + runner-up of another), 
  list each separately using 🏆🥈🥉 in creative mode, or numbered list in structured mode.
- Department name: always "Department of Robotics & AI" (short: "RAI Dept")
- Institution: always "Bangalore Institute of Technology" (short: "BIT Bangalore")
- Detect the niche from the content:
    "placement"  → job placement, internship
    "hackathon"  → coding, tech competition, hackathon
    "technical"  → robotics, project expo, technical fest
    "cultural"   → music, dance, film, art, poetry, drama, sports
    "academic"   → paper presentation, quiz, debate

Hashtag rules:
- Always include: #BangaloreInstituteofTechnology #BITBangalore #DepartmentOfRAI
- Add niche-specific tags:
    placement  → #CampusPlacement #ProudMoment #Congratulations
    hackathon  → #HackathonWinners #TechAchievement #Coding
    technical  → #RoboCell #TechnicalFest #Innovation
    cultural   → #Manthan (or actual event name) #CulturalFest #Talent
    academic   → #AcademicExcellence #ProudMoment
- Add event name as a hashtag (remove spaces, capitalise each word)
- Total hashtags: 8-12
- Format: space-separated, each starting with #, no commas

Return ONLY a valid JSON object. No explanation, no markdown, no code fences.

JSON format:
${jsonFormat}
`.trim()
}

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' })
  }

  const { rawText, mode = 'structured', outputType = 'both' } = req.body

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
  const userPrompt = buildPrompt(rawText.trim(), safeMode, outputType);
  
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

  if (outputType === 'both' && (!parsed.poster || !parsed.media)) {
    return res.status(502).json({ error: 'Model returned unexpected structure (missing both poster and media).' })
  }
  if (outputType === 'poster' && !parsed.poster) {
    return res.status(502).json({ error: 'Model returned unexpected structure (missing poster).' })
  }
  if (outputType === 'media' && !parsed.media) {
    return res.status(502).json({ error: 'Model returned unexpected structure (missing media).' })
  }

  return res.status(200).json(parsed)
}
