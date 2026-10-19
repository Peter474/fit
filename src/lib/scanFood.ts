export interface FoodScanResult {
  name: string
  calories: number
  proteinG: number
  carbsG: number
  fatG: number
  notes: string
}

const MAX_IMAGE_BYTES = 8 * 1024 * 1024 // 8MB

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      // result is "data:<mime>;base64,<data>" — strip the prefix.
      const commaIndex = result.indexOf(',')
      resolve(commaIndex >= 0 ? result.slice(commaIndex + 1) : result)
    }
    reader.onerror = () => reject(new Error('Could not read the selected file.'))
    reader.readAsDataURL(file)
  })
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
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error('That photo is too large — try a smaller image (under 8MB).')
  }

  const imageBase64 = await fileToBase64(file)

  let res: Response
  try {
    res = await fetch('/api/scan-food', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageBase64, mimeType: file.type }),
    })
  } catch {
    throw new Error('Network error — check your connection and try again.')
  }

  let body: unknown
  try {
    body = await res.json()
  } catch {
    throw new Error('The server returned an unexpected response. Please try again.')
  }

  if (!res.ok) {
    const message = (body as { error?: string })?.error
    throw new Error(message || 'Could not analyze that photo. Please try again.')
  }

  return body as FoodScanResult
}
