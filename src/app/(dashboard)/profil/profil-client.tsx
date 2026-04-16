'use client'

import { useState } from 'react'
import Link from 'next/link'
import { User, Bell, Shield, ChevronRight, Edit2, UserX } from 'lucide-react'
import EditForm from './edit-form'
import PasswortReset from './passwort-reset'

interface Props {
  profileId: string
  fullName: string
  phone: string
  email: string
  isParent: boolean
}

export default function ProfilClient({ profileId, fullName, phone, email, isParent }: Props) {
  const [showEdit, setShowEdit] = useState(false)
  const [showSecurity, setShowSecurity] = useState(false)

  return (
    <>
      {showEdit && (
        <EditForm
          profileId={profileId}
          initialName={fullName}
          initialPhone={phone}
          onClose={() => setShowEdit(false)}
        />
      )}

      {/* Quick action: Abmelden für Eltern */}
      {isParent && (
        <Link
          href="/anwesenheit"
          className="card p-4 flex items-center gap-4 hover:shadow-card-hover transition-shadow"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-red-100 to-red-200 flex items-center justify-center flex-shrink-0">
            <UserX size={18} className="text-red-600" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-sm text-gray-900">Kind abmelden</p>
            <p className="text-xs text-gray-400">Krankmeldung oder Abwesenheit</p>
          </div>
          <ChevronRight size={16} className="text-gray-300" />
        </Link>
      )}

      {/* Einstellungen */}
      <div>
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Einstellungen</h2>
        <div className="card divide-y divide-gray-50">
          {/* Persönliche Daten */}
          <button
            onClick={() => setShowEdit(true)}
            className="w-full flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors"
          >
            <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
              <User size={17} className="text-gray-600" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-medium text-gray-900">Persönliche Daten</p>
              <p className="text-xs text-gray-400">Name, Telefon</p>
            </div>
            <Edit2 size={15} className="text-gray-300" />
          </button>

          {/* Benachrichtigungen */}
          <Link href="/benachrichtigungen" className="w-full flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors">
            <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
              <Bell size={17} className="text-gray-600" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-medium text-gray-900">Benachrichtigungen</p>
              <p className="text-xs text-gray-400">Posteingang ansehen</p>
            </div>
            <ChevronRight size={16} className="text-gray-300" />
          </Link>

          {/* Sicherheit mit Passwort */}
          <div>
            <button
              onClick={() => setShowSecurity(!showSecurity)}
              className="w-full flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors"
            >
              <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                <Shield size={17} className="text-gray-600" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-gray-900">Datenschutz & Sicherheit</p>
                <p className="text-xs text-gray-400">Passwort ändern</p>
              </div>
              <ChevronRight size={16} className={`text-gray-300 transition-transform ${showSecurity ? 'rotate-90' : ''}`} />
            </button>
            {showSecurity && <PasswortReset email={email} />}
          </div>
        </div>
      </div>
    </>
  )
}
