'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, Camera, X, ImagePlus, CloudOff, Cloud, Trash2, CheckCircle, MessageCircle, Share2, RotateCcw, Sparkles, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useAutosave } from '@/hooks/useAutosave'

// ── WhatsApp share helper ─────────────────────────────────────────────────────

function buildWaMessage(childName: string, mood: string, activities: string) {
  const moodMap: Record<string, string> = { great: '😄 Super', good: '🙂 Gut', okay: '😐 Ok', sad: '😢 Traurig', sick: '🤒 Krank' }
  const moodLabel = moodMap[mood] ?? ''
  const date = new Date().toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' })
  return `Hallo! 👋\n\nDer Tagesbericht für *${childName}* vom ${date} ist jetzt verfügbar.\n\n${moodLabel ? `Stimmung: ${moodLabel}\n` : ''}${activities ? `Aktivitäten: ${activities}\n` : ''}\nViele Grüße aus der Kita 🌟`
}

const moods = [
  { value: 'great', emoji: '😄', label: 'Super' },
  { value: 'good',  emoji: '🙂', label: 'Gut' },
  { value: 'okay',  emoji: '😐', label: 'Ok' },
  { value: 'sad',   emoji: '😢', label: 'Traurig' },
  { value: 'sick',  emoji: '🤒', label: 'Krank' },
]

const mealOptions = ['Nichts', 'Wenig', 'Halb', 'Viel', 'Alles']

interface FormDraft {
  childId: string
  mood: string
  sleepHours: string
  sleepMins: string
  breakfast: string
  lunch: string
  snack: string
  activities: string
  notes: string
}

interface Props {
  children: { id: string; first_name: string; last_name: string }[]
  preselectedChildId?: string
  authorId: string
}

export default function TagesberichtForm({ children, preselectedChildId, authorId }: Props) {
  const router = useRouter()
  const today = new Date().toISOString().split('T')[0]
  const draftKey = `tagesbericht-${today}`

  const { saveDraft, loadDraft, clearDraft, draftAge } = useAutosave<FormDraft>(draftKey)

  const [childId, setChildId]       = useState(preselectedChildId ?? '')
  const [mood, setMood]             = useState('')
  const [sleepHours, setSleepHours] = useState('')
  const [sleepMins, setSleepMins]   = useState('')
  const [breakfast, setBreakfast]   = useState('')
  const [lunch, setLunch]           = useState('')
  const [snack, setSnack]           = useState('')
  const [activities, setActivities] = useState('')
  const [notes, setNotes]           = useState('')
  const [loading, setLoading]       = useState(false)
  const [aiLoading, setAiLoading]   = useState(false)
  const [savedChildName, setSavedChildName] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)
  const [showRestoreBanner, setShowRestoreBanner] = useState(false)
  const [pendingDraft, setPendingDraft] = useState<FormDraft | null>(null)

  // Photo upload state
  const [photos, setPhotos]               = useState<File[]>([])
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([])
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load draft on mount
  useEffect(() => {
    loadDraft().then(draft => {
      if (draft && (draft.mood || draft.activities || draft.notes || draft.childId)) {
        setPendingDraft(draft)
        setShowRestoreBanner(true)
      }
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Build current form state for autosave
  const currentDraft = useCallback((): FormDraft => ({
    childId, mood, sleepHours, sleepMins, breakfast, lunch, snack, activities, notes,
  }), [childId, mood, sleepHours, sleepMins, breakfast, lunch, snack, activities, notes])

  // Trigger autosave on any field change
  useEffect(() => {
    const draft = currentDraft()
    const hasContent = draft.mood || draft.activities || draft.notes || draft.childId || draft.breakfast || draft.lunch
    if (hasContent) saveDraft(draft)
  }, [childId, mood, sleepHours, sleepMins, breakfast, lunch, snack, activities, notes]) // eslint-disable-line react-hooks/exhaustive-deps

  function restoreDraft() {
    if (!pendingDraft) return
    setChildId(pendingDraft.childId || preselectedChildId || '')
    setMood(pendingDraft.mood)
    setSleepHours(pendingDraft.sleepHours)
    setSleepMins(pendingDraft.sleepMins)
    setBreakfast(pendingDraft.breakfast)
    setLunch(pendingDraft.lunch)
    setSnack(pendingDraft.snack)
    setActivities(pendingDraft.activities)
    setNotes(pendingDraft.notes)
    setShowRestoreBanner(false)
    setPendingDraft(null)
  }

  function discardDraft() {
    clearDraft()
    setShowRestoreBanner(false)
    setPendingDraft(null)
  }

  async function generateAiNotes() {
    const child = (children as any[]).find(c => c.id === childId)
    if (!child || !mood) return
    setAiLoading(true)
    try {
      const res = await fetch('/api/ai/tagesbericht', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          childName: child.first_name,
          mood, sleepHours, sleepMins,
          breakfast: breakfast || null,
          lunch: lunch || null,
          snack: snack || null,
          activities: activities || null,
          notes: null,
        }),
      })
      const data = await res.json()
      if (data.text) setNotes(data.text)
    } catch { /* silent fail */ }
    finally { setAiLoading(false) }
  }

  function handlePhotoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    const remaining = 5 - photos.length
    const newFiles = files.slice(0, remaining)
    setPhotos(prev => [...prev, ...newFiles])
    newFiles.forEach(file => {
      const reader = new FileReader()
      reader.onload = ev => setPhotoPreviews(prev => [...prev, ev.target?.result as string])
      reader.readAsDataURL(file)
    })
    e.target.value = ''
  }

  function removePhoto(idx: number) {
    setPhotos(prev => prev.filter((_, i) => i !== idx))
    setPhotoPreviews(prev => prev.filter((_, i) => i !== idx))
  }

  async function uploadPhotos(cId: string): Promise<string[]> {
    if (!photos.length) return []
    const supabase = createClient()
    const urls: string[] = []
    for (let i = 0; i < photos.length; i++) {
      const file = photos[i]
      const ext = file.name.split('.').pop() ?? 'jpg'
      const path = `tagesberichte/${cId}/${today}/${Date.now()}_${i}.${ext}`
      const { error } = await supabase.storage
        .from('media')
        .upload(path, file, { contentType: file.type, upsert: true })
      if (!error) {
        const { data: urlData } = supabase.storage.from('media').getPublicUrl(path)
        urls.push(urlData.publicUrl)
      }
      setUploadProgress(Math.round(((i + 1) / photos.length) * 100))
    }
    return urls
  }

  async function handleSave() {
    if (!childId) return
    setLoading(true)
    const supabase = createClient()

    const sleepMinutes = sleepHours || sleepMins
      ? (parseInt(sleepHours || '0') * 60) + parseInt(sleepMins || '0')
      : null

    const photoUrls = await uploadPhotos(childId)

    await supabase.from('daily_reports').upsert({
      child_id: childId,
      author_id: authorId,
      report_date: today,
      mood: mood || null,
      meals: { breakfast, lunch, snack },
      sleep_minutes: sleepMinutes,
      activities: activities || null,
      notes: notes || null,
      photo_urls: photoUrls.length > 0 ? photoUrls : null,
      shared_at: new Date().toISOString(),
    }, { onConflict: 'child_id,report_date' })

    // Notify parents of this child (in-app + push)
    try {
      const child = children.find(c => c.id === childId)
      const childName = child ? `${child.first_name} ${child.last_name}` : 'Ihr Kind'
      const { data: guardians } = await (supabase as any)
        .from('guardians')
        .select('user_id')
        .eq('child_id', childId)
      if (guardians && guardians.length > 0) {
        const guardianIds = guardians.map((g: { user_id: string }) => g.user_id)

        // In-app notifications
        await Promise.all(
          guardianIds.map((uid: string) =>
            (supabase as any).from('notifications').insert({
              user_id: uid,
              type: 'tagesbericht',
              title: `Tagesbericht: ${childName}`,
              body: `Ein neuer Tagesbericht für ${childName} ist verfügbar.`,
              data: { url: `/tagesberichte/${childId}/${today}` },
            })
          )
        )

        // Push notifications (fire-and-forget)
        fetch('/api/push-send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            recipientIds: guardianIds,
            title: `Tagesbericht: ${childName}`,
            body: `Ein neuer Tagesbericht ist verfügbar.`,
            url: `/tagesberichte/${childId}/${today}`,
            sourceType: 'tagesbericht',
            sourceId: childId,
          }),
        }).catch(() => {/* non-fatal */})
      }
    } catch {
      // Silent fail — notification creation is non-critical
    }

    // Clear draft after successful save
    await clearDraft()

    const child = children.find(c => c.id === childId)
    const name = child ? `${child.first_name} ${child.last_name}` : ''
    setSavedChildName(name)
    setLoading(false)
    setShowSuccess(true)
  }

  // ── Success overlay ─────────────────────────────────────────────────────────
  if (showSuccess) {
    const waMsg = buildWaMessage(savedChildName, mood, activities)
    const waUrl = `https://wa.me/?text=${encodeURIComponent(waMsg)}`

    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 space-y-6 animate-in fade-in duration-500">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
          <CheckCircle size={40} className="text-green-600" />
        </div>

        <div>
          <h2 className="text-2xl font-extrabold text-gray-900">Gespeichert! 🎉</h2>
          <p className="text-gray-500 mt-2 text-sm">
            Der Tagesbericht für <strong>{savedChildName}</strong> wurde erfolgreich gespeichert und für die Eltern freigegeben.
          </p>
        </div>

        {/* WhatsApp + Share buttons */}
        <div className="w-full max-w-xs space-y-3">
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-3 w-full py-3.5 rounded-2xl text-white font-bold text-sm shadow-lg active:scale-95 transition-all"
            style={{ backgroundColor: '#25D366' }}
          >
            <MessageCircle size={20} />
            Per WhatsApp teilen
          </a>

          {typeof navigator !== 'undefined' && typeof navigator.share === 'function' ? (
            <button
              onClick={() => navigator.share({ title: `Tagesbericht ${savedChildName}`, text: waMsg })}
              className="flex items-center justify-center gap-3 w-full py-3.5 rounded-2xl border-2 border-gray-200 text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-colors"
            >
              <Share2 size={18} />
              Teilen…
            </button>
          ) : null}

          <button
            onClick={() => { setShowSuccess(false); router.push('/tagesberichte'); router.refresh(); }}
            className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl text-gray-500 text-sm font-medium hover:text-gray-700 transition-colors"
          >
            <ArrowLeft size={15} />
            Zur Übersicht
          </button>

          <button
            onClick={() => {
              setShowSuccess(false)
              setChildId(preselectedChildId ?? '')
              setMood(''); setSleepHours(''); setSleepMins('')
              setBreakfast(''); setLunch(''); setSnack('')
              setActivities(''); setNotes(''); setPhotos([]); setPhotoPreviews([])
            }}
            className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl text-brand-600 text-sm font-semibold hover:text-brand-700 transition-colors"
          >
            <RotateCcw size={15} />
            Neuer Bericht
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/tagesberichte" className="p-2 -ml-2 rounded-xl hover:bg-gray-100 transition-colors">
          <ArrowLeft size={20} className="text-gray-600" />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-900">Tagesbericht</h1>
          <p className="text-sm text-gray-400">
            {new Date().toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>

        {/* Autosave indicator */}
        {draftAge && !showRestoreBanner && (
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <Cloud size={13} className="text-green-400" />
            <span>Entwurf {draftAge}</span>
          </div>
        )}
      </div>

      {/* ── Draft restore banner ──────────────────────────────────── */}
      {showRestoreBanner && pendingDraft && (
        <div className="card p-4 bg-amber-50 border border-amber-200 flex items-start gap-3">
          <CloudOff size={18} className="text-amber-500 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-amber-900">Entwurf gefunden</p>
            <p className="text-xs text-amber-700 mt-0.5">
              Du hast einen nicht gespeicherten Entwurf von heute. Möchtest du ihn wiederherstellen?
            </p>
            <div className="flex gap-2 mt-3">
              <button
                onClick={restoreDraft}
                className="px-3 py-1.5 bg-amber-600 text-white rounded-lg text-xs font-medium hover:bg-amber-700 transition-colors"
              >
                Wiederherstellen
              </button>
              <button
                onClick={discardDraft}
                className="px-3 py-1.5 bg-white text-amber-700 border border-amber-200 rounded-lg text-xs font-medium hover:bg-amber-50 transition-colors flex items-center gap-1"
              >
                <Trash2 size={11} />
                Verwerfen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Kind auswählen */}
      <div className="card p-4">
        <label className="label">Kind *</label>
        <select
          className="input-field"
          value={childId}
          onChange={e => setChildId(e.target.value)}
        >
          <option value="">Kind auswählen…</option>
          {children.map(c => (
            <option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>
          ))}
        </select>
      </div>

      {/* Stimmung */}
      <div className="card p-4">
        <label className="label mb-3">Wie war die Stimmung?</label>
        <div className="flex justify-between">
          {moods.map(m => (
            <button
              key={m.value}
              onClick={() => setMood(m.value)}
              className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all ${
                mood === m.value ? 'bg-brand-50 ring-2 ring-brand-400' : 'hover:bg-gray-50'
              }`}
            >
              <span className="text-2xl">{m.emoji}</span>
              <span className="text-[10px] text-gray-500 font-medium">{m.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Essen */}
      <div className="card p-4 space-y-4">
        <h2 className="font-semibold text-sm text-gray-900">🍽️ Essen</h2>
        {[
          { key: 'breakfast', label: 'Frühstück',    val: breakfast, set: setBreakfast },
          { key: 'lunch',     label: 'Mittagessen',  val: lunch,     set: setLunch },
          { key: 'snack',     label: 'Snack / Vesper', val: snack,   set: setSnack },
        ].map(({ key, label, val, set }) => (
          <div key={key}>
            <label className="text-xs font-medium text-gray-600 mb-2 block">{label}</label>
            <div className="flex gap-2">
              {mealOptions.map(opt => (
                <button
                  key={opt}
                  onClick={() => set(opt)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    val === opt
                      ? 'bg-brand-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Schlaf */}
      <div className="card p-4">
        <h2 className="font-semibold text-sm text-gray-900 mb-3">😴 Mittagsschlaf</h2>
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <label className="text-xs text-gray-500 block mb-1">Stunden</label>
            <input
              type="number" min="0" max="4"
              className="input-field text-center"
              placeholder="0"
              value={sleepHours}
              onChange={e => setSleepHours(e.target.value)}
            />
          </div>
          <span className="text-gray-400 pt-4">:</span>
          <div className="flex-1">
            <label className="text-xs text-gray-500 block mb-1">Minuten</label>
            <input
              type="number" min="0" max="59" step="5"
              className="input-field text-center"
              placeholder="0"
              value={sleepMins}
              onChange={e => setSleepMins(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Aktivitäten */}
      <div className="card p-4">
        <label className="label">🎨 Aktivitäten &amp; Beschäftigung</label>
        <input
          className="input-field"
          placeholder="z.B. Malen, Singen, Gartenspiel…"
          value={activities}
          onChange={e => setActivities(e.target.value)}
        />
      </div>

      {/* Notizen */}
      <div className="card p-4">
        <div className="flex items-center justify-between mb-1.5">
          <label className="label mb-0">📝 Notizen für die Eltern</label>
          <button
            type="button"
            onClick={generateAiNotes}
            disabled={aiLoading || !childId || !mood}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              !childId || !mood
                ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                : 'bg-violet-100 text-violet-700 hover:bg-violet-200 active:scale-95'
            }`}
            title={!childId || !mood ? 'Bitte Kind und Stimmung auswählen' : 'KI-Text generieren'}
          >
            {aiLoading
              ? <Loader2 size={12} className="animate-spin" />
              : <Sparkles size={12} />
            }
            KI-Vorschlag
          </button>
        </div>
        <textarea
          className="input-field resize-none"
          rows={4}
          placeholder="Besondere Vorkommnisse, Beobachtungen, Hinweise…"
          value={notes}
          onChange={e => setNotes(e.target.value)}
        />
        {aiLoading && (
          <p className="text-xs text-violet-500 mt-1.5 flex items-center gap-1">
            <Sparkles size={10} /> KI schreibt einen Vorschlag…
          </p>
        )}
      </div>

      {/* Fotos */}
      <div className="card p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-sm text-gray-900 flex items-center gap-2">
            <Camera size={15} className="text-gray-400" />
            Fotos vom Tag
          </h2>
          <span className="text-xs text-gray-400">{photos.length}/5</span>
        </div>

        {photoPreviews.length > 0 && (
          <div className="grid grid-cols-3 gap-2 mb-3">
            {photoPreviews.map((src, idx) => (
              <div key={idx} className="relative aspect-square rounded-xl overflow-hidden bg-gray-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" className="w-full h-full object-cover" />
                <button
                  onClick={() => removePhoto(idx)}
                  className="absolute top-1 right-1 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center"
                >
                  <X size={10} className="text-white" />
                </button>
              </div>
            ))}
          </div>
        )}

        {photos.length < 5 && (
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handlePhotoSelect}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full border-2 border-dashed border-gray-200 rounded-xl py-4 flex items-center justify-center gap-2 text-sm text-gray-400 hover:border-brand-300 hover:text-brand-500 transition-colors"
            >
              <ImagePlus size={18} />
              Foto hinzufügen
            </button>
          </>
        )}
      </div>

      {/* Speichern */}
      <button
        onClick={handleSave}
        disabled={!childId || loading}
        className="btn-primary w-full flex items-center justify-center gap-2 py-3 disabled:opacity-50"
      >
        <Save size={18} />
        {loading
          ? (uploadProgress > 0 && uploadProgress < 100
              ? `Fotos hochladen… ${uploadProgress}%`
              : 'Speichere…')
          : 'Bericht speichern & teilen'
        }
      </button>
    </div>
  )
}
