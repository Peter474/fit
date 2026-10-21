import type { VercelRequest, VercelResponse } from '@vercel/node'

/**
 * POST /api/scan-food
 * Body: { imageBase64: string (no data: prefix), mimeType: string }
 * Returns: { name, calories, proteinG, carbsG, fatG, notes }
 *
 * This runs server-side ONLY so that GEMINI_API_KEY is never shipped to the
 * browser. It is intentionally NOT prefixed with VITE_ — a VITE_ env var is
 * bundled into the client JS and would be extractable by anyone, unlike the
 * Firebase web config (which is meant to be public). A Gemini key is a
 * billable credential and must stay server-side.
 */

const RESPONSE_SCHEMA = {
  type: 'OBJECT',
  properties: {
    name: { type: 'STRING', description: 'Short, specific dish/food name, e.g. "Grilled chicken with rice".' },
    calories: { type: 'NUMBER', description: 'Estimated total calories (kcal) for the whole visible portion.' },
    proteinG: { type: 'NUMBER', description: 'Estimated protein in grams for the whole visible portion.' },
    carbsG: { type: 'NUMBER', description: 'Estimated carbohydrates in grams for the whole visible portion.' },
    fatG: { type: 'NUMBER', description: 'Estimated fat in grams for the whole visible portion.' },
    notes: {
      type: 'STRING',
      description:
        'One short sentence noting this is an AI estimate and naming the biggest assumption made (e.g. portion size, hidden oil/sauce).',
    },
  },
  required: ['name', 'calories', 'proteinG', 'carbsG', 'fatG', 'notes'],
}

const PROMPT = `You are a nutrition-estimation assistant inside a food-logging app. Look at this photo of food and estimate its nutrition for the FULL portion visible in the photo (not per 100g).

Be a careful, realistic estimator: identify the dish, approximate its visible portion size, and account for typical oil/sauce/dressing even if not fully visible. If multiple distinct food items are visible, combine them into one entry with a name that lists the main components.

Respond ONLY with the structured JSON fields requested — no extra commentary outside those fields.`

interface GeminiApiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>
    }
  }>
}

interface GeminiResult {
  name: string
  calories: number
  proteinG: number
  carbsG: number
  fatG: number
  notes: string
}

function isValidResult(value: unknown): value is GeminiResult {
  if (typeof value !== 'object' || value === null) return false
  const v = value as Record<string, unknown>
  return (
    typeof v.name === 'string' &&
    typeof v.calories === 'number' &&
    typeof v.proteinG === 'number' &&
    typeof v.carbsG === 'number' &&
    typeof v.fatG === 'number' &&
    typeof v.notes === 'string'
  )
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed.' })
    return
  }

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    res.status(500).json({
      error: 'GEMINI_API_KEY is not set on the server. Add it in Vercel → Project Settings → Environment Variables.',
    })
    return
  }

  const { imageBase64, mimeType } = (req.body ?? {}) as { imageBase64?: string; mimeType?: string }
  if (!imageBase64 || !mimeType) {
    res.status(400).json({ error: 'Missing imageBase64 or mimeType in request body.' })
    return
  }
  if (!mimeType.startsWith('image/')) {
    res.status(400).json({ error: 'mimeType must be an image type.' })
    return
  }
  // Base64 inflates size by ~33%; cap the raw image around 8MB to stay well
  // under Gemini's request limits and avoid abuse of the endpoint.
  if (imageBase64.length > 11_000_000) {
    res.status(413).json({ error: 'Image is too large. Try a smaller photo.' })
    return
  }

  // Google retires Gemini model versions quickly (gemini-2.0-flash shut down on
  // 1 Jun 2026, gemini-2.5-flash on 16 Oct 2026), so default to the
  // `gemini-flash-latest` alias, which always points at the current Flash
  // model. Set GEMINI_MODEL to pin a specific one.
  const model = process.env.GEMINI_MODEL || 'gemini-flash-latest'
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`

  try {
    const buildBody = (fast: boolean) =>
      JSON.stringify({
        contents: [
          {
            parts: [{ text: PROMPT }, { inline_data: { mime_type: mimeType, data: imageBase64 } }],
          },
        ],
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: RESPONSE_SCHEMA,
          temperature: 0.2,
          maxOutputTokens: 400,
          // Newer Flash models "think" before answering, which adds many
          // seconds and isn't needed to estimate a meal. Turn it off.
          ...(fast ? { thinkingConfig: { thinkingBudget: 0 } } : {}),
        },
      })

    const call = (fast: boolean) =>
      fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: buildBody(fast) })

    let geminiRes = await call(true)
    if (geminiRes.status === 400) {
      // Some models reject the thinking setting — retry without it.
      geminiRes = await call(false)
    }

    if (!geminiRes.ok) {
      const errBody = await geminiRes.text()
      console.error('Gemini API error', geminiRes.status, errBody)
      let detail = ''
      try {
        detail = (JSON.parse(errBody) as { error?: { message?: string } }).error?.message ?? ''
      } catch {
        // body wasn't JSON — ignore
      }
      detail = detail.slice(0, 200)
      if (geminiRes.status === 404) {
        res.status(502).json({
          error: `Gemini model "${model}" isn't available (it may have been retired). In Vercel set GEMINI_MODEL to a current model, e.g. gemini-flash-latest, then redeploy.`,
        })
      } else if (geminiRes.status === 400 || geminiRes.status === 403) {
        res.status(502).json({ error: `Gemini rejected the request${detail ? `: ${detail}` : ' — check GEMINI_API_KEY is valid and enabled.'}` })
      } else if (geminiRes.status === 429) {
        res.status(429).json({ error: 'Gemini rate limit or quota reached. Please wait a moment and try again.' })
      } else {
        res.status(502).json({ error: `The AI service failed (status ${geminiRes.status})${detail ? `: ${detail}` : '.'}` })
      }
      return
    }

    const data = (await geminiRes.json()) as GeminiApiResponse
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text
    if (!text) {
      console.error('Gemini returned no content', JSON.stringify(data))
      res.status(502).json({ error: 'The AI service returned an empty result. Please try again.' })
      return
    }

    let parsed: unknown
    try {
      parsed = JSON.parse(text)
    } catch (err) {
      console.error('Failed to parse Gemini JSON', text, err)
      res.status(502).json({ error: "Couldn't read the AI's response. Please try again." })
      return
    }

    if (!isValidResult(parsed)) {
      console.error('Gemini JSON missing expected fields', parsed)
      res.status(502).json({ error: "The AI's response was incomplete. Please try again." })
      return
    }

    // Clamp to sane non-negative numbers — never trust the model blindly.
    const clean: GeminiResult = {
      name: parsed.name.slice(0, 80),
      calories: Math.max(0, Math.round(parsed.calories)),
      proteinG: Math.max(0, Math.round(parsed.proteinG)),
      carbsG: Math.max(0, Math.round(parsed.carbsG)),
      fatG: Math.max(0, Math.round(parsed.fatG)),
      notes: parsed.notes.slice(0, 200),
    }

    res.status(200).json(clean)
  } catch (err) {
    console.error('scan-food handler error', err)
    res.status(500).json({ error: 'Something went wrong analyzing the photo. Please try again.' })
  }
}
