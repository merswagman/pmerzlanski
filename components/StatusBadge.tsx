import { ProjectStatus } from '@/lib/types'

const styles: Record<ProjectStatus, string> = {
  not_started: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
  in_progress: 'bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  done: 'bg-green-50 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  on_hold: 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300',
}

const labels: Record<ProjectStatus, string> = {
  not_started: 'Not Started',
  in_progress: 'In Progress',
  done: 'Done',
  on_hold: 'On Hold',
}

export default function StatusBadge({ status }: { status: ProjectStatus }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status]}`}>
      {labels[status]}
    </span>
  )
}
