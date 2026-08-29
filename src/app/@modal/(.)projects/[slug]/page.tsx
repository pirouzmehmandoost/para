import ProjectDataModal from '../../../components/ui/ProjectDataModal';

interface ProjectDataModalProps {
  params: Promise<{ slug: string }>;
}

export default async function ProjectModalPage({ params }: ProjectDataModalProps) {
  const { slug } = await params;
  return <ProjectDataModal slug={slug} entryPoint={'modal'} />;
}