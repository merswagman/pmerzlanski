import ProjectForm from '@/components/ProjectForm'

export default function NewProjectPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-xl font-bold text-gray-900 mb-6 dark:text-gray-50">New Project</h1>
      <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200 dark:bg-gray-900 dark:ring-gray-700">
        <ProjectForm />
      </div>
    </div>
  )
}
