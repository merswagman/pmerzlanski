import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Project, ProjectStatus } from '@/lib/types'
import StatusBadge from '@/components/StatusBadge'
import PriorityBadge from '@/components/PriorityBadge'
import { format, parseISO } from 'date-fns'

const STATUS_ORDER: ProjectStatus[] = ['in_progress', 'not_started', 'on_hold', 'done']

const STATUS_LABELS: Record<ProjectStatus, string> = {
  not_started: 'Not Started',
  in_progress: 'In Progress',
  done: 'Done',
  on_hold: 'On Hold',
}

const STATUS_COLORS: Record<ProjectStatus, string> = {
  not_started: 'bg-gray-100 text-gray-700',
  in_progress: 'bg-blue-50 text-blue-700',
  done: 'bg-green-50 text-green-700',
  on_hold: 'bg-yellow-50 text-yellow-700',
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data } = await supabase.from('projects').select('*').order('created_at', { ascending: false })
  const projects: Project[] = (data ?? []) as Project[]

  const total = projects.length
  const counts = STATUS_ORDER.reduce((acc, s) => {
    acc[s] = projects.filter(p => p.status === s).length
    return acc
  }, {} as Record<ProjectStatus, number>)

  const recent = projects.slice(0, 5)
  const upcoming = projects
    .filter(p => p.due_date && p.status !== 'done')
    .sort((a, b) => (a.due_date! > b.due_date! ? 1 : -1))
    .slice(0, 5)

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">{total} project{total !== 1 ? 's' : ''} total</p>
        </div>
        <Link
          href="/projects/new"
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
        >
          + New Project
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {STATUS_ORDER.map(status => (
          <Link key={status} href={`/projects?status=${status}`}>
            <div className={`rounded-xl p-4 ${STATUS_COLORS[status]} hover:opacity-80 transition-opacity`}>
              <p className="text-2xl font-bold">{counts[status]}</p>
              <p className="text-sm font-medium mt-0.5">{STATUS_LABELS[status]}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-900 text-sm">Recent Projects</h2>
            <Link href="/projects" className="text-xs text-indigo-600 hover:underline">View all</Link>
          </div>
          {recent.length === 0 ? (
            <p className="text-sm text-gray-400 italic">No projects yet.</p>
          ) : (
            <div className="space-y-2">
              {recent.map(p => (
                <Link key={p.id} href={`/projects/${p.id}`} className="flex items-center gap-3 rounded-lg bg-white p-3 shadow-sm ring-1 ring-gray-200 hover:ring-indigo-200 transition-all">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{p.title}</p>
                    <p className="text-xs text-gray-400">{format(parseISO(p.created_at), 'MMM d')}</p>
                  </div>
                  <StatusBadge status={p.status} />
                </Link>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="font-semibold text-gray-900 text-sm mb-3">Upcoming Due Dates</h2>
          {upcoming.length === 0 ? (
            <p className="text-sm text-gray-400 italic">No upcoming due dates.</p>
          ) : (
            <div className="space-y-2">
              {upcoming.map(p => (
                <Link key={p.id} href={`/projects/${p.id}`} className="flex items-center gap-3 rounded-lg bg-white p-3 shadow-sm ring-1 ring-gray-200 hover:ring-indigo-200 transition-all">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{p.title}</p>
                    <p className="text-xs text-gray-400">Due {format(parseISO(p.due_date!), 'MMM d, yyyy')}</p>
                  </div>
                  <PriorityBadge priority={p.priority} />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
