'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [displayName, setDisplayName] = useState<string | null>(null)
  const [needsName, setNeedsName] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      const name = user?.user_metadata?.display_name
      if (name) {
        setDisplayName(name)
      } else if (user) {
        setNeedsName(true)
      }
    })
  }, [])

  async function setName(name: 'Chris' | 'Gia') {
    const supabase = createClient()
    await supabase.auth.updateUser({ data: { display_name: name } })
    setDisplayName(name)
    setNeedsName(false)
  }

  async function signOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  const links = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/projects', label: 'Projects' },
  ]

  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="text-sm font-bold text-gray-900 hover:text-indigo-600">
            Home Projects
          </Link>
          <div className="flex items-center gap-1">
            {links.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  pathname === link.href || pathname.startsWith(link.href + '/')
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {needsName && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Who are you?</span>
              {(['Chris', 'Gia'] as const).map(name => (
                <button
                  key={name}
                  onClick={() => setName(name)}
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white transition-opacity hover:opacity-80 ${name === 'Chris' ? 'bg-blue-500' : 'bg-pink-500'}`}
                >
                  {name[0]}
                </button>
              ))}
            </div>
          )}

          {displayName && (
            <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white ${displayName === 'Chris' ? 'bg-blue-500' : 'bg-pink-500'}`}>
              {displayName[0]}
            </span>
          )}

          <button
            onClick={signOut}
            className="text-sm text-gray-500 hover:text-gray-800 transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>
    </nav>
  )
}
