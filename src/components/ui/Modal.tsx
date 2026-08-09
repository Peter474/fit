import { useEffect, type ReactNode } from 'react'
import { X } from 'lucide-react'
import { createPortal } from 'react-dom'

interface ModalProps {
  title: string
  open: boolean
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
}

export function Modal({ title, open, onClose, children, footer }: ModalProps) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-up"
        onClick={onClose}
      />
      <div className="animate-fade-up relative flex max-h-[90vh] w-full flex-col rounded-t-2xl border border-border-soft bg-surface p-5 shadow-2xl md:max-w-md md:rounded-2xl md:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold tracking-tight text-text-primary">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-surface-2 hover:text-text-primary"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>
        <div className="overflow-y-auto">{children}</div>
        {footer && <div className="mt-5 flex gap-2">{footer}</div>}
      </div>
    </div>,
    document.body,
  )
}
