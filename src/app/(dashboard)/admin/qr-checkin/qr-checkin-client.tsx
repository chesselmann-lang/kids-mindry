'use client'

import { useState, useRef, useEffect } from 'react'
import { Printer, Download, Search, Users, QrCode, ChevronDown } from 'lucide-react'

interface Child {
  id: string
  first_name: string
  last_name: string
  group_id: string | null
  groups: { name: string; color: string } | null
}

interface Group { id: string; name: string; color: string }

interface Props {
  children: Child[]
  groups: Group[]
  appUrl: string
}

// Generate QR code using the Google Charts API (no npm package needed)
function QrCodeImage({ url, size = 180 }: { url: string; size?: number }) {
  const encoded = encodeURIComponent(url)
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encoded}&margin=10`}
      alt="QR Code"
      width={size}
      height={size}
      className="rounded-lg"
      loading="lazy"
    />
  )
}

export default function QrCheckinClient({ children, groups, appUrl }: Props) {
  const [search, setSearch] = useState('')
  const [selectedGroup, setSelectedGroup] = useState<string>('all')
  const [printMode, setPrintMode] = useState<'single' | 'all' | null>(null)
  const [selectedChild, setSelectedChild] = useState<Child | null>(null)
  const printRef = useRef<HTMLDivElement>(null)

  const filtered = children.filter(c => {
    const matchesSearch = search.trim() === '' ||
      `${c.first_name} ${c.last_name}`.toLowerCase().includes(search.toLowerCase())
    const matchesGroup = selectedGroup === 'all' || c.group_id === selectedGroup
    return matchesSearch && matchesGroup
  })

  function printAll() {
    window.print()
  }

  function printSingle(child: Child) {
    setSelectedChild(child)
    setTimeout(() => window.print(), 200)
  }

  return (
    <>
      {/* Print styles */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print-area, .print-area * { visibility: visible; }
          .print-area { position: fixed; top: 0; left: 0; width: 100%; }
          .no-print { display: none !important; }
        }
      `}</style>

      {/* Controls */}
      <div className="no-print space-y-3">
        {/* Search & Filter */}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="input pl-9 text-sm w-full"
              placeholder="Kind suchen…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="relative">
            <select
              className="input pr-8 text-sm appearance-none"
              value={selectedGroup}
              onChange={e => setSelectedGroup(e.target.value)}
            >
              <option value="all">Alle Gruppen</option>
              {groups.map(g => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Print all button */}
        <button
          onClick={printAll}
          className="w-full py-2.5 rounded-xl bg-brand-600 text-white text-sm font-semibold flex items-center justify-center gap-2 hover:bg-brand-700 transition-colors"
        >
          <Printer size={16} />
          Alle {filtered.length} QR-Codes drucken
        </button>

        {/* Count */}
        <p className="text-xs text-gray-400 text-center">
          {filtered.length} von {children.length} Kindern
        </p>
      </div>

      {/* QR Grid — visible on screen AND in print */}
      <div className="print-area">
        {/* Screen view: compact cards */}
        <div className="no-print grid grid-cols-2 gap-3">
          {filtered.map(child => (
            <div key={child.id} className="card p-3 space-y-2 text-center">
              {/* Group badge */}
              {child.groups && (
                <span className="text-xs px-2 py-0.5 rounded-full font-medium text-white inline-block"
                  style={{ backgroundColor: child.groups.color }}>
                  {child.groups.name}
                </span>
              )}

              {/* QR Code */}
              <div className="flex justify-center">
                <QrCodeImage url={`${appUrl}/checkin/${child.id}`} size={140} />
              </div>

              {/* Name */}
              <p className="font-semibold text-sm text-gray-900">
                {child.first_name}<br />
                <span className="text-gray-500 font-normal">{child.last_name}</span>
              </p>

              {/* Print single */}
              <button
                onClick={() => printSingle(child)}
                className="w-full text-xs py-1.5 rounded-xl bg-gray-50 text-gray-500 hover:bg-gray-100 transition-colors flex items-center justify-center gap-1"
              >
                <Printer size={11} /> Nur dieses
              </button>
            </div>
          ))}
        </div>

        {/* Print view: A4-style grid, 4 per row */}
        <div className="hidden print:block">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', padding: '16px' }}>
            {filtered.map(child => (
              <div key={child.id} style={{
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                padding: '12px',
                textAlign: 'center',
                breakInside: 'avoid',
              }}>
                {child.groups && (
                  <div style={{
                    display: 'inline-block',
                    backgroundColor: child.groups.color,
                    color: 'white',
                    borderRadius: '99px',
                    padding: '2px 10px',
                    fontSize: '10px',
                    fontWeight: 600,
                    marginBottom: '6px',
                  }}>
                    {child.groups.name}
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '6px' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(`${appUrl}/checkin/${child.id}`)}&margin=5`}
                    alt={`QR ${child.first_name}`}
                    width={160}
                    height={160}
                    style={{ borderRadius: '8px' }}
                  />
                </div>
                <p style={{ fontWeight: 700, fontSize: '13px', margin: 0, color: '#111827' }}>
                  {child.first_name} {child.last_name}
                </p>
                <p style={{ fontSize: '9px', color: '#9ca3af', marginTop: '2px' }}>
                  {appUrl}/checkin/{child.id.slice(0, 8)}…
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {filtered.length === 0 && (
        <div className="no-print card p-8 text-center">
          <QrCode size={36} className="text-gray-200 mx-auto mb-3" />
          <p className="text-sm text-gray-400">Keine Kinder gefunden</p>
        </div>
      )}
    </>
  )
}
