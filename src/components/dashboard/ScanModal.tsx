import { useEffect, useRef, useState } from 'react'
import { Camera, ScanBarcode, ImageUp, Loader2, ArrowLeft } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { scanFoodPhoto } from '@/lib/scanFood'
import { lookupBarcode } from '@/lib/openFoodFacts'
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
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const stoppedRef = useRef(false)

  // Reset to the picker every time the modal is (re)opened.
  useEffect(() => {
    if (open) {
      setMode('choose')
      setError(null)
      setBusy(false)
    }
  }, [open])

  // Run the live barcode scanner while in 'barcode' mode; always release the
  // camera when leaving that mode or closing the modal.
  useEffect(() => {
    if (mode !== 'barcode' || !open) return
    stoppedRef.current = false
    setError(null)
    setBusy(false)

    let cancelled = false
    ;(async () => {
      try {
        const { BrowserMultiFormatReader } = await import('@zxing/browser')
        const reader = new BrowserMultiFormatReader()
        if (cancelled || !videoRef.current) return
        const result = await reader.decodeOnceFromVideoDevice(undefined, videoRef.current)
        if (cancelled || stoppedRef.current) return
        stoppedRef.current = true
        setBusy(true)
        try {
          const prefill = await lookupBarcode(result.getText())
          if (!cancelled) onResult(prefill)
        } catch (err) {
          if (!cancelled) setError(err instanceof Error ? err.message : 'Could not look up that barcode.')
        } finally {
          if (!cancelled) setBusy(false)
        }
      } catch (err) {
        if (!cancelled) {
          const message =
            err instanceof Error && err.name === 'NotAllowedError'
              ? 'Camera access was denied. Allow camera access for this site and try again.'
              : 'Could not start the camera. Your browser may not support this, or no camera is available.'
          setError(message)
        }
      }
    })()

    return () => {
      cancelled = true
      stoppedRef.current = true
      import('@zxing/browser').then(({ BrowserMultiFormatReader }) => {
        BrowserMultiFormatReader.releaseAllStreams()
      })
    }
  }, [mode, open, onResult])

  async function handleFileChosen(file: File | undefined) {
    if (!file) return
    setError(null)
    setBusy(true)
    try {
      const prefill = await scanFoodPhoto(file)
      onResult(prefill)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not analyze that photo.')
    } finally {
      setBusy(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  function backToChoose() {
    setMode('choose')
    setError(null)
    setBusy(false)
  }

  return (
    <Modal title={mode === 'choose' ? 'Scan' : mode === 'photo' ? 'Scan a food photo' : 'Scan a barcode'} open={open} onClose={onClose}>
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
            onChange={(e) => handleFileChosen(e.target.files?.[0])}
          />
          {busy ? (
            <div className="flex flex-col items-center gap-3 py-10 text-center">
              <Loader2 size={28} className="animate-spin text-text-secondary" />
              <p className="text-sm text-text-secondary">Analyzing the photo with AI…</p>
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
          {error && <p className="mt-3 rounded-xl border border-danger-dim bg-danger-dim/40 px-3 py-2 text-xs text-danger">{error}</p>}
          <Button variant="secondary" className="mt-4 w-full" onClick={backToChoose} disabled={busy}>
            <ArrowLeft size={14} /> Back
          </Button>
        </div>
      )}

      {mode === 'barcode' && (
        <div>
          <div className="relative overflow-hidden rounded-xl bg-surface-3">
            <video ref={videoRef} className="aspect-[4/3] w-full object-cover" muted playsInline />
            {busy && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-bg/80 text-center">
                <Loader2 size={24} className="animate-spin text-text-secondary" />
                <p className="text-xs text-text-secondary">Looking up this product…</p>
              </div>
            )}
          </div>
          <p className="mt-2 text-center text-xs text-text-tertiary">Point the camera at a product's barcode.</p>
          {error && <p className="mt-3 rounded-xl border border-danger-dim bg-danger-dim/40 px-3 py-2 text-xs text-danger">{error}</p>}
          <Button variant="secondary" className="mt-4 w-full" onClick={backToChoose}>
            <ArrowLeft size={14} /> Back
          </Button>
        </div>
      )}
    </Modal>
  )
}
