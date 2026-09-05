import ProjectDataModalTest from '../../components/ui/ProjectDataModalTest'

interface ProjectPageProps {
  params: Promise<{ slug: string }>
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params
  return <ProjectDataModalTest slug={slug} entryPoint='page' />
}