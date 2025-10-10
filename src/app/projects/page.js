'use client';
import GlobalModelViewer from '@/components/Three/GlobalModelViewer';
import DynamicMenu from '@/components/DynamicMenu';

const menuProps = {
  topLinks: [
    {
      href: '/',
      title: 'Back',
    },
    {
      href: '/',
      title: 'Back',
    },
  ],
  bottomLinks: [
    {
      href: '/',
      title: 'Back',
    },
    {
      href: '/',
      title: 'Back',
    },
  ],
};

const ProjectsPage = () => {
  return (
    <div className="flex flex-col w-full h-full mt-14 uppercase text-neutral-600">
      <div className="absolute p-8 z-100">
        <DynamicMenu {...menuProps} />
      </div>

      <div className="fixed inset-0 bottom-10 flex-col grow w-full self-end h-full">
        <GlobalModelViewer />
      </div>
    </div>
  );
};

export default ProjectsPage;
