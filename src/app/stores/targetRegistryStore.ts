import { create } from 'zustand'
import { Object3D, Scene } from 'three'
import TargetRegistry from '@targetRegistry'

type Targets = Object3D[] | ((obj: Object3D) => boolean)

type TargetRegistryState = {
  registry: TargetRegistry | null
  _uuid: string | null
  initialize: (scene: Scene, targets: Targets) => boolean
  reset: () => void
}

const initialState: {
  registry: TargetRegistry | null
  _uuid: string | null
} = {
  registry: null,
  _uuid: null,
}

const useTargetRegistry = create<TargetRegistryState>()((set, get) => ({
  ...initialState,

  initialize: (scene: Scene, targets: Targets) => {
    if (!scene?.isScene) return false

    const { registry, _uuid } = get()
    if (!!registry && scene.uuid === _uuid) return false

    registry?.deregister()

    const newRegistry = new TargetRegistry(scene)
    const sceneUUID = scene.uuid

    if (Array.isArray(targets)) {
      newRegistry.register(targets)
    }
    else {
      newRegistry.registerByFilter(targets)
    }

    set({
      registry: newRegistry,
      _uuid: sceneUUID,
    })

    return true
  },

  reset: () => {
    const reg = get().registry

    if (!!reg) {
      reg.deregister()
      set({ ...initialState })
    }
  },
}))

export default useTargetRegistry
