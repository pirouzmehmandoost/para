import { create } from 'zustand'
import type { EulerValue } from '../../types/EulerValue'

type SelectionValues = {
  focusedSlug: string | null
  focusedMaterialID: string | null
  autoRotationActive: boolean
  deltaRotation: EulerValue
}

type SelectionActions = {
  setFocused: (materialID: string, slug: string) => void
  setRotation: (rotation: EulerValue) => void
  toggleAutoRotation: () => void
  setMaterialID: (id: string) => void
  reset: () => void
}

type SelectionState = SelectionValues & SelectionActions

const initialState: SelectionValues = {
  focusedSlug: null,
  focusedMaterialID: null,
  autoRotationActive: false,
  deltaRotation: { x: 0, y: 0, z: 0 },
}

const useSelection = create<SelectionState>()((set, get) => ({
  ...initialState,

  setFocused: (materialID: string, slug: string) => {
    set((state) => ({
      ...state,
      focusedMaterialID: materialID,
      focusedSlug: slug,
    }))
  },

  setMaterialID: (id: string) =>
    set((state) => ({
      ...state,
      focusedMaterialID: id,
    })),


  setRotation: (rotation: EulerValue) => {
    const {
      deltaRotation: currentRotation,
      autoRotationActive: isAutoRotationActive
    } = get()

    if (
      currentRotation.x === rotation.x &&
      currentRotation.y === rotation.y &&
      currentRotation.z === rotation.z &&
      isAutoRotationActive === false
    ) return

    set((state) => ({
      ...state,
      autoRotationActive: false,
      deltaRotation: { ...rotation }
    }))
  },

  toggleAutoRotation: () =>
    set((state) => ({
      ...state,
      autoRotationActive: !state.autoRotationActive,
      deltaRotation: { ...initialState.deltaRotation }
    })),

  reset: () => set({
    ...initialState,
    deltaRotation: { ...initialState.deltaRotation }
  }),

}))






export default useSelection