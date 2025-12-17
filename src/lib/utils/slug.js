export const getSlugFromName = (name) => {
    if (!name) return '';
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  };
  
  export const getProjectFromSlug = (slug, projects) => {
    if (!slug || !projects) return null;

    return projects.find(project => 
      getSlugFromName(project.name) === slug
    );
  };