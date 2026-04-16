'use client'

import { useState } from 'react'
import {
  FileText, Plus, ExternalLink, Loader2, Link2,
  Chrome, Briefcase, CheckCircle2, AlertCircle
} from 'lucide-react'

type Provider = 'google' | 'microsoft'

interface DocFile {
  id: string
  name: string
  webViewLink?: string  // Google
  webUrl?: string       // Microsoft
  mimeType?: string
  modifiedTime?: string
  lastModifiedDateTime?: string
}

interface Integration {
  provider: Provider
  email: string
}

interface Props {
  integrations: Integration[]
  isAdmin: boolean
}

const PROVIDER_CONFIG = {
  google: {
    label: 'Google Drive',
    icon: '🔵',
    color: 'blue',
    connectHref: '/api/docs/google/connect',
    filesApi: '/api/docs/google/files',
  },
  microsoft: {
    label: 'OneDrive / M365',
    icon: '🟦',
    color: 'indigo',
    connectHref: '/api/docs/microsoft/connect',
    filesApi: '/api/docs/microsoft/files',
  },
}

function ProviderTab({
  provider,
  integration,
  isAdmin,
}: {
  provider: Provider
  integration?: Integration
  isAdmin: boolean
}) {
  const cfg = PROVIDER_CONFIG[provider]
  const [files, setFiles] = useState<DocFile[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [creating, setCreating] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [newUrl, setNewUrl] = useState<string | null>(null)

  async function loadFiles() {
    setLoading(true); setError(null)
    const res = await fetch(cfg.filesApi)
    const data = await res.json()
    if (data.error) setError(data.error)
    else setFiles(data.files)
    setLoading(false)
  }

  async function createDoc() {
    if (!newTitle.trim()) return
    setCreating(true)
    const res = await fetch(cfg.filesApi, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newTitle }),
    })
    const data = await res.json()
    if (data.url) {
      setNewUrl(data.url)
      setNewTitle('')
      setShowCreate(false)
      loadFiles()
    } else {
      setError(data.error)
    }
    setCreating(false)
  }

  if (!integration) {
    return (
      <div className="flex flex-col items-center gap-4 py-12 text-center">
        <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center text-2xl">
          {cfg.icon}
        </div>
        <div>
          <p className="font-semibold text-gray-800">{cfg.label} nicht verbunden</p>
          <p className="text-sm text-gray-400 mt-1">
            {isAdmin
              ? 'Verbinde dein Konto um Dokumente direkt aus KitaHub zu öffnen und zu erstellen.'
              : 'Ein Admin muss zuerst das Konto verbinden.'}
          </p>
        </div>
        {isAdmin && (
          <a
            href={cfg.connectHref}
            className="btn-primary px-5 py-2.5 flex items-center gap-2 text-sm"
          >
            <Link2 size={15} /> {cfg.label} verbinden
          </a>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Connected badge + actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 rounded-lg px-3 py-1.5">
          <CheckCircle2 size={13} />
          Verbunden als {integration.email}
        </div>
        <div className="flex gap-2">
          {!files && (
            <button onClick={loadFiles} disabled={loading} className="text-sm text-brand-600 hover:underline flex items-center gap-1">
              {loading ? <Loader2 size={13} className="animate-spin" /> : null} Dateien laden
            </button>
          )}
          {isAdmin && (
            <button
              onClick={() => setShowCreate(!showCreate)}
              className="btn-primary px-3 py-1.5 text-xs flex items-center gap-1"
            >
              <Plus size={13} /> Neues Dokument
            </button>
          )}
        </div>
      </div>

      {/* Create form */}
      {showCreate && (
        <div className="card p-4 flex gap-2">
          <input
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            placeholder="Dokumenttitel…"
            className="input flex-1"
            onKeyDown={e => e.key === 'Enter' && createDoc()}
          />
          <button onClick={createDoc} disabled={creating} className="btn-primary px-4 flex items-center gap-1 text-sm">
            {creating ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />}
            Erstellen
          </button>
        </div>
      )}

      {newUrl && (
        <a
          href={newUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 p-3 rounded-xl bg-green-50 text-green-700 text-sm"
        >
          <CheckCircle2 size={16} /> Dokument erstellt — Jetzt öffnen <ExternalLink size={13} />
        </a>
      )}

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 text-red-600 text-sm">
          <AlertCircle size={15} /> {error}
        </div>
      )}

      {/* File list */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 size={24} className="animate-spin text-gray-300" />
        </div>
      )}

      {files && (
        <div className="space-y-2">
          {files.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-6">Keine Dokumente gefunden</p>
          )}
          {files.map(f => {
            const url = f.webViewLink ?? f.webUrl ?? '#'
            const modified = f.modifiedTime ?? f.lastModifiedDateTime
            return (
              <a
                key={f.id}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="card p-3 flex items-center gap-3 hover:shadow-md transition-shadow"
              >
                <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <FileText size={16} className="text-gray-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{f.name}</p>
                  {modified && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(modified).toLocaleDateString('de-DE')}
                    </p>
                  )}
                </div>
                <ExternalLink size={14} className="text-gray-300 flex-shrink-0" />
              </a>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function DokumenteClient({ integrations, isAdmin }: Props) {
  const [tab, setTab] = useState<Provider>('google')

  const getIntegration = (p: Provider) => integrations.find(i => i.provider === p)

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Dokumente</h1>
          <p className="text-sm text-gray-400">Google Drive & OneDrive</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
        {(['google', 'microsoft'] as Provider[]).map(p => (
          <button
            key={p}
            onClick={() => setTab(p)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === p ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {p === 'google' ? <Chrome size={15} /> : <Briefcase size={15} />}
            {p === 'google' ? 'Google Drive' : 'OneDrive'}
            {getIntegration(p) && (
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <ProviderTab
        provider={tab}
        integration={getIntegration(tab)}
        isAdmin={isAdmin}
      />
    </div>
  )
}
