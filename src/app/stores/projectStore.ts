import { create } from 'zustand'
import type { Project } from '../../types/project'

type ProjectState = {
  projects: Project[] | null
  projectsBySlug: Record<string, Project> | null
  _key: string | null

  setProjects: (projects: Project[]) => void
  reset: () => void
  getProjectBySlug: (slug: string) => Project | null
}

const initialState = {
  projects: null,
  projectsBySlug: {},
  _key: null,
}

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

  setProjects: (projects: Project[]) => {
    const key = JSON.stringify(projects)

    if (get()._key === key) return

    if (!projects.length) return

    const cloned = structuredClone(projects)
    const projectsBySlug = {}

    for (const project of cloned) {
      projectsBySlug[project.UIData.slug] = project
    }

    set({
      projects: cloned,
      projectsBySlug,
      _key: key,
    })
  },

  reset: () => set({ ...initialState }),

  getProjectBySlug: (slug: string) => get().projectsBySlug[slug] ?? null,
}))

export default useProjectStore
