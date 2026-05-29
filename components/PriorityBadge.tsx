import { ProjectPriority } from '@/lib/types'

const styles: Record<ProjectPriority, string> = {
  high: 'bg-red-50 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  medium: 'bg-orange-50 text-orange-600 dark:bg-orange-900/40 dark:text-orange-300',
  low: 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400',
}

const dots: Record<ProjectPriority, string> = {
  high: 'bg-red-500',
  medium: 'bg-orange-400',
  low: 'bg-gray-400',
}

export default function PriorityBadge({ priority }: { priority: ProjectPriority }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${styles[priority]}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dots[priority]}`} />
      {priority}
    </span>
  )
}
