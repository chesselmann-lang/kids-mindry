'use client'

/**
 * useAutosave — IndexedDB-backed draft persistence.
 *
 * Usage:
 *   const { saveDraft, loadDraft, clearDraft, draftAge } = useAutosave('tagesbericht-draft')
 *
 * - saveDraft(data)  — debounced, fires 800ms after last call
 * - loadDraft()      — returns the stored value or null
 * - clearDraft()     — deletes the stored draft
 * - draftAge         — human-readable age string (e.g. "vor 3 Minuten") or null
 */

import { useCallback, useEffect, useRef, useState } from 'react'

const DB_NAME  = 'mindry-kids-drafts'
const DB_VER   = 1
const STORE    = 'drafts'
const DEBOUNCE = 800 // ms

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VER)
    req.onupgradeneeded = () => {
      req.result.createObjectStore(STORE)
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror   = () => reject(req.error)
  })
}

async function dbGet<T>(key: string): Promise<{ data: T; ts: number } | null> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx  = db.transaction(STORE, 'readonly')
    const req = tx.objectStore(STORE).get(key)
    req.onsuccess = () => resolve(req.result ?? null)
    req.onerror   = () => reject(req.error)
  })
}

async function dbSet<T>(key: string, data: T): Promise<void> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx  = db.transaction(STORE, 'readwrite')
    const req = tx.objectStore(STORE).put({ data, ts: Date.now() }, key)
    req.onsuccess = () => resolve()
    req.onerror   = () => reject(req.error)
  })
}

async function dbDelete(key: string): Promise<void> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx  = db.transaction(STORE, 'readwrite')
    const req = tx.objectStore(STORE).delete(key)
    req.onsuccess = () => resolve()
    req.onerror   = () => reject(req.error)
  })
}

function formatAge(ts: number): string {
  const diff = Math.floor((Date.now() - ts) / 1000)
  if (diff < 60)   return 'gerade eben'
  if (diff < 3600) return `vor ${Math.floor(diff / 60)} Min.`
  return `vor ${Math.floor(diff / 3600)} Std.`
}

export function useAutosave<T>(key: string) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [draftAge, setDraftAge] = useState<string | null>(null)
  const [lastSaved, setLastSaved] = useState<number | null>(null)

  // Update age string every 30s
  useEffect(() => {
    if (lastSaved === null) return
    setDraftAge(formatAge(lastSaved))
    const id = setInterval(() => setDraftAge(formatAge(lastSaved)), 30_000)
    return () => clearInterval(id)
  }, [lastSaved])

  const saveDraft = useCallback((data: T) => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(async () => {
      try {
        await dbSet(key, data)
        const now = Date.now()
        setLastSaved(now)
        setDraftAge(formatAge(now))
      } catch { /* ignore IDB errors */ }
    }, DEBOUNCE)
  }, [key])

  const loadDraft = useCallback(async (): Promise<T | null> => {
    try {
      const record = await dbGet<T>(key)
      if (!record) return null
      setLastSaved(record.ts)
      setDraftAge(formatAge(record.ts))
      return record.data
    } catch {
      return null
    }
  }, [key])

  const clearDraft = useCallback(async () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    try {
      await dbDelete(key)
      setDraftAge(null)
      setLastSaved(null)
    } catch { /* ignore */ }
  }, [key])

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [])

  return { saveDraft, loadDraft, clearDraft, draftAge }
}
