'use client'

import { useState } from 'react'
import { Download, Loader2, FileText } from 'lucide-react'

interface Fee {
  id: string
  amount: number
  due_date?: string | null
  period_month?: string | null
  paid_at?: string | null
  status: string
  fee_type?: string | null
  notes?: string | null
  children?: { first_name: string; last_name: string } | null
  iban?: string | null
  mandate_ref?: string | null
}

interface Props {
  fees: Fee[]
  currentMonth?: string  // YYYY-MM
}

function csvVal(v: string | null | undefined): string {
  if (v == null) return ''
  const s = String(v)
  if (s.includes(';') || s.includes('"') || s.includes('\n')) return `"${s.replace(/"/g, '""')}"`
  return s
}

function formatAmount(a: number | null | undefined): string {
  if (a == null) return ''
  return a.toFixed(2).replace('.', ',') + ' EUR'
}

export default function ExportButton({ fees, currentMonth }: Props) {
  const [loading, setLoading] = useState(false)

  function downloadCsv() {
    setLoading(true)
    try {
      const statusLabel: Record<string, string> = {
        pending: 'Ausstehend', paid: 'Bezahlt', overdue: 'Überfällig',
        cancelled: 'Storniert', partial: 'Teilbezahlt',
      }

      const rows = [
        'Vorname;Nachname;Betrag;Fälligkeitsdatum;Bezahlt am;Status;Typ;IBAN;Mandat;Notizen',
        ...fees.map(f => [
          csvVal(f.children?.first_name),
          csvVal(f.children?.last_name),
          csvVal(formatAmount(f.amount)),
          csvVal(f.due_date?.split('T')[0] ?? f.period_month),
          csvVal(f.paid_at?.split('T')[0]),
          csvVal(statusLabel[f.status] ?? f.status),
          csvVal(f.fee_type),
          csvVal(f.iban),
          csvVal(f.mandate_ref),
          csvVal(f.notes),
        ].join(';')),
      ]

      const csv = '\uFEFF' + rows.join('\n')
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `gebuehren_${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setLoading(false)
    }
  }

  function downloadSepaXml() {
    setLoading(true)
    try {
      const unpaid = fees.filter(f => f.status !== 'paid' && f.status !== 'cancelled')
      const now = new Date()
      const msgId = `KITA${now.getTime()}`
      const execDate = now.toISOString().split('T')[0]
      const total = unpaid.reduce((s, f) => s + Number(f.amount), 0).toFixed(2)

      const txs = unpaid.map((f, i) => {
        const name = f.children ? `${f.children.first_name} ${f.children.last_name}` : 'Unbekannt'
        const amt = Number(f.amount).toFixed(2)
        const ref = f.mandate_ref ?? `MANDATE-${f.id.slice(0, 8).toUpperCase()}`
        const iban = f.iban ?? 'DE00000000000000000000'
        return `    <DrctDbtTxInf>
      <PmtId><EndToEndId>ENDTOEND-${i + 1}</EndToEndId></PmtId>
      <InstdAmt Ccy="EUR">${amt}</InstdAmt>
      <DrctDbtTx>
        <MndtRltdInf>
          <MndtId>${ref}</MndtId>
          <DtOfSgntr>${execDate}</DtOfSgntr>
        </MndtRltdInf>
      </DrctDbtTx>
      <DbtrAgt><FinInstnId><BIC>NOTPROVIDED</BIC></FinInstnId></DbtrAgt>
      <Dbtr><Nm>${name}</Nm></Dbtr>
      <DbtrAcct><Id><IBAN>${iban}</IBAN></Id></DbtrAcct>
      <Purp><Cd>CGDD</Cd></Purp>
      <RmtInf><Ustrd>Kita-Gebuehr ${f.period_month ?? execDate}</Ustrd></RmtInf>
    </DrctDbtTxInf>`
      }).join('\n')

      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:pain.008.003.02">
  <CstmrDrctDbtInitn>
    <GrpHdr>
      <MsgId>${msgId}</MsgId>
      <CreDtTm>${now.toISOString().slice(0, 19)}</CreDtTm>
      <NbOfTxs>${unpaid.length}</NbOfTxs>
      <CtrlSum>${total}</CtrlSum>
      <InitgPty><Nm>KitaHub</Nm></InitgPty>
    </GrpHdr>
    <PmtInf>
      <PmtInfId>PMT-${msgId}</PmtInfId>
      <PmtMtd>DD</PmtMtd>
      <NbOfTxs>${unpaid.length}</NbOfTxs>
      <CtrlSum>${total}</CtrlSum>
      <PmtTpInf>
        <SvcLvl><Cd>SEPA</Cd></SvcLvl>
        <LclInstrm><Cd>CORE</Cd></LclInstrm>
        <SeqTp>RCUR</SeqTp>
      </PmtTpInf>
      <ReqdColltnDt>${execDate}</ReqdColltnDt>
      <Cdtr><Nm>KitaHub</Nm></Cdtr>
      <CdtrAcct><Id><IBAN>DE00000000000000000000</IBAN></Id></CdtrAcct>
      <CdtrAgt><FinInstnId><BIC>NOTPROVIDED</BIC></FinInstnId></CdtrAgt>
      <CdtrSchmeId>
        <Id><PrvtId><Othr><Id>DE00ZZZ00000000000</Id><SchmeNm><Prtry>SEPA</Prtry></SchmeNm></Othr></PrvtId></Id>
      </CdtrSchmeId>
${txs}
    </PmtInf>
  </CstmrDrctDbtInitn>
</Document>`

      const blob = new Blob([xml], { type: 'application/xml;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `sepa_lastschrift_${execDate}.xml`
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setLoading(false)
    }
  }

  const monthQuery = currentMonth ?? new Date().toISOString().slice(0, 7)

  return (
    <div className="flex flex-wrap gap-2">
      <button onClick={downloadCsv} disabled={loading || fees.length === 0}
        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-100 text-gray-700 text-xs font-semibold hover:bg-gray-200 disabled:opacity-50">
        {loading ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />}
        CSV Export
      </button>
      <button onClick={downloadSepaXml} disabled={loading}
        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-brand-100 text-brand-700 text-xs font-semibold hover:bg-brand-200 disabled:opacity-50">
        {loading ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />}
        SEPA XML
      </button>
      <a
        href={`/api/monatsabrechnung?month=${monthQuery}&print=1`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-semibold hover:bg-emerald-100 transition-colors"
      >
        <FileText size={13} />
        Monatsabrechnung PDF
      </a>
    </div>
  )
}
