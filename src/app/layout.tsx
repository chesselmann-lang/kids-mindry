import type { Metadata, Viewport } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import { ToastProvider } from '@/components/ui/toast'
import { ConfirmProvider } from '@/components/ui/dialog'
import { ThemeScript } from '@/components/ui/theme-toggle'
import ConsentBanner from '@/components/ui/consent-banner'
import { PostHogProvider } from '@/components/PostHogProvider'
import './globals.css'

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-plus-jakarta',
  display: 'swap',
})

export const metadata: Metadata = {
  title: { default: 'mindry kids', template: '%s · mindry kids' },
  description: 'Die sichere Kita-App für Kinder, Eltern und Erzieher',
  manifest: '/manifest.json',
  icons: { icon: '/favicon.ico', apple: '/apple-touch-icon.png' },
  robots: 'noindex, nofollow', // App requires login – keep out of search engines
  other: {
    // KJM Altersklassifizierung (§ 5 JMStV / Kommission für Jugendmedienschutz)
    // kids.mindry.de ist eine Kinder-App: Altersfreigabe FSK/KJM 0+
    'rating': 'safe for kids',
    'DC.audience': 'children',
    // ICRA / IWF child safety meta tags
    'ICRA_label': '0+',
  },
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
        <PostHogProvider>
          <ConfirmProvider>
            <ToastProvider>
              {children}
              {/* Art. 8 DSGVO: consent banner — child-friendly, Eltern-PIN required to decline optional cookies */}
              <ConsentBanner />
            </ToastProvider>
          </ConfirmProvider>
        </PostHogProvider>
      </body>
    </html>
  )
}
