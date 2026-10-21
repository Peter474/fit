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

export interface ScanStatus {
  detector: 'native' | 'zxing'
  width: number
  height: number
  frames: number
}

/**
 * Starts the rear camera in `video` and calls `onCode` once with the first
 * barcode it reads. Returns a function that stops the camera and the scan.
 *
 * We grab frames ourselves instead of handing the stream to a library: each
 * tick the middle band of the frame (where the viewfinder is) is cropped and
 * downscaled onto a canvas, which is what makes decoding both fast and
 * reliable on phones — a full 1080p frame is slow to decode and the bars
 * are a small part of it. The whole frame is tried every few ticks too, in
 * case the barcode isn't inside the guide.
 */
export async function startBarcodeScan(
  video: HTMLVideoElement,
  onCode: (code: string) => void,
  onStatus?: (status: ScanStatus) => void,
): Promise<() => void> {
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
  let timer: ReturnType<typeof setTimeout> | undefined

  const stop = () => {
    stopped = true
    if (timer) clearTimeout(timer)
    stream.getTracks().forEach((t) => t.stop())
    video.srcObject = null
  }

  const native = getNativeDetector()
  const zxing = await createZxingReader()
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) throw new Error('Canvas is not available in this browser.')

  let tick = 0
  let lastStatus = 0

  const grab = (full: boolean) => {
    const vw = video.videoWidth
    const vh = video.videoHeight
    const sx = full ? 0 : Math.round(vw * 0.05)
    const sy = full ? 0 : Math.round(vh * 0.25)
    const sw = full ? vw : Math.round(vw * 0.9)
    const sh = full ? vh : Math.round(vh * 0.5)
    const scale = Math.min(1, 1400 / sw)
    canvas.width = Math.max(1, Math.round(sw * scale))
    canvas.height = Math.max(1, Math.round(sh * scale))
    ctx.drawImage(video, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height)
  }

  const loop = async () => {
    if (stopped) return
    if (video.readyState >= 2 && video.videoWidth > 0) {
      tick++
      const full = tick % 5 === 0
      grab(full)

      let code: string | null = null
      if (native) {
        try {
          const found = await native.detect(canvas)
          if (found[0]?.rawValue) code = found[0].rawValue
        } catch {
          // ignore a bad frame
        }
      }
      // ZXing every tick when there's no native detector; as a backup every
      // 3rd tick when there is one.
      if (!code && (!native || tick % 3 === 0)) {
        try {
          code = zxing.decodeFromCanvas(canvas).getText()
        } catch {
          // NotFoundException on frames with no barcode is normal.
        }
      }

      if (code && !stopped) {
        stopped = true
        onCode(code)
        return
      }

      const now = Date.now()
      if (onStatus && now - lastStatus > 1000) {
        lastStatus = now
        onStatus({
          detector: native ? 'native' : 'zxing',
          width: video.videoWidth,
          height: video.videoHeight,
          frames: tick,
        })
      }
    }
    if (!stopped) timer = setTimeout(loop, 100)
  }
  timer = setTimeout(loop, 100)

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
