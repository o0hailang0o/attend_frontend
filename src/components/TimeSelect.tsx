import { useState, useRef, useEffect } from 'react'

const TIMES = (() => {
  const list: string[] = []
  for (let h = 0; h < 24; h++) {
    list.push(`${String(h).padStart(2, '0')}:00`)
    list.push(`${String(h).padStart(2, '0')}:30`)
  }
  return list
})()

function nearestHalfHour() {
  const now = new Date()
  const h = now.getHours()
  const m = now.getMinutes()
  return `${String(h).padStart(2, '0')}:${m < 30 ? '00' : '30'}`
}

export default function TimeSelect({
  value,
  onChange,
  className = '',
}: {
  value: string
  onChange: (v: string) => void
  className?: string
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  useEffect(() => {
    if (!open || !listRef.current) return
    const target = value || nearestHalfHour()
    const el = listRef.current.querySelector(`[data-time="${target}"]`)
    if (el) el.scrollIntoView({ block: 'center' })
  }, [open, value])

  const handleFocus = () => setOpen(true)

  return (
    <div ref={ref} className={`relative cursor-pointer ${className}`} onClick={() => inputRef.current?.focus()}>
      <input
        ref={inputRef}
        type="text"
        readOnly
        value={value}
        placeholder="—"
        onFocus={handleFocus}
        className="w-full bg-transparent text-sm text-gray-700 outline-none cursor-pointer"
      />
      {open && (
        <div ref={listRef} className="absolute top-full left-0 right-0 mt-1 z-50 max-h-48 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg">
          <div
            onClick={() => { onChange(''); setOpen(false); inputRef.current?.focus() }}
            className={`px-3 py-1.5 text-sm cursor-pointer hover:bg-blue-50 ${!value ? 'bg-blue-50 text-blue-600' : 'text-gray-400'}`}
            data-time=""
          >
            —
          </div>
          {TIMES.map(t => (
            <div
              key={t}
              data-time={t}
              onClick={() => { onChange(t); setOpen(false); inputRef.current?.focus() }}
              className={`px-3 py-1.5 text-sm cursor-pointer hover:bg-blue-50 ${value === t ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700'}`}
            >
              {t}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
