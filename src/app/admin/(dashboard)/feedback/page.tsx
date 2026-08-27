'use client'

import { useEffect, useState } from 'react'

type Feedback = {
  id: string
  type: string
  content: string
  page_slug: string
  rating: number
  status: string
  created_at: string
}

export default function FeedbackPage() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
  const [filter, setFilter] = useState('all')

  const fetchFeedback = () => {
    fetch('/api/admin/feedback')
      .then((res) => res.json())
      .then(setFeedbacks)
  }

  useEffect(() => {
    fetchFeedback()
  }, [])

  const updateStatus = async (id: string, status: string) => {
    await fetch(`/api/admin/feedback/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    fetchFeedback()
  }

  const deleteFeedback = async (id: string) => {
    if (!confirm('Delete this feedback?')) return
    await fetch(`/api/admin/feedback/${id}`, { method: 'DELETE' })
    fetchFeedback()
  }

  const filtered = feedbacks.filter(f => filter === 'all' ? true : f.status === filter)

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Feedback</h1>
      <div className="flex flex-wrap gap-2 mb-4">
        {['all', 'new', 'reviewing', 'resolved'].map((s) => (
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
      </div>
      <div className="space-y-4">
        {filtered.map((fb) => (
          <div key={fb.id} className="bg-white p-4 rounded shadow">
            <p className="font-semibold">{fb.type}</p>
            <p className="text-gray-700">{fb.content}</p>
            <p className="text-sm text-gray-400">
              {fb.page_slug} · Rating: {'⭐'.repeat(fb.rating)}
            </p>
            <div className="flex flex-wrap gap-2 mt-2">
              <button onClick={() => updateStatus(fb.id, 'reviewing')} className="bg-yellow-500 text-white px-3 py-1 rounded">Reviewing</button>
              <button onClick={() => updateStatus(fb.id, 'resolved')} className="bg-green-500 text-white px-3 py-1 rounded">Resolve</button>
              <button onClick={() => deleteFeedback(fb.id)} className="bg-gray-500 text-white px-3 py-1 rounded">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}