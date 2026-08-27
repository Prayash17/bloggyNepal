'use client'

import { useEffect, useState } from 'react'

type Log = {
  id: string
  action: string
  entity: string
  entity_id: string
  created_at: string
}

export default function ActivityPage() {
  const [logs, setLogs] = useState<Log[]>([])

  useEffect(() => {
    fetch('/api/admin/activity')
      .then((res) => res.json())
      .then(setLogs)
  }, [])

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Activity Log</h1>
      <div className="bg-white rounded shadow">
        <ul className="divide-y">
          {logs.map((log) => (
            <li key={log.id} className="p-4">
              <p className="text-sm text-gray-500">{new Date(log.created_at).toLocaleString()}</p>
              <p>
                <span className="font-semibold">{log.action}</span> on{' '}
                <span className="text-blue-600">{log.entity}</span> (ID: {log.entity_id})
              </p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}