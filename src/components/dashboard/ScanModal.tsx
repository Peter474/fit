import { useEffect, useRef, useState } from 'react'
import { Camera, ScanBarcode, ImageUp, Loader2, ArrowLeft, Search } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { scanFoodPhoto } from '@/lib/scanFood'
import { lookupBarcode } from '@/lib/openFoodFacts'
import { startBarcodeScan, decodeBarcodeFromFile, type ScanStatus } from '@/lib/barcodeScanner'
import type { MealPrefill } from './MealModal'

interface ScanModalProps {
  open: boolean
  onClose: () => void
  onResult: (prefill: MealPrefill) => void
}

type Mode = 'choose' | 'photo' | 'barcode'

export function ScanModal({ open, onClose, onResult }: ScanModalProps) {
  const [mode, setMode] = useState<Mode>('choose')
  const [busy, setBusy] = useState(false)
  const [busyLabel, setBusyLabel] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [manualCode, setManualCode] = useState('')
  const [scanKey, setScanKey] = useState(0) // bump to restart the live camera
  const [scanStatus, setScanStatus] = useState<ScanStatus | null>(null)
  const [scanSeconds, setScanSeconds] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const barcodeFileRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  // The parent passes a fresh onResult every render. Keep it in a ref so it
  // never appears in an effect's deps — otherwise every parent re-render would
  // tear down and restart the camera.
  const onResultRef = useRef(onResult)
  useEffect(() => {
    onResultRef.current = onResult
  }, [onResult])

  useEffect(() => {
    if (open) {
      setMode('choose')
      setError(null)
      setBusy(false)
      setManualCode('')
    }
  }, [open])

  async function handleBarcode(code: string) {
    setError(null)
    setBusy(true)
    setBusyLabel('Looking up this product…')
    try {
      onResultRef.current(await lookupBarcode(code.trim()))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not look up that barcode.')
      setScanKey((k) => k + 1) // let them scan again
    } finally {
      setBusy(false)
    }
  }

  // Live camera scan while in 'barcode' mode.
  useEffect(() => {
    if (mode !== 'barcode' || !open) return
    const video = videoRef.current
    if (!video) return

    let cancelled = false
    let stop: (() => void) | undefined
    setError(null)
    setScanStatus(null)
    setScanSeconds(0)
    const startedAt = Date.now()
    const secondsTimer = setInterval(() => setScanSeconds(Math.floor((Date.now() - startedAt) / 1000)), 1000)

    startBarcodeScan(
      video,
      (code) => {
        if (!cancelled) void handleBarcode(code)
      },
      (status) => {
        if (!cancelled) setScanStatus(status)
      },
    )
      .then((s) => {
        if (cancelled) s()
        else stop = s
      })
      .catch((err) => {
        if (cancelled) return
        setError(
          err instanceof Error && err.name === 'NotAllowedError'
            ? 'Camera access was denied. Allow camera access for this site, or use the options below.'
            : 'Could not start the camera. Use the photo or manual options below.',
        )
      })

    return () => {
      cancelled = true
      clearInterval(secondsTimer)
      stop?.()
    }
    // handleBarcode only touches state setters and refs, so it is safe to omit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, open, scanKey])

  async function handleFoodPhoto(file: File | undefined) {
    if (!file) return
    setError(null)
    setBusy(true)
    setBusyLabel('Analyzing the photo with AI…')
    try {
      onResultRef.current(await scanFoodPhoto(file))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not analyze that photo.')
    } finally {
      setBusy(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  async function handleBarcodePhoto(file: File | undefined) {
    if (!file) return
    setError(null)
    setBusy(true)
    setBusyLabel('Reading the barcode…')
    try {
      const code = await decodeBarcodeFromFile(file)
      await handleBarcode(code)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not read that barcode.')
      setBusy(false)
    } finally {
      if (barcodeFileRef.current) barcodeFileRef.current.value = ''
    }
  }

  function handleManualSubmit() {
    const digits = manualCode.replace(/\D/g, '')
    if (digits.length < 8) {
      setError('Enter the full barcode number (8–13 digits).')
      return
    }
    void handleBarcode(digits)
  }

  function backToChoose() {
    setMode('choose')
    setError(null)
    setBusy(false)
  }

  const errorBox = error && (
    <p className="mt-3 rounded-xl border border-danger-dim bg-danger-dim/40 px-3 py-2 text-xs text-danger">{error}</p>
  )

  return (
    <Modal
      title={mode === 'choose' ? 'Scan' : mode === 'photo' ? 'Scan a food photo' : 'Scan a barcode'}
      open={open}
      onClose={onClose}
    >
      {mode === 'choose' && (
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => setMode('photo')}
            className="flex w-full items-center gap-3 rounded-xl border border-border-soft bg-surface-2 px-4 py-3.5 text-left transition-colors hover:bg-surface-3"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-energy-dim text-energy">
              <Camera size={17} strokeWidth={2.25} />
            </span>
            <span>
              <span className="block text-sm font-medium text-text-primary">Scan a food photo</span>
              <span className="block text-xs text-text-tertiary">AI-estimated calories &amp; macros from a photo</span>
            </span>
          </button>
          <button
            type="button"
            onClick={() => setMode('barcode')}
            className="flex w-full items-center gap-3 rounded-xl border border-border-soft bg-surface-2 px-4 py-3.5 text-left transition-colors hover:bg-surface-3"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-hydration-dim text-hydration">
              <ScanBarcode size={17} strokeWidth={2.25} />
            </span>
            <span>
              <span className="block text-sm font-medium text-text-primary">Scan a barcode</span>
              <span className="block text-xs text-text-tertiary">Looks up packaged products by barcode</span>
            </span>
          </button>
        </div>
      )}

      {mode === 'photo' && (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => void handleFoodPhoto(e.target.files?.[0])}
          />
          {busy ? (
            <div className="flex flex-col items-center gap-3 py-10 text-center">
              <Loader2 size={28} className="animate-spin text-text-secondary" />
              <p className="text-sm text-text-secondary">{busyLabel}</p>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex w-full flex-col items-center gap-3 rounded-xl border-2 border-dashed border-border-soft px-4 py-10 text-center transition-colors hover:border-text-tertiary"
            >
              <ImageUp size={24} className="text-text-tertiary" />
              <span className="text-sm text-text-secondary">Tap to take or choose a photo</span>
            </button>
          )}
          {errorBox}
          <Button variant="secondary" className="mt-4 w-full" onClick={backToChoose} disabled={busy}>
            <ArrowLeft size={14} /> Back
          </Button>
        </div>
      )}

      {mode === 'barcode' && (
        <div>
          <div className="relative overflow-hidden rounded-xl bg-surface-3">
            <video ref={videoRef} className="aspect-[4/3] w-full object-cover" muted playsInline autoPlay />
            {/* viewfinder guide */}
            <div className="pointer-events-none absolute inset-x-[10%] inset-y-[30%] rounded-lg border-2 border-success/70" />
            {busy && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-bg/80 text-center">
                <Loader2 size={24} className="animate-spin text-text-secondary" />
                <p className="text-xs text-text-secondary">{busyLabel}</p>
              </div>
            )}
          </div>
          <p className="mt-2 text-center text-xs text-text-tertiary">
            {!error && !busy && scanStatus
              ? scanSeconds >= 8
                ? "Still looking… hold the phone steady about 15–20 cm away, with good light, barcode flat inside the green frame."
                : 'Scanning — hold the barcode inside the green frame.'
              : 'Starting the camera…'}
          </p>
          {scanStatus && (
            <p className="mt-1 text-center text-[10px] text-text-tertiary/70">
              camera {scanStatus.width}×{scanStatus.height} · {scanStatus.detector} · {scanStatus.frames} frames checked
            </p>
          )}
          {errorBox}

          <div className="mt-4 flex gap-2">
            <input
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              inputMode="numeric"
              placeholder="Or type the barcode number"
              disabled={busy}
              className="min-w-0 flex-1 rounded-xl border border-border-soft bg-surface-2 px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-success/40"
            />
            <Button variant="secondary" onClick={handleManualSubmit} disabled={busy} aria-label="Look up barcode number">
              <Search size={15} />
            </Button>
          </div>

          <input
            ref={barcodeFileRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => void handleBarcodePhoto(e.target.files?.[0])}
          />
          <Button variant="secondary" className="mt-2 w-full" onClick={() => barcodeFileRef.current?.click()} disabled={busy}>
            <ImageUp size={14} /> Take a photo of the barcode instead
          </Button>
          <Button variant="secondary" className="mt-2 w-full" onClick={backToChoose} disabled={busy}>
            <ArrowLeft size={14} /> Back
          </Button>
        </div>
      )}
    </Modal>
  )
}
