import ProjectDataModal from '../../components/ui/ProjectDataModal'

interface ProjectPageProps {
  params: Promise<{ slug: string }>
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params
  return <ProjectDataModal slug={slug} entryPoint='page' />
}