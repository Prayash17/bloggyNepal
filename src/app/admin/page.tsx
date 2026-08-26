import { createClient } from '@/lib/supabase/server'

export default async function AdminDashboard() {
  const supabase = await createClient()

  const [
    { count: pendingComments },
    { count: newFeedback },
    { count: activeSubscribers },
    { count: totalReactions },
  ] = await Promise.all([
    supabase.from('comments').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('feedback').select('*', { count: 'exact', head: true }).eq('status', 'new'),
    supabase.from('subscribers').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('reactions').select('*', { count: 'exact', head: true }),
  ])

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard label="Pending Comments" value={pendingComments || 0} />
        <StatCard label="New Feedback" value={newFeedback || 0} />
        <StatCard label="Active Subscribers" value={activeSubscribers || 0} />
        <StatCard label="Total Reactions" value={totalReactions || 0} />
      </div>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow">
      <p className="text-gray-500 text-sm">{label}</p>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  )
}