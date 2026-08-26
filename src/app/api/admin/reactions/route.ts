import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const { data: reactions, error } = await supabase
    .from('reactions')
    .select('type, page_slug')

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const typeCounts: Record<string, number> = {}
  const pageCounts: Record<string, number> = {}
  reactions.forEach((r) => {
    typeCounts[r.type] = (typeCounts[r.type] || 0) + 1
    pageCounts[r.page_slug] = (pageCounts[r.page_slug] || 0) + 1
  })

  const topPages = Object.entries(pageCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([slug, count]) => ({ slug, count }))

  return NextResponse.json({
    typeCounts,
    topPages,
    total: reactions.length,
  })
}