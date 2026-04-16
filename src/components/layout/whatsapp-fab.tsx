'use client'

import { useState } from 'react'
import Link from 'next/link'
import { X, MessageCircle, Phone, Mail, Users } from 'lucide-react'

// Konfiguration: Bitte Nummer anpassen
const WA_NUMBER = '491234567890' // Format: 49XXXXXXXXX (ohne +)
const WA_MSG = encodeURIComponent('Hallo! Ich interessiere mich für KitaHub. Könnten Sie mir mehr Informationen geben?')

export default function WhatsAppFab() {
  const [open, setOpen] = useState(false)

  return (
    <div className="fixed bottom-24 right-4 z-50 flex flex-col items-end gap-3 print:hidden">
      {/* Contact options popup */}
      {open && (
        <div className="flex flex-col gap-2 animate-slide-up">
          {/* WhatsApp */}
          <a
            href={`https://wa.me/${WA_NUMBER}?text=${WA_MSG}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 bg-white rounded-2xl shadow-float px-4 py-3 hover:shadow-card-hover transition-all duration-150 group"
          >
            <div className="w-10 h-10 rounded-xl bg-[#25D366] flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">WhatsApp</p>
              <p className="text-xs text-gray-400">Jetzt chatten</p>
            </div>
          </a>

          {/* Phone */}
          <a
            href="tel:+491234567890"
            className="flex items-center gap-3 bg-white rounded-2xl shadow-float px-4 py-3 hover:shadow-card-hover transition-all duration-150 group"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
              <Phone size={18} className="text-blue-700" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">Anrufen</p>
              <p className="text-xs text-gray-400">Mo–Fr 9–17 Uhr</p>
            </div>
          </a>

          {/* Email */}
          <a
            href="mailto:hallo@hesselmann-service.de?subject=KitaHub Anfrage"
            className="flex items-center gap-3 bg-white rounded-2xl shadow-float px-4 py-3 hover:shadow-card-hover transition-all duration-150 group"
          >
            <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
              <Mail size={18} className="text-violet-700" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">E-Mail</p>
              <p className="text-xs text-gray-400">hallo@hesselmann-service.de</p>
            </div>
          </a>

          {/* Online Anmeldung für Eltern */}
          <Link
            href="/anmelden"
            className="flex items-center gap-3 bg-white rounded-2xl shadow-float px-4 py-3 hover:shadow-card-hover transition-all duration-150 group"
          >
            <div className="w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
              <Users size={18} className="text-brand-700" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">Platz anfragen</p>
              <p className="text-xs text-gray-400">Online-Anmeldung für Eltern</p>
            </div>
          </Link>
        </div>
      )}

      {/* FAB button */}
      <button
        onClick={() => setOpen(o => !o)}
        className={`w-14 h-14 rounded-full shadow-float flex items-center justify-center transition-all duration-300 wa-pulse ${
          open ? 'bg-gray-800 rotate-45' : 'bg-[#25D366]'
        }`}
        aria-label="Kontakt"
      >
        {open
          ? <X size={22} className="text-white" />
          : (
            <svg viewBox="0 0 24 24" className="w-7 h-7 fill-white">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
            </svg>
          )
        }
      </button>
    </div>
  )
}
