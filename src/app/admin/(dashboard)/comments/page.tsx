'use client'

import { useEffect, useState } from 'react'

type Comment = {
  id: string
  content: string
  author: string
  created_at: string
  status: string
  page_slug: string
}

export default function CommentsPage() {
  const [comments, setComments] = useState<Comment[]>([])
  const [filter, setFilter] = useState('all')

  const fetchComments = () => {
    fetch('/api/admin/comments')
      .then((res) => res.json())
      .then(setComments)
  }

  useEffect(() => {
    fetchComments()
  }, [])

  const updateStatus = async (id: string, status: string) => {
    await fetch(`/api/admin/comments/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    fetchComments()
  }

  const deleteComment = async (id: string) => {
    if (!confirm('Delete this comment?')) return
    await fetch(`/api/admin/comments/${id}`, { method: 'DELETE' })
    fetchComments()
  }

  const filtered = comments.filter(c => filter === 'all' ? true : c.status === filter)

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Comments</h1>
      <div className="flex flex-wrap gap-2 mb-4">
        {['all', 'pending', 'approved', 'spam', 'rejected'].map((s) => (
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
        {filtered.map((comment) => (
          <div key={comment.id} className="bg-white p-4 rounded shadow">
            <p className="font-semibold">{comment.author}</p>
            <p className="text-gray-700">{comment.content}</p>
            <p className="text-sm text-gray-400">
              {comment.page_slug} · {new Date(comment.created_at).toLocaleDateString()}
            </p>
            <div className="flex flex-wrap gap-2 mt-2">
              <button onClick={() => updateStatus(comment.id, 'approved')} className="bg-green-500 text-white px-3 py-1 rounded">Approve</button>
              <button onClick={() => updateStatus(comment.id, 'rejected')} className="bg-red-500 text-white px-3 py-1 rounded">Reject</button>
              <button onClick={() => updateStatus(comment.id, 'spam')} className="bg-orange-500 text-white px-3 py-1 rounded">Spam</button>
              <button onClick={() => deleteComment(comment.id)} className="bg-gray-500 text-white px-3 py-1 rounded">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}