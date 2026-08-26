import { createClient } from '@/lib/supabase/server'

export async function logAdminAction({
  action,
  entity,
  entity_id,
}: {
  action: string
  entity: string
  entity_id: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  await supabase.from('admin_logs').insert({
    admin_id: user?.id,
    action,
    entity,
    entity_id,
    created_at: new Date().toISOString(),
  })
}