import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabase
      .from('profiles').select('role, site_id').eq('id', user.id).single()

    if (!['admin', 'group_lead'].includes(profile?.role ?? '')) {
      return NextResponse.json({ error: 'Nur Admins können Nutzer einladen' }, { status: 403 })
    }

    const { email, role, childId, fullName } = await req.json()
    if (!email || !role) {
      return NextResponse.json({ error: 'Email und Rolle sind erforderlich' }, { status: 400 })
    }

    const validRoles = ['parent', 'educator', 'group_lead', 'caretaker', 'admin']
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: 'Ungültige Rolle' }, { status: 400 })
    }

    // Use service role key (server-side only) for admin invite
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!serviceKey) {
      return NextResponse.json({
        error: 'SUPABASE_SERVICE_ROLE_KEY nicht konfiguriert. Bitte in den Umgebungsvariablen setzen.'
      }, { status: 500 })
    }

    const adminClient = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceKey,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!

    const { data, error } = await adminClient.auth.admin.inviteUserByEmail(email, {
      data: {
        role,
        site_id: siteId,
        invited_by: user.id,
        full_name: fullName ?? '',
        ...(childId ? { child_id: childId } : {}),
      },
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? 'https://kids.mindry.de'}/auth/callback?next=/willkommen`,
    })

    if (error) {
      // If user already exists, try to update their profile instead
      if (error.message?.includes('already been registered') || error.message?.includes('already registered')) {
        return NextResponse.json({ error: 'Diese E-Mail-Adresse ist bereits registriert.' }, { status: 409 })
      }
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    const invitedUserId = data.user.id

    // If a childId is provided (parent invite), create a pending guardian record
    // The profile will be created by the DB trigger on_auth_user_created
    // We create the guardian link immediately using the new user ID
    if (childId && role === 'parent') {
      const { error: guardianError } = await adminClient
        .from('guardians')
        .upsert({
          user_id: invitedUserId,
          child_id: childId,
          relationship: 'parent',
        }, { onConflict: 'user_id,child_id' })

      if (guardianError) {
        console.error('Guardian creation error:', guardianError)
        // Non-fatal: invite still succeeded, guardian can be linked manually
      }
    }

    return NextResponse.json({ success: true, userId: invitedUserId })
  } catch (err) {
    console.error('Invite user error:', err)
    return NextResponse.json({ error: 'Interner Fehler' }, { status: 500 })
  }
}
