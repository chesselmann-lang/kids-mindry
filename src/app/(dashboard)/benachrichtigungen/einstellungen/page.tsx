import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import NotificationSettingsForm from './settings-form'
import AiBenachrichtigungen from './ai-benachrichtigungen'

export const metadata = { title: 'Benachrichtigungs-Einstellungen' }

export default async function NotificationSettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Load or create settings
  let { data: settings } = await supabase
    .from('notification_settings')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!settings) {
    const { data: newSettings } = await supabase
      .from('notification_settings')
      .insert({ user_id: user.id })
      .select()
      .single()
    settings = newSettings
  }

  return (
    <div className="space-y-4">
      <AiBenachrichtigungen />
      <NotificationSettingsForm
        userId={user.id}
        settings={{
        notify_feed: settings?.notify_feed ?? true,
        notify_tagesbericht: settings?.notify_tagesbericht ?? true,
        notify_kalender: settings?.notify_kalender ?? true,
        notify_nachrichten: settings?.notify_nachrichten ?? true,
        notify_protokolle: settings?.notify_protokolle ?? true,
        notify_abwesenheit: settings?.notify_abwesenheit ?? true,
      }}
      />
    </div>
  )
}
