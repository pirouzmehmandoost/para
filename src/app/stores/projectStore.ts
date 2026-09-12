import { create } from 'zustand';
import type { ProjectRecord } from '../../db/projects';

type ProjectState = {
  projects: ProjectRecord[] | null;
  projectsByNodeName: Record<string, ProjectRecord>;
  projectsBySlug: Record<string, ProjectRecord>;
  _key: string | null;

  setProjects: (projects: ProjectRecord[]) => void;
  reset: () => void;
  getProjectByNodeName: (nodeName: string) => ProjectRecord | null;
  getProjectBySlug: (slug: string) => ProjectRecord | null;
};

const initialState = {
  projects: null,
  projectsByNodeName: {},
  projectsBySlug: {},
  _key: null,
};

/*
 * Lookup maps are built here.
 * Zustand v5 hands a selector straight to useSyncExternalStore with no equality function, so a getter
 * that allocated a map per call would return a new reference on every snapshot read.
 *
 * _key is a content hash, not the caller's array, so state never retains a
 * caller-owned reference. Re-setting identical data is skipped, which keeps
 * subscribers from re-rendering when this runs again with unchanged projects.
 */
const useProjectStore = create<ProjectState>()((set, get) => ({
  ...initialState,

  setProjects: (projects: ProjectRecord[]) => {
    const key = JSON.stringify(projects);

    if (get()._key === key) return;

    const cloned = structuredClone(projects);
    const projectsByNodeName = {};
    const projectsBySlug = {};

    for (const project of cloned) {
      projectsByNodeName[project.sceneData.fileData.nodeName] = project;
      projectsBySlug[project.UIData.slug] = project;
    }

    set({
      projects: cloned,
      projectsByNodeName,
      projectsBySlug,
      _key: key,
    });
  },

  reset: () => set({ ...initialState }),

  getProjectByNodeName: (nodeName: string) => get().projectsByNodeName[nodeName] ?? null,

  getProjectBySlug: (slug: string) => get().projectsBySlug[slug] ?? null,
}));

export default useProjectStore;
