import ProjectDataModalTest from '../../../components/ui/modal/ProjectDataModalTest'

interface ProjectDataModalProps {
  params: Promise<{ slug: string }>
}

export default async function ProjectModalPage({ params }: ProjectDataModalProps) {
  const { slug } = await params
  return <ProjectDataModalTest slug={slug} entryPoint={'modal'} />
}