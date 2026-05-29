import Link from 'next/link'
import { format, parseISO, isPast, isToday } from 'date-fns'
import { Project } from '@/lib/types'
import StatusBadge from './StatusBadge'
import PriorityBadge from './PriorityBadge'

export default function ProjectCard({ project }: { project: Project }) {
  const isOverdue =
    project.due_date &&
    project.status !== 'done' &&
    isPast(parseISO(project.due_date)) &&
    !isToday(parseISO(project.due_date))

  return (
    <Link href={`/projects/${project.id}`} className="block group">
      <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-200 hover:shadow-md hover:ring-indigo-200 transition-all dark:bg-gray-900 dark:ring-gray-700 dark:hover:ring-indigo-500">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-medium text-gray-900 group-hover:text-indigo-700 transition-colors line-clamp-2 leading-snug dark:text-gray-100 dark:group-hover:text-indigo-400">
            {project.title}
          </h3>
          <PriorityBadge priority={project.priority} />
        </div>

        {project.description && (
          <p className="text-sm text-gray-500 line-clamp-2 mb-3 dark:text-gray-400">{project.description}</p>
        )}

        <div className="flex flex-wrap items-center gap-2 mb-3">
          <StatusBadge status={project.status} />
          {project.tags.slice(0, 3).map(tag => (
            <span key={tag} className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
              {tag}
            </span>
          ))}
          {project.tags.length > 3 && (
            <span className="text-xs text-gray-400">{`+${project.tags.length - 3}`}</span>
          )}
        </div>

        <div className="flex items-center justify-between">
          {project.due_date ? (
            <p className={`text-xs ${isOverdue ? 'text-red-500 dark:text-red-400 font-medium' : 'text-gray-400'}`}>
              {isOverdue ? 'Overdue · ' : 'Due '}
              {format(parseISO(project.due_date), 'MMM d, yyyy')}
            </p>
          ) : <span />}
          {project.assignee && (
            <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white ${project.assignee === 'Chris' ? 'bg-blue-500' : 'bg-pink-500'}`}>
              {project.assignee[0]}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
