'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

interface Props {
  userName?: string
}

export default function Navbar({ userName }: Props) {
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-40">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="text-2xl">🎙️</span>
          <span className="font-bold text-gray-800 text-lg hidden sm:block">English Coach</span>
        </Link>
        <div className="flex items-center gap-4">
          {userName && (
            <span className="text-sm text-gray-500 hidden sm:block">Hi, {userName}!</span>
          )}
          <button
            onClick={handleLogout}
            className="text-sm text-gray-500 hover:text-gray-800 transition-colors"
          >
            Log out
          </button>
        </div>
      </div>
    </nav>
  )
}
