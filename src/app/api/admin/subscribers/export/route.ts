import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('subscribers')
    .select('email, name, status, created_at')
    .eq('status', 'active')

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const csvRows = [
    ['Email', 'Name', 'Status', 'Subscribed At'],
    ...data.map(row => [row.email, row.name || '', row.status, row.created_at])
  ]
  const csv = csvRows.map(row => row.join(',')).join('\n')

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename=subscribers.csv',
    },
  })
}