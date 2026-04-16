import type { Metadata, Viewport } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import { ToastProvider } from '@/components/ui/toast'
import { ConfirmProvider } from '@/components/ui/dialog'
import { ThemeScript } from '@/components/ui/theme-toggle'
import './globals.css'

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-plus-jakarta',
  display: 'swap',
})

export const metadata: Metadata = {
  title: { default: 'KitaHub', template: '%s | KitaHub' },
  description: 'Die digitale Kita-App für Eltern und Erzieher',
  manifest: '/manifest.json',
  icons: { icon: '/favicon.ico', apple: '/apple-touch-icon.png' },
  robots: 'noindex, nofollow', // App requires login – keep out of search engines
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#1A3C5E',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" suppressHydrationWarning className={plusJakartaSans.variable}>
      <head>
        {/* Theme init script — prevents FOUC on dark mode */}
        <script dangerouslySetInnerHTML={{ __html: ThemeScript }} />
      </head>
      <body className="font-sans antialiased">
        {/* Skip navigation for keyboard/screen-reader users */}
        <a href="#main-content" className="skip-link">
          Zum Hauptinhalt springen
        </a>
        <ConfirmProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </ConfirmProvider>
      </body>
    </html>
  )
}
