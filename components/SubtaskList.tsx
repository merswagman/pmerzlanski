'use client'

import { useState, useRef } from 'react'
import { Subtask } from '@/lib/types'

export default function SubtaskList({ projectId, initial }: { projectId: string; initial: Subtask[] }) {
  const [subtasks, setSubtasks] = useState<Subtask[]>(initial)
  const [input, setInput] = useState('')
  const [adding, setAdding] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const done = subtasks.filter(s => s.done).length

  async function addSubtask() {
    const title = input.trim()
    if (!title) return
    setInput('')

    const res = await fetch(`/api/projects/${projectId}/subtasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    })
    const subtask: Subtask = await res.json()
    setSubtasks(prev => [...prev, subtask])
  }

  async function toggle(subtask: Subtask) {
    const updated = { ...subtask, done: !subtask.done }
    setSubtasks(prev => prev.map(s => s.id === subtask.id ? updated : s))
    await fetch(`/api/projects/${projectId}/subtasks/${subtask.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ done: updated.done }),
    })
  }

  async function remove(id: string) {
    setSubtasks(prev => prev.filter(s => s.id !== id))
    await fetch(`/api/projects/${projectId}/subtasks/${id}`, { method: 'DELETE' })
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="block text-sm font-medium text-gray-700">
          Subtasks
          {subtasks.length > 0 && (
            <span className="ml-2 text-xs font-normal text-gray-400">
              {done}/{subtasks.length} done
            </span>
          )}
        </label>
      </div>

      {subtasks.length > 0 && (
        <ul className="mb-2 divide-y divide-gray-100 rounded-lg border border-gray-200 overflow-hidden">
          {subtasks.map(subtask => (
            <li key={subtask.id} className="group flex items-center gap-2 bg-white px-3 py-2 hover:bg-gray-50">
              <button
                type="button"
                onClick={() => toggle(subtask)}
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                  subtask.done ? 'border-green-500 bg-green-500' : 'border-gray-300 hover:border-indigo-400'
                }`}
              >
                {subtask.done && (
                  <svg className="h-3 w-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>

              <span className={`flex-1 text-sm ${subtask.done ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                {subtask.title}
              </span>

              <button
                type="button"
                onClick={() => remove(subtask.id)}
                className="hidden group-hover:flex items-center justify-center h-5 w-5 rounded text-gray-300 hover:text-red-400 transition-colors"
                aria-label="Delete subtask"
              >
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Add input */}
      {adding ? (
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') { e.preventDefault(); addSubtask() }
              if (e.key === 'Escape') { setAdding(false); setInput('') }
            }}
            onBlur={() => { if (!input.trim()) setAdding(false) }}
            placeholder="Subtask title, press Enter to add"
            autoFocus
            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="button"
            onClick={addSubtask}
            className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
          >
            Add
          </button>
          <button
            type="button"
            onClick={() => { setAdding(false); setInput('') }}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-indigo-600 transition-colors"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add subtask
        </button>
      )}
    </div>
  )
}
