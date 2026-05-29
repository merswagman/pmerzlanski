'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { format, parseISO, isPast, isToday } from 'date-fns'
import { createClient } from '@/lib/supabase/client'
import { Project, ProjectStatus, ProjectPriority } from '@/lib/types'
import ProjectCard from '@/components/ProjectCard'
import StatusBadge from '@/components/StatusBadge'
import PriorityBadge from '@/components/PriorityBadge'
import MaintenanceSection from '@/components/MaintenanceSection'

const STATUS_FILTERS: { value: ProjectStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'not_started', label: 'Not Started' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'on_hold', label: 'On Hold' },
  { value: 'done', label: 'Done' },
]

const PRIORITY_FILTERS: { value: ProjectPriority | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
]


function GridIcon({ active }: { active: boolean }) {
  return (
    <svg className={`h-4 w-4 ${active ? 'text-indigo-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  )
}

function ListIcon({ active }: { active: boolean }) {
  return (
    <svg className={`h-4 w-4 ${active ? 'text-indigo-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
    </svg>
  )
}

function ProjectListRow({ project }: { project: Project }) {
  const isOverdue =
    project.due_date &&
    project.status !== 'done' &&
    isPast(parseISO(project.due_date)) &&
    !isToday(parseISO(project.due_date))

  return (
    <Link href={`/projects/${project.id}`} className="flex items-center gap-4 px-4 py-3 hover:bg-gray-50 transition-colors group">
      <div className="flex-1 min-w-0">
        <span className="text-sm font-medium text-gray-900 group-hover:text-indigo-700 transition-colors">
          {project.title}
        </span>
        {project.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-0.5">
            {project.tags.slice(0, 4).map(tag => (
              <span key={tag} className="text-xs text-indigo-500">#{tag}</span>
            ))}
            {project.tags.length > 4 && (
              <span className="text-xs text-gray-400">+{project.tags.length - 4}</span>
            )}
          </div>
        )}
      </div>
      <div className="flex items-center gap-3 shrink-0">
        {project.assignee && (
          <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white ${project.assignee === 'Chris' ? 'bg-blue-500' : 'bg-pink-500'}`}>
            {project.assignee[0]}
          </span>
        )}
        <PriorityBadge priority={project.priority} />
        <StatusBadge status={project.status} />
        {project.due_date ? (
          <span className={`text-xs w-24 text-right ${isOverdue ? 'text-red-500 font-medium' : 'text-gray-400'}`}>
            {isOverdue ? 'Overdue' : format(parseISO(project.due_date), 'MMM d, yyyy')}
          </span>
        ) : (
          <span className="w-24" />
        )}
      </div>
    </Link>
  )
}

export default function ProjectsPage() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const statusFilter = (searchParams.get('status') ?? 'all') as ProjectStatus | 'all'
  const priorityFilter = (searchParams.get('priority') ?? 'all') as ProjectPriority | 'all'
  const assigneeFilter = (searchParams.get('assignee') ?? 'all') as 'Chris' | 'Gia' | 'all'
  const tagFilter = searchParams.get('tag') ?? ''

  const [allProjects, setAllProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [allTags, setAllTags] = useState<string[]>([])
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState<'projects' | 'recurring'>('projects')
  const [currentUser, setCurrentUser] = useState<'Chris' | 'Gia' | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      const name = user?.user_metadata?.display_name
      if (name === 'Chris' || name === 'Gia') setCurrentUser(name)
    })
  }, [])

  useEffect(() => {
    const saved = localStorage.getItem('projectsView')
    if (saved === 'list' || saved === 'grid') setView(saved)
  }, [])

  function toggleView(v: 'grid' | 'list') {
    setView(v)
    localStorage.setItem('projectsView', v)
  }

  useEffect(() => {
    async function load() {
      setLoading(true)
      const res = await fetch('/api/projects')
      const all: Project[] = await res.json()

      setAllProjects(all)
      setLoading(false)
    }
    load()
  }, [statusFilter, priorityFilter, tagFilter])

  useEffect(() => {
    async function loadTags() {
      const res = await fetch('/api/projects')
      const all: Project[] = await res.json()
      const tags = [...new Set(all.flatMap(p => p.tags))].sort()
      setAllTags(tags)
    }
    loadTags()
  }, [])

  const maintenanceProjects = allProjects.filter(p => p.cadence != null)
  const oneTimeProjects = allProjects
    .filter(p => p.cadence == null)
    .filter(p => statusFilter === 'all' || p.status === statusFilter)
    .filter(p => priorityFilter === 'all' || p.priority === priorityFilter)
    .filter(p => assigneeFilter === 'all' || p.assignee === assigneeFilter)
    .filter(p => !tagFilter || p.tags.includes(tagFilter))

  function sortProjects(list: typeof oneTimeProjects) {
    return [...list].sort((a, b) => {
      const score = (p: typeof a) => {
        if (p.status === 'done') return 4
        if (currentUser && p.assignee === currentUser && p.status === 'in_progress') return 0
        if (currentUser && p.assignee === currentUser) return 1
        if (p.status === 'in_progress') return 2
        return 3
      }
      return score(a) - score(b)
    })
  }

  const q = search.trim().toLowerCase()
  const filtered = q
    ? oneTimeProjects.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.tags.some(t => t.toLowerCase().includes(q))
      )
    : oneTimeProjects
  const visibleProjects = sortProjects(filtered)

  function setParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value === 'all' || value === '') {
      params.delete(key)
    } else {
      params.set(key, value)
    }
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 rounded-lg bg-gray-100 p-1">
          <button
            onClick={() => setTab('projects')}
            className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${tab === 'projects' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Projects
            {!loading && <span className="ml-1.5 text-xs text-gray-400">{oneTimeProjects.length}</span>}
          </button>
          <button
            onClick={() => setTab('recurring')}
            className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${tab === 'recurring' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Recurring
            {!loading && <span className="ml-1.5 text-xs text-gray-400">{maintenanceProjects.length}</span>}
          </button>
        </div>
        <div className="flex items-center gap-3">
          {tab === 'projects' && (
            <>
              <select
                value={assigneeFilter}
                onChange={e => setParam('assignee', e.target.value)}
                className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All assignees</option>
                <option value="Chris">Chris</option>
                <option value="Gia">Gia</option>
              </select>
              <div className="flex items-center rounded-lg border border-gray-200 bg-white p-0.5">
                <button onClick={() => toggleView('grid')} className={`rounded-md p-1.5 transition-colors ${view === 'grid' ? 'bg-indigo-50' : 'hover:bg-gray-100'}`} aria-label="Grid view">
                  <GridIcon active={view === 'grid'} />
                </button>
                <button onClick={() => toggleView('list')} className={`rounded-md p-1.5 transition-colors ${view === 'list' ? 'bg-indigo-50' : 'hover:bg-gray-100'}`} aria-label="List view">
                  <ListIcon active={view === 'list'} />
                </button>
              </div>
            </>
          )}
          <Link href="/projects/new" className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors">
            + New Project
          </Link>
        </div>
      </div>

      {/* Recurring tab */}
      {tab === 'recurring' && !loading && (
        maintenanceProjects.length > 0
          ? <MaintenanceSection initial={maintenanceProjects} />
          : <div className="flex flex-col items-center justify-center rounded-xl bg-white py-16 shadow-sm ring-1 ring-gray-200 text-center">
              <p className="text-gray-400 text-sm">No recurring projects yet</p>
              <Link href="/projects/new" className="mt-3 text-sm font-medium text-indigo-600 hover:underline">
                Create one
              </Link>
            </div>
      )}

      {tab === 'projects' && <>
      {/* Search */}
      <div className="relative">
        <svg className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
        </svg>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search projects..."
          className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="space-y-2">
        <div className="flex flex-wrap gap-1.5">
          {STATUS_FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => setParam('status', f.value)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                statusFilter === f.value
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-600 ring-1 ring-gray-200 hover:ring-indigo-300'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-1.5">
          {PRIORITY_FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => setParam('priority', f.value)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                priorityFilter === f.value
                  ? 'bg-gray-800 text-white'
                  : 'bg-white text-gray-600 ring-1 ring-gray-200 hover:ring-gray-400'
              }`}
            >
              {f.label} priority
            </button>
          ))}
        </div>

        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {tagFilter && (
              <button
                onClick={() => setParam('tag', '')}
                className="rounded-full bg-indigo-600 px-3 py-1 text-xs font-medium text-white"
              >
                #{tagFilter} ×
              </button>
            )}
            {allTags.filter(t => t !== tagFilter).map(tag => (
              <button
                key={tag}
                onClick={() => setParam('tag', tag)}
                className="rounded-full bg-white px-3 py-1 text-xs font-medium text-indigo-600 ring-1 ring-indigo-100 hover:ring-indigo-300 transition-colors"
              >
                #{tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {loading ? (
        view === 'grid' ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-36 rounded-xl bg-white shadow-sm ring-1 ring-gray-200 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="rounded-xl bg-white shadow-sm ring-1 ring-gray-200 divide-y divide-gray-100">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-12 animate-pulse bg-gray-50 mx-4 my-2 rounded-lg" />
            ))}
          </div>
        )
      ) : visibleProjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl bg-white py-16 shadow-sm ring-1 ring-gray-200 text-center">
          <p className="text-gray-400 text-sm">
            {search ? `No projects matching "${search}"` : 'No projects found'}
          </p>
          {!search && (
            <Link href="/projects/new" className="mt-3 text-sm font-medium text-indigo-600 hover:underline">
              Add your first project
            </Link>
          )}
        </div>
      ) : view === 'grid' ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visibleProjects.map(project => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      ) : (
        <div className="rounded-xl bg-white shadow-sm ring-1 ring-gray-200 divide-y divide-gray-100 overflow-hidden">
          <div className="flex items-center gap-4 px-4 py-2 bg-gray-50 border-b border-gray-200">
            <span className="flex-1 text-xs font-medium text-gray-500 uppercase tracking-wide">Project</span>
            <div className="flex items-center gap-3 shrink-0 text-xs font-medium text-gray-500 uppercase tracking-wide">
              <span className="w-16">Priority</span>
              <span className="w-20">Status</span>
              <span className="w-24 text-right">Due</span>
            </div>
          </div>
          {visibleProjects.map(project => (
            <ProjectListRow key={project.id} project={project} />
          ))}
        </div>
      )}
      </>}
    </div>
  )
}
