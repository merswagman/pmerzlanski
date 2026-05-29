import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

type Params = { params: Promise<{ id: string; subtaskId: string }> }

export async function PUT(request: Request, { params }: Params) {
  const { subtaskId } = await params
  const body = await request.json()
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('subtasks')
    .update(body)
    .eq('id', subtaskId)
    .select()
    .single()

  if (error || !data) return NextResponse.json({ error: error?.message ?? 'Not found' }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(_: Request, { params }: Params) {
  const { subtaskId } = await params
  const supabase = await createClient()
  const { error } = await supabase.from('subtasks').delete().eq('id', subtaskId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
