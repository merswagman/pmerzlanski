'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function DeleteProjectButton({ id }: { id: string }) {
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    setDeleting(true)
    await fetch(`/api/projects/${id}`, { method: 'DELETE' })
    router.push('/projects')
    router.refresh()
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-500 dark:text-gray-400">Delete this project?</span>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50"
        >
          {deleting ? 'Deleting...' : 'Yes, delete'}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-800"
        >
          Cancel
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="text-sm text-red-500 hover:text-red-700 transition-colors dark:text-red-400 dark:hover:text-red-300"
    >
      Delete
    </button>
  )
}
