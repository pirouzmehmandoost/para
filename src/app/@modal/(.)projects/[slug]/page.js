import ProjectOverlay from '@projects/_components/ProjectOverlay';

export default async function ProjectModalPage({ params }) {
  const { slug } = await params;
  return <ProjectOverlay slug={slug} entryPoint='modal' />;
}