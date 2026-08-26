'use client'

import { useEffect, useState } from 'react'

type Subscriber = {
  id: string
  email: string
  name: string
  status: string
  created_at: string
}

export default function SubscribersPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetch('/api/admin/subscribers')
      .then((res) => res.json())
      .then(setSubscribers)
  }, [])

  const filtered = subscribers.filter(s => filter === 'all' ? true : s.status === filter)

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Subscribers</h1>
      <div className="flex flex-wrap gap-2 mb-4">
        {['all', 'active', 'unsubscribed', 'bounced'].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded ${
              filter === s ? 'bg-blue-600 text-white' : 'bg-gray-200'
            }`}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
        <a href="/api/admin/subscribers/export" className="bg-green-500 text-white px-4 py-2 rounded">
          Export CSV
        </a>
      </div>
      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-3">Email</th>
              <th className="text-left p-3">Name</th>
              <th className="text-left p-3">Status</th>
              <th className="text-left p-3">Subscribed</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((sub) => (
              <tr key={sub.id} className="border-t">
                <td className="p-3">{sub.email}</td>
                <td className="p-3">{sub.name || '—'}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded text-sm ${
                    sub.status === 'active' ? 'bg-green-100 text-green-800' :
                    sub.status === 'unsubscribed' ? 'bg-gray-100 text-gray-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {sub.status}
                  </span>
                </td>
                <td className="p-3">{new Date(sub.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}