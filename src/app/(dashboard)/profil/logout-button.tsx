'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'

export default function LogoutButton() {
  const router = useRouter()
  async function logout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }
  return (
    <button onClick={logout} className="w-full btn-secondary text-red-600 border-red-100 hover:bg-red-50 py-3">
      <LogOut size={18}/> Abmelden
    </button>
  )
}
