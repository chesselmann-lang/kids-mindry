'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  Building2, Users, Baby, UserPlus, Mail, Shield,
  CheckCircle2, ChevronRight, ChevronLeft, Loader2,
  Plus, Trash2, Sparkles, ArrowRight, Check, Info,
} from 'lucide-react'

interface Props {
  userId: string
  siteId: string
  site: any
  groups: any[]
  children: any[]
  staffCount: number
  parentCount: number
}

const GROUP_COLORS = [
  '#3B6CE8','#10B981','#F59E0B','#EF4444','#8B5CF6',
  '#EC4899','#06B6D4','#84CC16','#F97316','#6366F1',
]

const STEPS = [
  { id: 'kita',      icon: Building2, label: 'Einrichtung',    color: 'from-brand-400 to-brand-600' },
  { id: 'groups',    icon: Users,     label: 'Gruppen',         color: 'from-green-400 to-emerald-600' },
  { id: 'children',  icon: Baby,      label: 'Kinder',          color: 'from-amber-400 to-orange-500' },
  { id: 'staff',     icon: UserPlus,  label: 'Team',            color: 'from-purple-400 to-violet-600' },
  { id: 'parents',   icon: Mail,      label: 'Eltern',          color: 'from-pink-400 to-rose-600' },
  { id: 'avv',       icon: Shield,    label: 'Datenschutz',     color: 'from-teal-400 to-cyan-600' },
  { id: 'done',      icon: Sparkles,  label: 'Fertig!',         color: 'from-yellow-400 to-amber-500' },
]

export default function KitaSetupWizard({ userId, siteId, site, groups: initialGroups, children: initialChildren, staffCount, parentCount }: Props) {
  const router = useRouter()
  const supabase = createClient()

  const [step, setStep] = useState(0)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Step 1: Kita details
  const [kitaName, setKitaName] = useState(site?.name ?? '')
  const [kitaAddress, setKitaAddress] = useState(site?.address ?? '')
  const [kitaPhone, setKitaPhone] = useState(site?.phone ?? '')
  const [kitaEmail, setKitaEmail] = useState(site?.email ?? '')

  // Step 2: Groups
  const [groups, setGroups] = useState<{ name: string; color: string; capacity: string }[]>(
    initialGroups.length > 0
      ? initialGroups.map(g => ({ name: g.name, color: g.color, capacity: String(g.capacity) }))
      : [{ name: '', color: GROUP_COLORS[0], capacity: '15' }]
  )

  // Step 3: Children (show existing count, add new)
  const [newChildren, setNewChildren] = useState<{ firstName: string; lastName: string; groupIdx: string }[]>([])

  // Step 4: Staff invites
  const [staffEmails, setStaffEmails] = useState<{ email: string; role: string }[]>([
    { email: '', role: 'educator' },
  ])

  // Step 5: Parent invites (email + child name)
  const [parentInvites, setParentInvites] = useState<{ email: string; childId: string }[]>([
    { email: '', childId: '' },
  ])
  const allChildren = [...initialChildren, ...newChildren.map((c, i) => ({ id: `new_${i}`, first_name: c.firstName, last_name: c.lastName }))]

  // Step 6: AVV
  const [avvAccepted, setAvvAccepted] = useState(false)
  const [avvTimestamp, setAvvTimestamp] = useState<string | null>(null)

  const current = STEPS[step]
  const Icon = current.icon

  function next() { setErrors({}); setStep(s => Math.min(s + 1, STEPS.length - 1)) }
  function prev() { setErrors({}); setStep(s => Math.max(s - 1, 0)) }

  // ─── Save Step 1: Kita ───────────────────────────────────
  async function saveKita() {
    if (!kitaName.trim()) { setErrors({ name: 'Name der Einrichtung ist erforderlich.' }); return }
    setSaving(true)
    await supabase.from('sites').update({
      name: kitaName.trim(),
      address: kitaAddress.trim() || null,
      phone: kitaPhone.trim() || null,
      email: kitaEmail.trim() || null,
    }).eq('id', siteId)
    setSaving(false)
    next()
  }

  // ─── Save Step 2: Groups ─────────────────────────────────
  async function saveGroups() {
    const filled = groups.filter(g => g.name.trim())
    if (filled.length === 0) { setErrors({ groups: 'Bitte mindestens eine Gruppe anlegen.' }); return }
    setSaving(true)
    // Upsert groups by name (simple approach)
    for (const g of filled) {
      await supabase.from('groups').upsert({
        site_id: siteId,
        name: g.name.trim(),
        color: g.color,
        capacity: parseInt(g.capacity) || 15,
        age_min_months: 0,
        age_max_months: 72,
      }, { onConflict: 'site_id,name' })
    }
    setSaving(false)
    next()
  }

  // ─── Save Step 3: Children ───────────────────────────────
  async function saveChildren() {
    const filled = newChildren.filter(c => c.firstName.trim() && c.lastName.trim())
    if (filled.length > 0) {
      setSaving(true)
      // Re-fetch groups to get IDs
      const { data: dbGroups } = await supabase.from('groups').select('id, name').eq('site_id', siteId)
      for (const c of filled) {
        const groupId = dbGroups?.find(g => g.name === c.groupIdx)?.id ?? null
        await supabase.from('children').insert({
          site_id: siteId,
          first_name: c.firstName.trim(),
          last_name: c.lastName.trim(),
          group_id: groupId,
          status: 'active',
        })
      }
      setSaving(false)
    }
    next()
  }

  // ─── Save Step 4: Staff ──────────────────────────────────
  async function saveStaff() {
    const filled = staffEmails.filter(s => s.email.trim())
    if (filled.length > 0) {
      setSaving(true)
      for (const s of filled) {
        try {
          // Create auth invite via API route
          await fetch('/api/invite-user', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: s.email.trim(), role: s.role, siteId }),
          })
        } catch {}
      }
      setSaving(false)
    }
    next()
  }

  // ─── Save Step 5: Parents ────────────────────────────────
  async function saveParents() {
    const filled = parentInvites.filter(p => p.email.trim())
    if (filled.length > 0) {
      setSaving(true)
      for (const p of filled) {
        try {
          await fetch('/api/invite-user', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: p.email.trim(), role: 'parent', siteId, childId: p.childId || null }),
          })
        } catch {}
      }
      setSaving(false)
    }
    next()
  }

  // ─── Save Step 6: AVV ────────────────────────────────────
  async function saveAvv() {
    if (!avvAccepted) { setErrors({ avv: 'Bitte bestätigen Sie den Auftragsverarbeitungsvertrag.' }); return }
    const ts = new Date().toISOString()
    setSaving(true)
    // Store AVV acceptance in site config
    await (supabase as any).from('sites').update({
      config: { avv_accepted: true, avv_accepted_at: ts, avv_accepted_by: userId },
    }).eq('id', siteId)
    setAvvTimestamp(ts)
    setSaving(false)
    next()
  }

  // ─────────────────────────────────────────────────────────
  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">Kita-Einrichtung</h1>
        <p className="text-sm text-gray-400">Richten Sie KitaHub in wenigen Schritten ein</p>
      </div>

      {/* Progress bar */}
      <div className="flex items-center gap-1">
        {STEPS.map((s, i) => (
          <div key={s.id} className="flex items-center gap-1 flex-1 last:flex-none">
            <button
              onClick={() => i < step && setStep(i)}
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all
                ${i < step ? 'bg-brand-600 text-white cursor-pointer hover:bg-brand-700' :
                  i === step ? 'bg-brand-600 text-white ring-2 ring-brand-200' :
                  'bg-gray-200 text-gray-400 cursor-default'}`}
            >
              {i < step ? <Check size={13} /> : i + 1}
            </button>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-1 rounded-full transition-all ${i < step ? 'bg-brand-400' : 'bg-gray-200'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step label */}
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${current.color} flex items-center justify-center`}>
          <Icon size={20} className="text-white" />
        </div>
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">Schritt {step + 1} von {STEPS.length}</p>
          <h2 className="text-lg font-bold text-gray-900">{current.label}</h2>
        </div>
      </div>

      {/* ── Step 0: Kita Info ── */}
      {step === 0 && (
        <div className="card p-5 space-y-4">
          <p className="text-sm text-gray-500">Geben Sie die Grunddaten Ihrer Einrichtung ein. Diese erscheinen für alle Nutzer sichtbar.</p>
          <div>
            <label className="label">Name der Einrichtung *</label>
            <input className={`input w-full ${errors.name ? 'border-red-400' : ''}`} value={kitaName}
              onChange={e => setKitaName(e.target.value)} placeholder="z.B. Kita Sonnenschein" />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
          </div>
          <div>
            <label className="label">Adresse</label>
            <input className="input w-full" value={kitaAddress}
              onChange={e => setKitaAddress(e.target.value)} placeholder="Musterstraße 1, 12345 Musterstadt" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Telefon</label>
              <input className="input w-full" value={kitaPhone}
                onChange={e => setKitaPhone(e.target.value)} placeholder="+49 123 456789" />
            </div>
            <div>
              <label className="label">E-Mail</label>
              <input className="input w-full" type="email" value={kitaEmail}
                onChange={e => setKitaEmail(e.target.value)} placeholder="info@kita.de" />
            </div>
          </div>
        </div>
      )}

      {/* ── Step 1: Groups ── */}
      {step === 1 && (
        <div className="space-y-3">
          <div className="card p-4 bg-brand-50 border-none">
            <p className="text-sm text-brand-800">Legen Sie die Kita-Gruppen an. Kinder werden später einer Gruppe zugeordnet.</p>
          </div>
          {groups.map((g, i) => (
            <div key={i} className="card p-4 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full flex-shrink-0" style={{ backgroundColor: g.color }} />
                <input className="input flex-1 text-sm" value={g.name}
                  onChange={e => setGroups(prev => prev.map((x, j) => j === i ? { ...x, name: e.target.value } : x))}
                  placeholder={`Gruppenname (z.B. Schmetterlinge)`} />
                {groups.length > 1 && (
                  <button onClick={() => setGroups(prev => prev.filter((_, j) => j !== i))}
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400 w-14">Farbe:</span>
                <div className="flex gap-2 flex-wrap">
                  {GROUP_COLORS.map(color => (
                    <button key={color} onClick={() => setGroups(prev => prev.map((x, j) => j === i ? { ...x, color } : x))}
                      className={`w-6 h-6 rounded-full transition-transform hover:scale-110 ${g.color === color ? 'ring-2 ring-offset-1 ring-gray-400' : ''}`}
                      style={{ backgroundColor: color }} />
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400 w-14">Kapaz.:</span>
                <input className="input w-20 text-sm" type="number" min="1" max="30" value={g.capacity}
                  onChange={e => setGroups(prev => prev.map((x, j) => j === i ? { ...x, capacity: e.target.value } : x))} />
                <span className="text-xs text-gray-400">Kinder</span>
              </div>
            </div>
          ))}
          {errors.groups && <p className="text-xs text-red-500">{errors.groups}</p>}
          <button onClick={() => setGroups(prev => [...prev, { name: '', color: GROUP_COLORS[prev.length % GROUP_COLORS.length], capacity: '15' }])}
            className="w-full py-3 rounded-xl border-2 border-dashed border-gray-200 text-sm text-gray-400 flex items-center justify-center gap-2 hover:border-brand-300 hover:text-brand-600 transition-colors">
            <Plus size={16} /> Gruppe hinzufügen
          </button>
        </div>
      )}

      {/* ── Step 2: Children ── */}
      {step === 2 && (
        <div className="space-y-3">
          {initialChildren.length > 0 && (
            <div className="card p-4 flex items-center gap-3 bg-green-50 border-none">
              <CheckCircle2 size={18} className="text-green-600 flex-shrink-0" />
              <p className="text-sm text-green-800">{initialChildren.length} {initialChildren.length === 1 ? 'Kind ist' : 'Kinder sind'} bereits in der Einrichtung registriert.</p>
            </div>
          )}
          <div className="card p-4 bg-brand-50 border-none">
            <p className="text-sm text-brand-800">Fügen Sie hier weitere Kinder hinzu. Sie können Kinder auch später unter <strong>Kinder</strong> anlegen.</p>
          </div>
          {newChildren.map((c, i) => (
            <div key={i} className="card p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-gray-400 uppercase">Kind {i + 1}</p>
                <button onClick={() => setNewChildren(prev => prev.filter((_, j) => j !== i))}
                  className="text-gray-300 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input className="input text-sm" value={c.firstName}
                  onChange={e => setNewChildren(prev => prev.map((x, j) => j === i ? { ...x, firstName: e.target.value } : x))}
                  placeholder="Vorname" />
                <input className="input text-sm" value={c.lastName}
                  onChange={e => setNewChildren(prev => prev.map((x, j) => j === i ? { ...x, lastName: e.target.value } : x))}
                  placeholder="Nachname" />
              </div>
              <select className="input w-full text-sm"
                value={c.groupIdx}
                onChange={e => setNewChildren(prev => prev.map((x, j) => j === i ? { ...x, groupIdx: e.target.value } : x))}>
                <option value="">Gruppe wählen (optional)</option>
                {groups.filter(g => g.name.trim()).map(g => (
                  <option key={g.name} value={g.name}>{g.name}</option>
                ))}
              </select>
            </div>
          ))}
          <button onClick={() => setNewChildren(prev => [...prev, { firstName: '', lastName: '', groupIdx: '' }])}
            className="w-full py-3 rounded-xl border-2 border-dashed border-gray-200 text-sm text-gray-400 flex items-center justify-center gap-2 hover:border-brand-300 hover:text-brand-600 transition-colors">
            <Plus size={16} /> Kind hinzufügen
          </button>
          <button onClick={next} className="w-full text-sm text-gray-400 py-2">Überspringen →</button>
        </div>
      )}

      {/* ── Step 3: Staff ── */}
      {step === 3 && (
        <div className="space-y-3">
          {staffCount > 0 && (
            <div className="card p-4 flex items-center gap-3 bg-green-50 border-none">
              <CheckCircle2 size={18} className="text-green-600 flex-shrink-0" />
              <p className="text-sm text-green-800">{staffCount} Mitarbeiter:in bereits in der Einrichtung.</p>
            </div>
          )}
          <div className="card p-4 bg-brand-50 border-none">
            <p className="text-sm text-brand-800">Laden Sie Ihr Team ein. Jede Person erhält eine E-Mail mit einem Einladungslink.</p>
          </div>
          {staffEmails.map((s, i) => (
            <div key={i} className="card p-4 space-y-3">
              <div className="flex items-center gap-2">
                <input className="input flex-1 text-sm" type="email" value={s.email}
                  onChange={e => setStaffEmails(prev => prev.map((x, j) => j === i ? { ...x, email: e.target.value } : x))}
                  placeholder="email@kita.de" />
                {staffEmails.length > 1 && (
                  <button onClick={() => setStaffEmails(prev => prev.filter((_, j) => j !== i))}
                    className="text-gray-300 hover:text-red-500"><Trash2 size={15} /></button>
                )}
              </div>
              <select className="input w-full text-sm"
                value={s.role}
                onChange={e => setStaffEmails(prev => prev.map((x, j) => j === i ? { ...x, role: e.target.value } : x))}>
                <option value="educator">Erzieher:in</option>
                <option value="group_lead">Gruppenleitung</option>
                <option value="caretaker">Betreuer:in</option>
                <option value="admin">Administrator:in</option>
              </select>
            </div>
          ))}
          <button onClick={() => setStaffEmails(prev => [...prev, { email: '', role: 'educator' }])}
            className="w-full py-3 rounded-xl border-2 border-dashed border-gray-200 text-sm text-gray-400 flex items-center justify-center gap-2 hover:border-brand-300 hover:text-brand-600 transition-colors">
            <Plus size={16} /> Mitarbeiter:in hinzufügen
          </button>
          <button onClick={next} className="w-full text-sm text-gray-400 py-2">Überspringen →</button>
        </div>
      )}

      {/* ── Step 4: Parents ── */}
      {step === 4 && (
        <div className="space-y-3">
          {parentCount > 0 && (
            <div className="card p-4 flex items-center gap-3 bg-green-50 border-none">
              <CheckCircle2 size={18} className="text-green-600 flex-shrink-0" />
              <p className="text-sm text-green-800">{parentCount} {parentCount === 1 ? 'Elternteil ist' : 'Elternteile sind'} bereits registriert.</p>
            </div>
          )}
          <div className="card p-4 bg-brand-50 border-none">
            <p className="text-sm text-brand-800">Laden Sie Eltern per E-Mail ein. Sie erhalten einen Einladungslink und werden automatisch mit dem jeweiligen Kind verknüpft.</p>
          </div>
          {parentInvites.map((p, i) => (
            <div key={i} className="card p-4 space-y-3">
              <div className="flex items-center gap-2">
                <input className="input flex-1 text-sm" type="email" value={p.email}
                  onChange={e => setParentInvites(prev => prev.map((x, j) => j === i ? { ...x, email: e.target.value } : x))}
                  placeholder="eltern@email.de" />
                {parentInvites.length > 1 && (
                  <button onClick={() => setParentInvites(prev => prev.filter((_, j) => j !== i))}
                    className="text-gray-300 hover:text-red-500"><Trash2 size={15} /></button>
                )}
              </div>
              <select className="input w-full text-sm"
                value={p.childId}
                onChange={e => setParentInvites(prev => prev.map((x, j) => j === i ? { ...x, childId: e.target.value } : x))}>
                <option value="">Kind zuordnen (optional)</option>
                {allChildren.filter(c => c.first_name).map(c => (
                  <option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>
                ))}
              </select>
            </div>
          ))}
          <button onClick={() => setParentInvites(prev => [...prev, { email: '', childId: '' }])}
            className="w-full py-3 rounded-xl border-2 border-dashed border-gray-200 text-sm text-gray-400 flex items-center justify-center gap-2 hover:border-brand-300 hover:text-brand-600 transition-colors">
            <Plus size={16} /> Elternteil einladen
          </button>
          <button onClick={next} className="w-full text-sm text-gray-400 py-2">Überspringen →</button>
        </div>
      )}

      {/* ── Step 5: AVV ── */}
      {step === 5 && (
        <div className="space-y-4">
          <div className="card p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-teal-100 flex items-center justify-center flex-shrink-0">
                <Shield size={20} className="text-teal-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Auftragsverarbeitungsvertrag (AVV)</h3>
                <p className="text-xs text-gray-400">Gemäß Art. 28 DSGVO</p>
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 text-xs text-gray-600 space-y-2 leading-relaxed max-h-52 overflow-y-auto">
              <p className="font-semibold text-gray-800">Auftragsverarbeitungsvertrag gemäß Art. 28 DSGVO</p>
              <p>zwischen <strong>Hesselmann Beratung UG (haftungsbeschränkt)</strong> (Auftragsverarbeiter) und der nutzenden Kindertageseinrichtung (Verantwortlicher).</p>
              <p><strong>Gegenstand:</strong> Der Auftragsverarbeiter verarbeitet im Auftrag des Verantwortlichen personenbezogene Daten von Kindern, Erziehungsberechtigten und Mitarbeiter:innen zum Zweck der Bereitstellung der KitaHub-Plattform.</p>
              <p><strong>Verarbeitete Datenkategorien:</strong> Namen, Kontaktdaten, Anwesenheitsdaten, Tagesberichte, Fotos, Gesundheitsdaten (Allergien, Krankheitsmeldungen), Kommunikationsdaten.</p>
              <p><strong>Verarbeitungszweck:</strong> Digitale Verwaltung der Kindertageseinrichtung, Elternkommunikation, Dokumentation, Personalplanung.</p>
              <p><strong>Technische und organisatorische Maßnahmen:</strong> Verschlüsselte Übertragung (HTTPS/TLS), Zugangskontrolle (Authentifizierung), Row Level Security, tägliche Datensicherung, Serverstandort Deutschland.</p>
              <p><strong>Weisungsgebundenheit:</strong> Der Auftragsverarbeiter verarbeitet personenbezogene Daten ausschließlich auf dokumentierte Weisung des Verantwortlichen.</p>
              <p><strong>Unterauftragsverarbeiter:</strong> Mittwald CM Service GmbH & Co. KG (Hosting, DE), Supabase BV (Datenbank, EU/Frankfurt).</p>
              <p><strong>Rechte des Verantwortlichen:</strong> Der Verantwortliche kann Kontrollen durchführen. Der Auftragsverarbeiter unterstützt die Wahrnehmung von Betroffenenrechten.</p>
              <p><strong>Laufzeit:</strong> Für die Dauer des Nutzungsvertrags. Nach Vertragsende werden alle Daten nach 30 Tagen gelöscht.</p>
              <p>Ort, Datum und digitale Bestätigung werden automatisch gespeichert.</p>
            </div>
            <label className="flex items-start gap-3 cursor-pointer group">
              <div className={`w-5 h-5 rounded flex-shrink-0 border-2 flex items-center justify-center mt-0.5 transition-colors
                ${avvAccepted ? 'bg-teal-600 border-teal-600' : 'border-gray-300 group-hover:border-teal-400'}`}
                onClick={() => { setAvvAccepted(v => !v); if (errors.avv) setErrors({}) }}>
                {avvAccepted && <Check size={12} className="text-white" />}
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">
                Ich bestätige als bevollmächtigter Vertreter der Einrichtung, dass ich den obenstehenden Auftragsverarbeitungsvertrag gelesen habe und ihm im Namen der Einrichtung zustimme. Diese Bestätigung wird mit Zeitstempel, Benutzer-ID und IP-Adresse gespeichert.
              </p>
            </label>
            {errors.avv && <p className="text-xs text-red-500">{errors.avv}</p>}
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <Info size={12} />
              <span>Die Nutzung von KitaHub mit echten Kinderdaten ist ohne gültigen AVV nicht zulässig.</span>
            </div>
          </div>
        </div>
      )}

      {/* ── Step 6: Done ── */}
      {step === 6 && (
        <div className="space-y-4 text-center">
          <div className="card p-8 space-y-4">
            <div className="text-5xl">🎉</div>
            <h2 className="text-xl font-bold text-gray-900">KitaHub ist eingerichtet!</h2>
            <p className="text-sm text-gray-500 leading-relaxed">
              Ihre Kita ist jetzt bereit. Das Team erhält in Kürze Einladungs-E-Mails. Eltern können sich über ihre Einladungslinks registrieren.
            </p>
            {avvTimestamp && (
              <div className="bg-teal-50 rounded-xl p-3 text-xs text-teal-700">
                <Shield size={12} className="inline mr-1" />
                AVV bestätigt am {new Date(avvTimestamp).toLocaleString('de-DE')}
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="card p-4 text-left">
              <p className="text-2xl font-bold text-brand-600">{groups.filter(g => g.name.trim()).length}</p>
              <p className="text-xs text-gray-400">Gruppe(n)</p>
            </div>
            <div className="card p-4 text-left">
              <p className="text-2xl font-bold text-green-600">{initialChildren.length + newChildren.filter(c => c.firstName.trim()).length}</p>
              <p className="text-xs text-gray-400">Kinder</p>
            </div>
            <div className="card p-4 text-left">
              <p className="text-2xl font-bold text-purple-600">{staffEmails.filter(s => s.email.trim()).length}</p>
              <p className="text-xs text-gray-400">Team-Einladungen</p>
            </div>
            <div className="card p-4 text-left">
              <p className="text-2xl font-bold text-pink-600">{parentInvites.filter(p => p.email.trim()).length}</p>
              <p className="text-xs text-gray-400">Eltern-Einladungen</p>
            </div>
          </div>
          <button onClick={() => router.push('/admin')}
            className="w-full btn-primary py-4 rounded-2xl flex items-center justify-center gap-2 text-base">
            <Sparkles size={20} /> Zum Admin-Dashboard <ArrowRight size={18} />
          </button>
        </div>
      )}

      {/* Navigation */}
      {step < 6 && (
        <div className="flex gap-3">
          {step > 0 && (
            <button onClick={prev} disabled={saving}
              className="flex items-center gap-2 px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-40">
              <ChevronLeft size={16} /> Zurück
            </button>
          )}
          <button
            onClick={
              step === 0 ? saveKita :
              step === 1 ? saveGroups :
              step === 2 ? saveChildren :
              step === 3 ? saveStaff :
              step === 4 ? saveParents :
              step === 5 ? saveAvv :
              next
            }
            disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 bg-brand-600 text-white py-3 rounded-xl font-semibold text-sm hover:bg-brand-700 transition-colors disabled:opacity-50">
            {saving ? (
              <><Loader2 size={16} className="animate-spin" /> Speichern…</>
            ) : step === 5 ? (
              <><Check size={16} /> AVV bestätigen & abschließen</>
            ) : (
              <>Weiter <ChevronRight size={16} /></>
            )}
          </button>
        </div>
      )}
    </div>
  )
}
