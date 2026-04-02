import ProjectDataModal from '@projects/_components/ProjectDataModal';

export default async function ProjectModalPage({ params }) {
  const { slug } = await params;
  return <ProjectDataModal slug={slug} entryPoint='modal' />;
}