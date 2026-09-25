import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import type { Project } from '@/types/project'
import { getProjectBySlug } from '@/db/projects'
import ProjectDataModal from '../../../components/ui/modals/ProjectDataModal'

interface ProjectPageProps {
  params: Promise<{ slug: string }>
}

async function ProjectPageContent({ params }: ProjectPageProps) {
  const { slug } = await params
  let project: Project | null = null

  try {
    project = await getProjectBySlug(slug)
  }
  catch (error) {
    console.error('ProjectPage: getProjectBySlug() failed: ', error)
  }

  if (!project) notFound()

  return <ProjectDataModal project={project} entryPoint='modal' />
}

export default function ProjectPage({ params }: ProjectPageProps) {
  return (
    <Suspense fallback={null}>
      <ProjectPageContent params={params} />
    </Suspense>
  )
}