import { useEffect, useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { FormField } from '@/components/ui/FormField'
import { Button } from '@/components/ui/Button'

interface NumberEntryModalProps {
  open: boolean
  onClose: () => void
  onSave: (value: number) => Promise<void>
  title: string
  label: string
  suffix: string
  initialValue?: number | null
  allowDecimal?: boolean
  min?: number
}

export function NumberEntryModal({
  open,
  onClose,
  onSave,
  title,
  label,
  suffix,
  initialValue,
  allowDecimal = false,
  min = 0,
}: NumberEntryModalProps) {
  const [value, setValue] = useState('')
  const [error, setError] = useState<string | undefined>()
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      setValue(initialValue != null ? String(initialValue) : '')
      setError(undefined)
    }
  }, [open, initialValue])

  async function handleSubmit() {
    const n = Number(value)
    if (value.trim() === '' || Number.isNaN(n)) {
      setError('Enter a valid number.')
      return
    }
    if (n < min) {
      setError(`Must be ${min} or more.`)
      return
    }
    if (!allowDecimal && !Number.isInteger(n)) {
      setError('Whole numbers only.')
      return
    }
    setSaving(true)
    try {
      await onSave(n)
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      title={title}
      open={open}
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" className="flex-1" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button className="flex-1" onClick={handleSubmit} disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </Button>
        </>
      }
    >
      <FormField
        label={label}
        type="number"
        inputMode={allowDecimal ? 'decimal' : 'numeric'}
        step={allowDecimal ? '0.1' : '1'}
        suffix={suffix}
        autoFocus
        value={value}
        onChange={(e) => setValue(e.target.value)}
        error={error}
      />
    </Modal>
  )
}
