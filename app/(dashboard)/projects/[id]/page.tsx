import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ProjectForm from '@/components/ProjectForm'
import DeleteProjectButton from '@/components/DeleteProjectButton'
import SubtaskList from '@/components/SubtaskList'
import { Project, Subtask } from '@/lib/types'

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: p }, { data: s }] = await Promise.all([
    supabase.from('projects').select('*').eq('id', id).single(),
    supabase.from('subtasks').select('*').eq('project_id', id).order('sort_order').order('created_at'),
  ])

  if (!p) notFound()

  const project = p as Project
  const subtasks = (s ?? []) as Subtask[]

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Edit Project</h1>
        <DeleteProjectButton id={project.id} />
      </div>

      <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
        <ProjectForm project={project} />
      </div>

      <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
        <SubtaskList projectId={project.id} initial={subtasks} />
      </div>
    </div>
  )
}
