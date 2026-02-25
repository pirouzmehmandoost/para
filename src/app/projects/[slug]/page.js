import ProjectOverlay from '../_components/ProjectOverlay';

export default async function ProjectPage({ params }) {

  const { slug } = await params;
  return <ProjectOverlay slug={slug} entryPoint='page' />;
};