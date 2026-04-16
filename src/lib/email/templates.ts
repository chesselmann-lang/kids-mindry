// src/lib/email/templates.ts
// HTML-E-Mail-Templates für KitaHub

const BASE_STYLE = `
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background: #f9fafb;
  margin: 0;
  padding: 0;
`

const CARD_STYLE = `
  max-width: 560px;
  margin: 32px auto;
  background: white;
  border-radius: 16px;
  border: 1px solid #e5e7eb;
  overflow: hidden;
`

function emailBase(content: string, title: string): string {
  return `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="${BASE_STYLE}">
  <div style="${CARD_STYLE}">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #3b82f6, #6366f1); padding: 32px 32px 24px;">
      <div style="font-size: 20px; font-weight: 800; color: white; letter-spacing: -0.5px;">
        🧸 KitaHub
      </div>
      <div style="font-size: 12px; color: rgba(255,255,255,0.75); margin-top: 4px;">
        von Hesselmann Beratung UG
      </div>
    </div>
    <!-- Content -->
    <div style="padding: 32px;">
      ${content}
    </div>
    <!-- Footer -->
    <div style="background: #f9fafb; border-top: 1px solid #e5e7eb; padding: 20px 32px; text-align: center;">
      <p style="font-size: 11px; color: #9ca3af; margin: 0;">
        KitaHub · Hesselmann Beratung UG (haftungsbeschränkt)<br>
        Schloßstraße 184, 46535 Dinslaken · <a href="mailto:hallo@hesselmann-its.de" style="color: #9ca3af;">hallo@hesselmann-its.de</a>
      </p>
      <p style="font-size: 11px; color: #9ca3af; margin: 8px 0 0;">
        <a href="https://kids.mindry.de/impressum" style="color: #9ca3af;">Impressum</a> ·
        <a href="https://kids.mindry.de/datenschutz-kitahub" style="color: #9ca3af;">Datenschutz</a>
      </p>
    </div>
  </div>
</body>
</html>`
}

// ─── Template: Willkommen / Onboarding ────────────────────────────────────────
export function welcomeEmail(opts: { name: string; role: string; kitaName: string; loginUrl: string }): { subject: string; html: string } {
  const roleLabel: Record<string, string> = {
    admin: 'Administrator',
    educator: 'Erzieherin',
    group_lead: 'Gruppenleitung',
    parent: 'Erziehungsberechtigte/r',
  }
  const html = emailBase(`
    <h1 style="font-size: 22px; font-weight: 800; color: #111827; margin: 0 0 8px;">
      Willkommen bei KitaHub! 👋
    </h1>
    <p style="color: #4b5563; font-size: 15px; line-height: 1.6; margin: 0 0 24px;">
      Hallo ${opts.name}, Sie wurden als <strong>${roleLabel[opts.role] ?? opts.role}</strong> für <strong>${opts.kitaName}</strong> eingeladen.
    </p>
    <a href="${opts.loginUrl}" style="display: inline-block; background: #3b82f6; color: white; text-decoration: none; font-weight: 600; font-size: 15px; padding: 14px 28px; border-radius: 10px; margin-bottom: 24px;">
      Jetzt anmelden →
    </a>
    <div style="background: #f3f4f6; border-radius: 10px; padding: 16px; font-size: 13px; color: #6b7280;">
      <strong style="color: #374151;">Ihre Zugangsdaten:</strong><br>
      Plattform: <a href="${opts.loginUrl}" style="color: #3b82f6;">kids.mindry.de</a><br>
      Einrichtung: ${opts.kitaName}
    </div>
  `, 'Willkommen bei KitaHub')

  return { subject: `Willkommen bei KitaHub – ${opts.kitaName}`, html }
}

// ─── Template: Neue Mitteilung ─────────────────────────────────────────────────
export function announcementEmail(opts: { recipientName: string; title: string; preview: string; kitaName: string; url: string }): { subject: string; html: string } {
  const html = emailBase(`
    <div style="display: inline-block; background: #eff6ff; border: 1px solid #bfdbfe; color: #1d4ed8; font-size: 12px; font-weight: 600; padding: 4px 10px; border-radius: 20px; margin-bottom: 16px;">
      📢 Neue Mitteilung
    </div>
    <h1 style="font-size: 20px; font-weight: 800; color: #111827; margin: 0 0 8px;">${opts.title}</h1>
    <p style="color: #4b5563; font-size: 15px; line-height: 1.6; margin: 0 0 24px;">
      ${opts.preview}
    </p>
    <a href="${opts.url}" style="display: inline-block; background: #3b82f6; color: white; text-decoration: none; font-weight: 600; font-size: 14px; padding: 12px 24px; border-radius: 10px; margin-bottom: 24px;">
      Mitteilung lesen →
    </a>
    <p style="font-size: 13px; color: #9ca3af; margin: 0;">Von: ${opts.kitaName}</p>
  `, opts.title)

  return { subject: `${opts.kitaName}: ${opts.title}`, html }
}

// ─── Template: Online-Anmeldung eingegangen ────────────────────────────────────
export function anmeldungEingegangen(opts: { adminName: string; childName: string; childDob: string; parentName: string; parentEmail: string; wunsch: string; adminUrl: string }): { subject: string; html: string } {
  const html = emailBase(`
    <div style="display: inline-block; background: #f0fdf4; border: 1px solid #bbf7d0; color: #15803d; font-size: 12px; font-weight: 600; padding: 4px 10px; border-radius: 20px; margin-bottom: 16px;">
      ✅ Neue Anmeldung
    </div>
    <h1 style="font-size: 20px; font-weight: 800; color: #111827; margin: 0 0 8px;">
      Neue Online-Anmeldung eingegangen
    </h1>
    <p style="color: #4b5563; font-size: 14px; line-height: 1.6; margin: 0 0 20px;">
      Über das Anmeldeportal wurde eine neue Anfrage eingereicht.
    </p>
    <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 10px; padding: 16px; margin-bottom: 24px; font-size: 14px; color: #374151;">
      <div style="display: grid; gap: 8px;">
        <div><strong>Kind:</strong> ${opts.childName} (geb. ${opts.childDob})</div>
        <div><strong>Erziehungsberechtigt:</strong> ${opts.parentName}</div>
        <div><strong>E-Mail:</strong> ${opts.parentEmail}</div>
        <div><strong>Betreuungswunsch:</strong> ${opts.wunsch}</div>
      </div>
    </div>
    <a href="${opts.adminUrl}" style="display: inline-block; background: #3b82f6; color: white; text-decoration: none; font-weight: 600; font-size: 14px; padding: 12px 24px; border-radius: 10px;">
      Anmeldung bearbeiten →
    </a>
  `, 'Neue Online-Anmeldung')

  return { subject: `Neue Anmeldung: ${opts.childName}`, html }
}

// ─── Template: Passwort zurücksetzen ──────────────────────────────────────────
// (Wird von Supabase Auth gesendet, aber wir definieren das Template für Custom Email)
export function passwordResetEmail(opts: { name: string; resetUrl: string }): { subject: string; html: string } {
  const html = emailBase(`
    <h1 style="font-size: 22px; font-weight: 800; color: #111827; margin: 0 0 8px;">
      Passwort zurücksetzen 🔐
    </h1>
    <p style="color: #4b5563; font-size: 15px; line-height: 1.6; margin: 0 0 24px;">
      Hallo ${opts.name}, Sie haben angefragt, Ihr Passwort zurückzusetzen. Klicken Sie auf den Button, um ein neues Passwort zu wählen.
    </p>
    <a href="${opts.resetUrl}" style="display: inline-block; background: #3b82f6; color: white; text-decoration: none; font-weight: 600; font-size: 15px; padding: 14px 28px; border-radius: 10px; margin-bottom: 24px;">
      Neues Passwort wählen →
    </a>
    <p style="font-size: 13px; color: #9ca3af; margin: 0;">
      Dieser Link ist 24 Stunden gültig. Falls Sie keine Anfrage gestellt haben, können Sie diese E-Mail ignorieren.
    </p>
  `, 'Passwort zurücksetzen')

  return { subject: 'KitaHub – Passwort zurücksetzen', html }
}

// ─── Template: Abo-Bestätigung ─────────────────────────────────────────────────
export function subscriptionConfirmEmail(opts: { name: string; plan: string; trialEnd: string | null }): { subject: string; html: string } {
  const html = emailBase(`
    <h1 style="font-size: 22px; font-weight: 800; color: #111827; margin: 0 0 8px;">
      Abonnement aktiviert 🎉
    </h1>
    <p style="color: #4b5563; font-size: 15px; line-height: 1.6; margin: 0 0 24px;">
      Vielen Dank, ${opts.name}! Ihr <strong>${opts.plan}</strong>-Abonnement ist jetzt aktiv.
      ${opts.trialEnd ? `Ihre kostenlose Testphase läuft bis zum <strong>${opts.trialEnd}</strong>.` : ''}
    </p>
    <a href="https://kids.mindry.de/feed" style="display: inline-block; background: #3b82f6; color: white; text-decoration: none; font-weight: 600; font-size: 15px; padding: 14px 28px; border-radius: 10px; margin-bottom: 24px;">
      KitaHub öffnen →
    </a>
    <div style="background: #eff6ff; border-radius: 10px; padding: 16px; font-size: 13px; color: #1d4ed8;">
      💡 <strong>Tipp:</strong> Richten Sie jetzt Ihre erste Gruppe ein und laden Sie Ihr Team ein – der Onboarding-Wizard hilft Ihnen dabei.
    </div>
  `, 'Abonnement aktiviert')

  return { subject: `KitaHub ${opts.plan} – Abonnement aktiviert`, html }
}
