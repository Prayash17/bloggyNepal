'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const navItems = [
  { label: 'Dashboard', href: '/admin' },
  { label: 'Comments', href: '/admin/comments' },
  { label: 'Feedback', href: '/admin/feedback' },
  { label: 'Subscribers', href: '/admin/subscribers' },
  { label: 'Reactions', href: '/admin/reactions' },
  { label: 'Activity Log', href: '/admin/activity' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/admin/login')
  }

  return (
    <aside className="w-64 bg-white shadow-md p-4 flex flex-col">
      <h1 className="text-xl font-bold mb-6">BloggyNepal</h1>
      <nav className="space-y-1 flex-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`block px-4 py-2 rounded hover:bg-gray-100 ${
              pathname === item.href ? 'bg-gray-100 font-semibold' : ''
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <button
        onClick={handleLogout}
        className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
      >
        Logout
      </button>
    </aside>
  )
}