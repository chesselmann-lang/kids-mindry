'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Loader2, Save, BookOpen, Heart, Zap, MessageSquare, Brain, Leaf, Smile, Shapes } from 'lucide-react'
import AiPortfolioNeu from './ai-portfolio-neu'

const categories = [
  { value: 'allgemein', label: 'Allgemein', icon: BookOpen, color: '#6366f1' },
  { value: 'sozial',    label: 'Sozial',    icon: Heart,        color: '#ec4899' },
  { value: 'motorik',   label: 'Motorik',   icon: Zap,          color: '#f59e0b' },
  { value: 'sprache',   label: 'Sprache',   icon: MessageSquare,color: '#3b82f6' },
  { value: 'kreativ',   label: 'Kreativ',   icon: Shapes,       color: '#8b5cf6' },
  { value: 'kognitiv',  label: 'Kognitiv',  icon: Brain,        color: '#06b6d4' },
  { value: 'emotional', label: 'Emotional', icon: Smile,        color: '#f97316' },
  { value: 'natur',     label: 'Natur',     icon: Leaf,         color: '#10b981' },
]

export default function PortfolioNeuPage({ params }: { params: { childId: string } }) {
  const router = useRouter()
  const supabase = createClient()
  const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState('allgemein')
  const [shared, setShared] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSave = async () => {
    if (!title.trim()) { setError('Titel ist Pflichtfeld'); return }
    setSaving(true); setError('')

    const { data: { user } } = await supabase.auth.getUser()
    const { error: err } = await (supabase as any)
      .from('portfolio_entries')
      .insert({
        site_id: siteId,
        child_id: params.childId,
        author_id: user?.id,
        title: title.trim(),
        content: content.trim() || null,
        category,
        is_shared_with_parents: shared,
      })

    setSaving(false)
    if (err) { setError(err.message); return }
    router.push(`/portfolio/${params.childId}`)
    router.refresh()
  }

  const selCat = categories.find(c => c.value === category)!

  return (
    <div className="space-y-6">
      <div>
        <button onClick={() => router.back()} className="text-xs text-brand-600 mb-1 block">← Portfolio</button>
        <h1 className="text-2xl font-bold text-gray-900">Neuer Eintrag</h1>
      </div>

      <AiPortfolioNeu category={category} />

      {/* Kategorie */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Kategorie</label>
        <div className="grid grid-cols-4 gap-2">
          {categories.map(cat => {
            const active = category === cat.value
            return (
              <button key={cat.value} onClick={() => setCategory(cat.value)}
                className={`flex flex-col items-center gap-1.5 py-3 rounded-2xl text-[11px] font-semibold border-2 transition-all ${
                  active ? 'shadow-sm scale-[1.02]' : 'border-gray-100 bg-white text-gray-500 hover:border-gray-200'
                }`}
                style={active ? { borderColor: cat.color, backgroundColor: cat.color + '15', color: cat.color } : {}}>
                <cat.icon size={18} />
                {cat.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Titel */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Titel *</label>
        <input value={title} onChange={e => setTitle(e.target.value)}
          placeholder={`z.B. "Erste Schritte auf dem Balken"`}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
      </div>

      {/* Notiz */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Beobachtung / Notiz</label>
        <textarea value={content} onChange={e => setContent(e.target.value)} rows={5}
          placeholder="Was hast du beobachtet? Was hat das Kind geleistet?"
          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none leading-relaxed" />
      </div>

      {/* Für Eltern sichtbar */}
      <label className="flex items-center gap-3 cursor-pointer card p-4">
        <input type="checkbox" checked={shared} onChange={e => setShared(e.target.checked)}
          className="w-5 h-5 rounded-lg accent-brand-600" />
        <div>
          <p className="text-sm font-semibold text-gray-900">Für Eltern sichtbar</p>
          <p className="text-xs text-gray-400">Eltern können diesen Eintrag im Portfolio-Bereich sehen</p>
        </div>
      </label>

      {error && <p className="text-sm text-red-500 px-1">{error}</p>}

      <button onClick={handleSave} disabled={saving}
        className="w-full py-4 rounded-2xl bg-brand-600 text-white font-bold hover:bg-brand-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2">
        {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
        Eintrag speichern
      </button>
    </div>
  )
}
