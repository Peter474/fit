// Barcode reading for the Scan modal.
//
// Uses the browser's native BarcodeDetector where it exists (Chrome on
// Android — fast, hardware-assisted, and far better on phone video than any
// JS decoder), and falls back to ZXing everywhere else (iOS Safari, Firefox,
// desktop). We own the camera stream ourselves so we can ask for the rear
// camera at HD resolution with continuous autofocus — the defaults give a
// low-res, often front-facing feed in which retail barcodes can't be read.

const FORMATS = ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'code_39']

interface NativeDetector {
  detect(source: ImageBitmapSource): Promise<Array<{ rawValue: string }>>
}
type NativeDetectorCtor = new (options?: { formats?: string[] }) => NativeDetector

function getNativeDetector(): NativeDetector | null {
  const Ctor = (window as unknown as { BarcodeDetector?: NativeDetectorCtor }).BarcodeDetector
  if (!Ctor) return null
  try {
    return new Ctor({ formats: FORMATS })
  } catch {
    return null
  }
}

async function createZxingReader() {
  const { BrowserMultiFormatReader } = await import('@zxing/browser')
  const { DecodeHintType, BarcodeFormat } = await import('@zxing/library')
  const hints = new Map<number, unknown>()
  hints.set(DecodeHintType.POSSIBLE_FORMATS, [
    BarcodeFormat.EAN_13,
    BarcodeFormat.EAN_8,
    BarcodeFormat.UPC_A,
    BarcodeFormat.UPC_E,
    BarcodeFormat.CODE_128,
    BarcodeFormat.CODE_39,
  ])
  hints.set(DecodeHintType.TRY_HARDER, true)
  return new BrowserMultiFormatReader(hints)
}

/**
 * Starts the rear camera in `video` and calls `onCode` once with the first
 * barcode it reads. Returns a function that stops the camera and the scan.
 */
export async function startBarcodeScan(video: HTMLVideoElement, onCode: (code: string) => void): Promise<() => void> {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode: { ideal: 'environment' }, width: { ideal: 1920 }, height: { ideal: 1080 } },
    audio: false,
  })
  const track = stream.getVideoTracks()[0]
  try {
    await track.applyConstraints({ advanced: [{ focusMode: 'continuous' } as unknown as MediaTrackConstraintSet] })
  } catch {
    // Autofocus control isn't available everywhere — fine to skip.
  }

  video.srcObject = stream
  await video.play()

  let stopped = false
  let timer: ReturnType<typeof setInterval> | undefined
  let zxingStop: (() => void) | undefined

  const finish = (code: string) => {
    if (stopped) return
    stopped = true
    onCode(code)
  }

  const stop = () => {
    stopped = true
    if (timer) clearInterval(timer)
    zxingStop?.()
    stream.getTracks().forEach((t) => t.stop())
    video.srcObject = null
  }

  const native = getNativeDetector()
  if (native) {
    timer = setInterval(async () => {
      if (stopped || video.readyState < 2) return
      try {
        const found = await native.detect(video)
        if (found[0]?.rawValue) finish(found[0].rawValue)
      } catch {
        // A single failed frame is normal — keep scanning.
      }
    }, 200)
  } else {
    const reader = await createZxingReader()
    const controls = await reader.decodeFromStream(stream, video, (result) => {
      if (result) finish(result.getText())
    })
    zxingStop = () => controls.stop()
  }

  return stop
}

/** Reads a barcode out of a still photo (fallback when live scanning struggles). */
export async function decodeBarcodeFromFile(file: File): Promise<string> {
  const native = getNativeDetector()
  if (native) {
    try {
      const bitmap = await createImageBitmap(file)
      const found = await native.detect(bitmap)
      if (found[0]?.rawValue) return found[0].rawValue
    } catch {
      // fall through to ZXing
    }
  }
  const url = URL.createObjectURL(file)
  try {
    const reader = await createZxingReader()
    const result = await reader.decodeFromImageUrl(url)
    return result.getText()
  } catch {
    throw new Error("Couldn't find a barcode in that photo. Try a closer, sharper, well-lit shot — or type the number below.")
  } finally {
    URL.revokeObjectURL(url)
  }
}
