'use client'

import { useState, useEffect, useCallback } from 'react'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'
import {
  RefreshCw, Users, UserCheck, UserX, MessageSquare, Eye,
  Sparkles, TrendingUp, TrendingDown, Minus, AlertCircle,
  CheckCircle, Clock, Cake, ChevronRight
} from 'lucide-react'
import { useAnwesenheitRealtime } from '@/hooks/useAnwesenheitRealtime'
import Link from 'next/link'

interface KPIs {
  anwesenheitsquote: number
  anwesend: number
  abwesend_krank: number
  gesamt: number
  trend_vs_gestern: number
  ungelesene_nachrichten: number
  offene_beobachtungen: number
  geburtstage: string[]
}

interface Prioritaet {
  icon: string
  text: string
}

interface CockpitData {
  datum: string
  begruessung: string
  tagesprognose: string
  prioritaeten: Prioritaet[]
  stimmung: 'positiv' | 'neutral' | 'aufmerksamkeit'
  kpis: KPIs
}

const stimmungConfig = {
  positiv:       { bg: 'from-green-500 to-emerald-600', badge: 'bg-green-100 text-green-700' },
  neutral:       { bg: 'from-brand-500 to-indigo-600', badge: 'bg-blue-100 text-blue-700' },
  aufmerksamkeit: { bg: 'from-amber-500 to-orange-600', badge: 'bg-amber-100 text-amber-700' },
}

export default function CockpitDashboard({ siteId }: { siteId: string }) {
  const [data, setData] = useState<CockpitData | null>(null)
  const [loading, setLoading] = useState(true)
  const [regenerating, setRegenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [liveAnwesend, setLiveAnwesend] = useState<number | null>(null)

  // ─── Realtime presence (live update Anwesenheits-KPI) ─────────────────────
  const { connected, updates } = useAnwesenheitRealtime({
    onUpdate: () => {
      // Recount present from updates
    },
  })

  useEffect(() => {
    if (data && updates.length > 0) {
      const presentFromUpdates = updates.filter(u => u.status === 'present').length
      // Merge: start from server count + real-time deltas
      // Simple approach: if we have updates, trust them as the live layer
      const basePresent = data.kpis.anwesend
      setLiveAnwesend(Math.max(0, basePresent + presentFromUpdates - updates.filter(u => u.status !== 'present').length))
    }
  }, [updates, data])

  const loadPrognose = useCallback(async (regen = false) => {
    try {
      if (regen) setRegenerating(true)
      else setLoading(true)
      setError(null)

      const res = await fetch(`/api/ai/cockpit-prognose${regen ? '?regen=1' : ''}`)
      if (!res.ok) throw new Error('Fehler beim Laden')
      const json = await res.json()
      setData(json)
      if (json.kpis) setLiveAnwesend(json.kpis.anwesend)
    } catch (e) {
      setError('Cockpit konnte nicht geladen werden')
      console.error(e)
    } finally {
      setLoading(false)
      setRegenerating(false)
    }
  }, [])

  useEffect(() => { loadPrognose() }, [loadPrognose])

  const heute = format(new Date(), "EEEE, d. MMMM yyyy", { locale: de })
  const kpis = data?.kpis
  const cfg = stimmungConfig[data?.stimmung ?? 'neutral']
  const anwesend = liveAnwesend ?? kpis?.anwesend ?? 0

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-72 gap-4">
        <Sparkles size={32} className="text-brand-500 animate-pulse" />
        <p className="text-sm text-gray-500">KI-Cockpit wird geladen…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="card p-8 text-center">
        <AlertCircle size={32} className="text-red-400 mx-auto mb-3" />
        <p className="text-sm text-gray-600 mb-4">{error}</p>
        <button onClick={() => loadPrognose()} className="btn-primary text-sm">
          Erneut versuchen
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* ─── Hero Prognose-Banner ─────────────────────────────────────────── */}
      <div className={`relative rounded-3xl bg-gradient-to-br ${cfg.bg} text-white overflow-hidden shadow-lg`}>
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 80% 20%, white 0%, transparent 60%)' }}
        />
        <div className="relative p-6 md:p-8">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles size={16} className="opacity-80" />
                <span className="text-sm font-medium opacity-80">KI-Tagesprognose · {heute}</span>
                {connected && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/20 font-medium">
                    ● Live
                  </span>
                )}
              </div>
              <h2 className="text-2xl font-bold mb-3">{data?.begruessung}</h2>
              <p className="text-sm/relaxed opacity-90 max-w-2xl">{data?.tagesprognose}</p>
            </div>
            <button
              onClick={() => loadPrognose(true)}
              disabled={regenerating}
              className="flex-shrink-0 p-2.5 rounded-xl bg-white/20 hover:bg-white/30 transition-colors disabled:opacity-50"
              title="Prognose neu generieren"
            >
              <RefreshCw size={16} className={regenerating ? 'animate-spin' : ''} />
            </button>
          </div>

          {/* Prioritäten */}
          {data?.prioritaeten && data.prioritaeten.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2">
              {data.prioritaeten.map((p, i) => (
                <div key={i} className="flex items-center gap-2 bg-white/15 rounded-xl px-3 py-2 text-xs font-medium backdrop-blur-sm">
                  <span>{p.icon}</span>
                  <span>{p.text}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ─── Live KPIs ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Anwesend */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-xl bg-green-100 flex items-center justify-center">
              <UserCheck size={16} className="text-green-600" />
            </div>
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Anwesend</span>
          </div>
          <p className="text-4xl font-bold text-gray-900">{anwesend}</p>
          <p className="text-xs text-gray-400 mt-1">von {kpis?.gesamt ?? 0} Kindern</p>
          <div className="mt-3 flex items-center gap-1.5">
            {kpis && kpis.trend_vs_gestern > 0 && <TrendingUp size={12} className="text-green-500" />}
            {kpis && kpis.trend_vs_gestern < 0 && <TrendingDown size={12} className="text-red-400" />}
            {kpis && kpis.trend_vs_gestern === 0 && <Minus size={12} className="text-gray-400" />}
            <span className={`text-xs font-medium ${
              (kpis?.trend_vs_gestern ?? 0) > 0 ? 'text-green-600'
              : (kpis?.trend_vs_gestern ?? 0) < 0 ? 'text-red-500'
              : 'text-gray-400'
            }`}>
              {(kpis?.trend_vs_gestern ?? 0) > 0 ? '+' : ''}{kpis?.trend_vs_gestern ?? 0}% vs. gestern
            </span>
          </div>
        </div>

        {/* Krank */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center">
              <UserX size={16} className="text-red-500" />
            </div>
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Krank</span>
          </div>
          <p className="text-4xl font-bold text-gray-900">{kpis?.abwesend_krank ?? 0}</p>
          <p className="text-xs text-gray-400 mt-1">Krankmeldungen heute</p>
          <Link href="/admin/krankmeldungen" className="mt-3 flex items-center gap-1 text-xs text-brand-600 hover:underline">
            Details <ChevronRight size={10} />
          </Link>
        </div>

        {/* Nachrichten */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center">
              <MessageSquare size={16} className="text-amber-600" />
            </div>
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Nachrichten</span>
          </div>
          <p className="text-4xl font-bold text-gray-900">{kpis?.ungelesene_nachrichten ?? 0}</p>
          <p className="text-xs text-gray-400 mt-1">ungelesen</p>
          <Link href="/admin/nachrichten" className="mt-3 flex items-center gap-1 text-xs text-brand-600 hover:underline">
            Öffnen <ChevronRight size={10} />
          </Link>
        </div>

        {/* Beobachtungen */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center">
              <Eye size={16} className="text-purple-600" />
            </div>
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Beobachtungen</span>
          </div>
          <p className="text-4xl font-bold text-gray-900">{kpis?.offene_beobachtungen ?? 0}</p>
          <p className="text-xs text-gray-400 mt-1">ohne Feedback</p>
          <Link href="/admin/beobachtungen" className="mt-3 flex items-center gap-1 text-xs text-brand-600 hover:underline">
            Ansehen <ChevronRight size={10} />
          </Link>
        </div>
      </div>

      {/* ─── Anwesenheits-Fortschritt ─────────────────────────────────────── */}
      {kpis && (
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-700">Anwesenheitsquote heute</h3>
            <span className="text-lg font-bold text-brand-600">
              {kpis.gesamt > 0 ? Math.round((anwesend / kpis.gesamt) * 100) : 0}%
            </span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden">
            <div
              className="h-4 rounded-full bg-gradient-to-r from-brand-400 to-brand-600 transition-all duration-700"
              style={{ width: `${kpis.gesamt > 0 ? (anwesend / kpis.gesamt) * 100 : 0}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            <span>{anwesend} anwesend</span>
            <span>{kpis.gesamt - anwesend} abwesend / offen</span>
          </div>
        </div>
      )}

      {/* ─── Geburtstage ─────────────────────────────────────────────────── */}
      {kpis?.geburtstage && kpis.geburtstage.length > 0 && (
        <div className="card p-5 border-yellow-200 bg-yellow-50">
          <div className="flex items-center gap-2 mb-3">
            <Cake size={18} className="text-yellow-600" />
            <h3 className="text-sm font-semibold text-yellow-800">Geburtstage heute 🎂</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {kpis.geburtstage.map((name, i) => (
              <span key={i} className="px-3 py-1.5 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                🎉 {name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ─── Quick Links ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { href: '/admin/anwesenheit/live', icon: Users, label: 'Live-Anwesenheit', color: 'text-green-600 bg-green-50' },
          { href: '/admin/statistik', icon: TrendingUp, label: 'Statistiken', color: 'text-blue-600 bg-blue-50' },
          { href: '/admin/qualitaet', icon: CheckCircle, label: 'Qualitäts-Audit', color: 'text-purple-600 bg-purple-50' },
          { href: '/admin/tagesablauf', icon: Clock, label: 'Tagesablauf', color: 'text-amber-600 bg-amber-50' },
        ].map(({ href, icon: Icon, label, color }) => (
          <Link
            key={href}
            href={href}
            className="card p-4 flex flex-col items-center text-center hover:shadow-md transition-shadow gap-2"
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
              <Icon size={18} />
            </div>
            <span className="text-xs font-semibold text-gray-700">{label}</span>
          </Link>
        ))}
      </div>

      <p className="text-center text-xs text-gray-400">
        KI-Prognose generiert {format(new Date(), 'HH:mm')} · Aktualisiert sich täglich
      </p>
    </div>
  )
}
