'use client'

import { useEffect, useState } from 'react'

export default function ReactionsPage() {
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    fetch('/api/admin/reactions')
      .then((res) => res.json())
      .then(setData)
  }, [])

  if (!data) return <p>Loading...</p>

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Reactions Analytics</h1>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded shadow">
          <h2 className="font-semibold mb-3">By Type</h2>
          {Object.entries(data.typeCounts).map(([type, count]) => (
            <div key={type} className="flex justify-between border-b py-2">
              <span>{type}</span>
              <span className="font-bold">{count as number}</span>
            </div>
          ))}
          <p className="mt-3 text-sm text-gray-500">Total: {data.total}</p>
        </div>
        <div className="bg-white p-6 rounded shadow">
          <h2 className="font-semibold mb-3">Most Reacted Pages</h2>
          {data.topPages.map((page: any) => (
            <div key={page.slug} className="flex justify-between border-b py-2">
              <span className="truncate">{page.slug}</span>
              <span className="font-bold">{page.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}