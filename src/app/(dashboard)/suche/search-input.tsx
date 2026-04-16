'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, X, Loader2 } from 'lucide-react'

export default function SearchInput() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [value, setValue] = useState(searchParams.get('q') ?? '')
  const [searching, setSearching] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-focus on mount
  useEffect(() => { inputRef.current?.focus() }, [])

  function handleChange(v: string) {
    setValue(v)
    setSearching(v.trim().length >= 2)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      const params = new URLSearchParams()
      if (v.trim()) params.set('q', v.trim())
      router.push(`/suche${v.trim() ? '?' + params.toString() : ''}`)
      setSearching(false)
    }, 350)
  }

  function clearSearch() {
    setValue('')
    setSearching(false)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    router.push('/suche')
    inputRef.current?.focus()
  }

  return (
    <div className="relative">
      {searching
        ? <Loader2 size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-400 animate-spin" />
        : <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
      }
      <input
        ref={inputRef}
        type="search"
        autoComplete="off"
        placeholder="Kinder, Beiträge, Termine suchen…"
        value={value}
        onChange={e => handleChange(e.target.value)}
        className="w-full pl-10 pr-9 py-3 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 shadow-sm"
      />
      {value && (
        <button
          onClick={clearSearch}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          <X size={15} />
        </button>
      )}
    </div>
  )
}
