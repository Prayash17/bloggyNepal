import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { logAdminAction } from '@/lib/admin-log'

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params
  const supabase = await createClient()
  const body = await req.json()
  const { status } = body // 'reviewing' | 'resolved'

  const { data, error } = await supabase
    .from('feedback')
    .update({ status })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  await logAdminAction({
    action: `update_feedback_${status}`,
    entity: 'feedback',
    entity_id: id,
  })

  return NextResponse.json(data)
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params
  const supabase = await createClient()

  const { error } = await supabase
    .from('feedback')
    .delete()
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  await logAdminAction({
    action: 'delete_feedback',
    entity: 'feedback',
    entity_id: id,
  })

  return NextResponse.json({ success: true })
}