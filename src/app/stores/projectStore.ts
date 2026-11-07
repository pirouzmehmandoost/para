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

// const capsuleData: Project = {

//   UIData: {
//     care: 'Hand wash with soap, air dry. Avoid contact with solvents containing acetone.',
//     description: `TestMesh`,
//     dimensions: `21.5" x 5" x 14"`,
//     displayName: 'TestMesh',
//     materialSpecs: 'Thermoplastic urethane',
//     shortDescription: `This is a Test`,
//     weight: '1lb',
//     slug: 'testmesh',
//   },
//   sceneData: {
//     nodeName: 'testmesh',
//     url: '/something.glb',
//     defaultMaterialID: 'matte_black',
//     materialIDs: ['matte_black'],
//     position: { x: -130, y: 50, z: -50 },
//     rotation: { x: 0, y: 0, z: 0 },
//     rotationSpeed: 0.3,
//     scale: 1,
//   },
// }

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
    const projectsBySlug: Record<string, Project> = {}

    for (const project of cloned) {
      const { UIData: { slug } = {} } = project ?? null
      if (project !== null && typeof slug === 'string' && slug.length > 0) {
        projectsBySlug[slug] = project
      }
    }

    // projectsBySlug['testmesh'] = capsuleData

    set({
      projects: cloned,
      projectsBySlug,
      _key: key,
    })
  },

  reset: () => set({ ...initialState }),

  getProjectBySlug: (slug: string): Project | null => {
    if (slug.length > 0) {
      const projectsBySlug: Record<string, Project> | null = get().projectsBySlug
      if (projectsBySlug === null) return null

      const project: Project | null = `${slug}` in projectsBySlug ? projectsBySlug[`${slug}`] : null
      if (project !== null) return project
    }

    return null
  }
}))

export default useProjectStore
