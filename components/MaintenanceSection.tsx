'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  isAfter, isToday, parseISO, format,
  startOfWeek, startOfMonth, startOfYear, subDays,
} from 'date-fns'
import { Project } from '@/lib/types'

const CADENCE_LABELS: Record<string, string> = {
  daily:    'Daily',
  weekly:   'Weekly',
  biweekly: 'Every 2 wks',
  monthly:  'Monthly',
  seasonal: 'Seasonal',
  annual:   'Annual',
}

const CADENCE_COLORS: Record<string, string> = {
  daily:    'bg-red-50 text-red-600 dark:bg-red-900/40 dark:text-red-300',
  weekly:   'bg-blue-50 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300',
  biweekly: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-300',
  monthly:  'bg-purple-50 text-purple-600 dark:bg-purple-900/40 dark:text-purple-300',
  seasonal: 'bg-orange-50 text-orange-600 dark:bg-orange-900/40 dark:text-orange-300',
  annual:   'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
}

function isDoneThisPeriod(lastCompletedAt: string | null, cadence: string | null): boolean {
  if (!lastCompletedAt || !cadence) return false
  const completed = parseISO(lastCompletedAt)
  const now = new Date()
  switch (cadence) {
    case 'daily':    return isToday(completed)
    case 'weekly':   return isAfter(completed, startOfWeek(now, { weekStartsOn: 1 }))
    case 'biweekly': return isAfter(completed, subDays(now, 14))
    case 'monthly':  return isAfter(completed, startOfMonth(now))
    case 'seasonal': return isAfter(completed, subDays(now, 90))
    case 'annual':   return isAfter(completed, startOfYear(now))
    default:         return false
  }
}

function periodLabel(cadence: string | null): string {
  switch (cadence) {
    case 'daily':    return 'today'
    case 'weekly':   return 'this week'
    case 'biweekly': return 'this fortnight'
    case 'monthly':  return 'this month'
    case 'seasonal': return 'this season'
    case 'annual':   return 'this year'
    default:         return 'this period'
  }
}

export default function MaintenanceSection({ initial }: { initial: Project[] }) {
  const [projects, setProjects] = useState(initial)

  const doneCount = projects.filter(p => isDoneThisPeriod(p.last_completed_at, p.cadence)).length
  const total = projects.length

  async function toggle(project: Project) {
    const wasDone = isDoneThisPeriod(project.last_completed_at, project.cadence)
    const last_completed_at = wasDone ? null : new Date().toISOString()
    setProjects(prev => prev.map(p => p.id === project.id ? { ...p, last_completed_at } : p))
    await fetch(`/api/projects/${project.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ last_completed_at }),
    })
  }

  const sorted = [...projects].sort((a, b) => {
    const aDone = isDoneThisPeriod(a.last_completed_at, a.cadence)
    const bDone = isDoneThisPeriod(b.last_completed_at, b.cadence)
    if (aDone === bDone) return a.title.localeCompare(b.title)
    return aDone ? 1 : -1
  })

  // Group by cadence for display
  const cadenceOrder = ['daily', 'weekly', 'biweekly', 'monthly', 'seasonal', 'annual']
  const groups = cadenceOrder
    .map(c => ({ cadence: c, items: sorted.filter(p => p.cadence === c) }))
    .filter(g => g.items.length > 0)

  return (
    <div className="rounded-xl bg-white shadow-sm ring-1 ring-gray-200 overflow-hidden dark:bg-gray-900 dark:ring-gray-700">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Recurring Tasks</h2>
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-24 rounded-full bg-gray-100 overflow-hidden dark:bg-gray-700">
            <div
              className="h-full rounded-full bg-green-500 transition-all duration-300"
              style={{ width: total > 0 ? `${(doneCount / total) * 100}%` : '0%' }}
            />
          </div>
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{doneCount}/{total} done</span>
        </div>
      </div>

      {groups.map(group => (
        <div key={group.cadence}>
          <div className="px-4 py-1.5 bg-gray-50 border-b border-gray-100 dark:bg-gray-800 dark:border-gray-700">
            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${CADENCE_COLORS[group.cadence]}`}>
              {CADENCE_LABELS[group.cadence]}
            </span>
          </div>
          <div className="divide-y divide-gray-50 dark:divide-gray-700/50">
            {group.items.map(project => {
              const done = isDoneThisPeriod(project.last_completed_at, project.cadence)
              return (
                <div
                  key={project.id}
                  className={`group flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/60 ${done ? 'opacity-60' : ''}`}
                >
                  <button
                    onClick={() => toggle(project)}
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${done ? 'border-green-500 bg-green-500' : 'border-gray-300 hover:border-indigo-400 dark:border-gray-600'}`}
                  >
                    {done && (
                      <svg className="h-3 w-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>

                  <span className={`flex-1 text-sm ${done ? 'line-through text-gray-400' : 'text-gray-800 dark:text-gray-100'}`}>
                    {project.title}
                  </span>

                  {project.assignee && (
                    <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${project.assignee === 'Chris' ? 'bg-blue-500' : 'bg-pink-500'}`}>
                      {project.assignee[0]}
                    </span>
                  )}

                  {done && project.last_completed_at && (
                    <span className="text-xs text-green-600 font-medium shrink-0">
                      Done {format(parseISO(project.last_completed_at), 'EEE MMM d')}
                    </span>
                  )}

                  <Link
                    href={`/projects/${project.id}`}
                    className="hidden group-hover:flex items-center justify-center h-6 w-6 rounded text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors dark:hover:text-indigo-400 dark:hover:bg-indigo-900/30"
                    aria-label="Edit project"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </Link>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
