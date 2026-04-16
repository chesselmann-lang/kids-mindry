'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { CheckCircle2, Loader2, X, UserCheck } from 'lucide-react'

interface Group { id: string; name: string; color: string }

interface Props {
  childId: string
  childName: string
  groups: Group[]
}

export default function WartelisteActions({ childId, childName, groups }: Props) {
  const [open, setOpen] = useState(false)
  const [selectedGroup, setSelectedGroup] = useState<string | null>(groups[0]?.id ?? null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function aufnehmen() {
    setLoading(true)
    await supabase
      .from('children')
      .update({
        status: 'active',
        group_id: selectedGroup,
        start_date: new Date().toISOString().split('T')[0],
      })
      .eq('id', childId)
    setLoading(false)
    setOpen(false)
    router.refresh()
  }

  async function ablehnen() {
    if (!confirm(`${childName} von der Warteliste entfernen?`)) return
    await supabase.from('children').update({ status: 'inactive' }).eq('id', childId)
    router.refresh()
  }

  if (open) {
    return (
      <div className="mt-4 space-y-3 border-t border-gray-100 pt-4">
        <p className="text-sm font-semibold text-gray-800">Kind aufnehmen: {childName}</p>

        {groups.length > 0 && (
          <div>
            <label className="text-xs text-gray-500 font-medium block mb-2">Gruppe zuweisen</label>
            <div className="flex flex-wrap gap-2">
              {groups.map(g => (
                <button key={g.id} onClick={() => setSelectedGroup(g.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    selectedGroup === g.id ? 'text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  style={selectedGroup === g.id ? { backgroundColor: g.color } : {}}>
                  {g.name}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <button onClick={() => setOpen(false)} className="btn-secondary flex-1 text-sm py-2">
            <X size={14} /> Abbrechen
          </button>
          <button onClick={aufnehmen} disabled={loading}
            className="btn-primary flex-1 text-sm py-2 disabled:opacity-50 flex items-center justify-center gap-1.5">
            {loading
              ? <><Loader2 size={14} className="animate-spin" /> Aufnehmen…</>
              : <><CheckCircle2 size={14} /> Aufnehmen</>}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex gap-2 mt-3 border-t border-gray-100 pt-3">
      <button onClick={ablehnen}
        className="flex-1 text-xs py-2 px-3 rounded-xl border border-gray-200 text-gray-500 hover:border-red-300 hover:text-red-500 transition-colors">
        Ablehnen
      </button>
      <button onClick={() => setOpen(true)}
        className="flex-1 text-xs py-2 px-3 rounded-xl bg-green-600 text-white hover:bg-green-700 transition-colors font-semibold flex items-center justify-center gap-1.5">
        <UserCheck size={13} /> Aufnehmen
      </button>
    </div>
  )
}
