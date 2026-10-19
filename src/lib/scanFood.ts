export interface FoodScanResult {
  name: string
  calories: number
  proteinG: number
  carbsG: number
  fatG: number
  notes: string
}

const MAX_INPUT_BYTES = 25 * 1024 * 1024 // refuse absurdly large originals
const MAX_DIMENSION = 1280 // px — plenty for Gemini to recognise food
const JPEG_QUALITY = 0.8

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      const commaIndex = result.indexOf(',')
      resolve(commaIndex >= 0 ? result.slice(commaIndex + 1) : result)
    }
    reader.onerror = () => reject(new Error('Could not read the selected file.'))
    reader.readAsDataURL(blob)
  })
}

/**
 * Phone photos are routinely 3–10 MB, but Vercel serverless functions reject
 * request bodies over 4.5 MB (with a plain-text error, not JSON). Downscaling
 * to ~1280px JPEG brings a photo to ~100–300 KB, which also makes the AI call
 * much faster, with no meaningful loss for recognising a meal.
 */
async function compressImage(file: File): Promise<{ base64: string; mimeType: string }> {
  try {
    const bitmap = await createImageBitmap(file)
    const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height))
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(bitmap.width * scale)
    canvas.height = Math.round(bitmap.height * scale)
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('no canvas')
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
    bitmap.close()
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', JPEG_QUALITY))
    if (!blob) throw new Error('no blob')
    return { base64: await blobToBase64(blob), mimeType: 'image/jpeg' }
  } catch {
    // Browser couldn't decode it (e.g. an unusual format). Only send the
    // original if it's small enough to fit under the server's body limit.
    if (file.size > 3 * 1024 * 1024) {
      throw new Error("Couldn't process that photo. Try taking it again with the camera, or pick a JPEG/PNG.")
    }
    return { base64: await blobToBase64(file), mimeType: file.type }
  }
}

/**
 * Sends a food photo to the server-side Gemini endpoint and returns an
 * estimated nutrition breakdown. Throws a user-facing error message on
 * failure — callers should catch and display `err.message` directly.
 */
export async function scanFoodPhoto(file: File): Promise<FoodScanResult> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Please choose an image file.')
  }
  if (file.size > MAX_INPUT_BYTES) {
    throw new Error('That photo is too large — try a smaller image.')
  }

  const { base64, mimeType } = await compressImage(file)

  let res: Response
  try {
    res = await fetch('/api/scan-food', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageBase64: base64, mimeType }),
    })
  } catch {
    throw new Error('Network error — check your connection and try again.')
  }

  const raw = await res.text()
  let body: unknown = null
  try {
    body = JSON.parse(raw)
  } catch {
    // Not JSON — the request never reached our function, or it crashed.
  }

  if (body === null) {
    if (res.status === 404) {
      throw new Error(
        "The scan endpoint (/api/scan-food) wasn't found. The api/ folder may not have been deployed to Vercel — check that api/scan-food.ts is in your repo, then redeploy.",
      )
    }
    if (res.status === 413) throw new Error('That photo is too large for the server. Try again.')
    throw new Error(`The server failed (status ${res.status}). Check the function logs in Vercel → Deployments → Functions.`)
  }

  if (!res.ok) {
    const message = (body as { error?: string }).error
    throw new Error(message || `Could not analyze that photo (status ${res.status}).`)
  }

  return body as FoodScanResult
}
