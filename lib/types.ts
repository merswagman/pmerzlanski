export type ProjectStatus = 'not_started' | 'in_progress' | 'done' | 'on_hold'

export interface Subtask {
  id: string
  project_id: string
  title: string
  done: boolean
  sort_order: number
  created_at: string
}
export type ProjectPriority = 'high' | 'medium' | 'low'

export interface Project {
  id: string
  user_id: string
  title: string
  description: string | null
  status: ProjectStatus
  priority: ProjectPriority
  tags: string[]
  notes: string | null
  due_date: string | null
  assignee: 'Chris' | 'Gia' | null
  cadence: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'seasonal' | 'annual' | null
  last_completed_at: string | null
  created_at: string
  updated_at: string
}
