import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const anthropic = new Anthropic()

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { title, description } = await request.json()

  if (!title) {
    return NextResponse.json({ tags: [] })
  }

  const message = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 150,
    messages: [{
      role: 'user',
      content: `Categorize this home/outdoor improvement project with 2-4 short tags.

Project title: ${title}
Description: ${description || 'none'}

Tag categories to draw from:
- Location: Kitchen, Bathroom, Backyard, Garage, Bedroom, Living Room, Basement, Deck, Garden, Driveway, Fence, Roof
- Type: Repair, Renovation, Painting, Plumbing, Electrical, Landscaping, Cleaning, Organization, Installation, Maintenance, DIY
- Scale: Quick Fix, Weekend Project, Major Project

Return ONLY a JSON array of strings. Example: ["Backyard", "Landscaping", "Weekend Project"]`
    }]
  })

  const content = message.content[0]
  if (content.type !== 'text') return NextResponse.json({ tags: [] })

  try {
    const raw = content.text.trim()
    const match = raw.match(/\[[\s\S]*\]/)
    const tags = JSON.parse(match ? match[0] : raw)
    return NextResponse.json({ tags: Array.isArray(tags) ? tags : [] })
  } catch {
    return NextResponse.json({ tags: [] })
  }
}
