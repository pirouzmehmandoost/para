import ProjectDataModal from '../_components/ProjectDataModal';

export default async function ProjectPage({ params }) {

  const { slug } = await params;
  return <ProjectDataModal slug={slug} entryPoint='page' />;
};