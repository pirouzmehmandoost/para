import { create } from 'zustand'
import type { EulerValue } from '../../types/EulerValue'

type SelectionValues = {
  focusedName: string | null
  focusedUUID: string | null
  focusedMaterialID: string | null
  autoRotationActive: boolean
  deltaRotation: EulerValue
}

type SelectionActions = {
  setFocused: (name: string, materialID: string, uuid: string | null) => void
  setFocusedUUID: (uuid: string) => void
  setRotation: (rotation: EulerValue) => void
  toggleAutoRotation: () => void
  setMaterialID: (id: string) => void
  reset: () => void
}

type SelectionState = SelectionValues & SelectionActions

const initialState: SelectionValues = {
  focusedName: null,
  focusedUUID: null,
  focusedMaterialID: null,
  autoRotationActive: true,
  deltaRotation: { x: 0, y: 0, z: 0 },
}

const useSelection = create<SelectionState>()((set, get) => ({
  ...initialState,

  setFocused: (name: string, materialID: string, uuid: string | null) => {
    set((state) => ({
      ...state,
      focusedName: name,
      focusedUUID: uuid,
      focusedMaterialID: materialID,
    }))
  },

  setMaterialID: (id: string) =>
    set((state) => ({
      ...state,
      focusedMaterialID: id,
    })),

  setFocusedUUID: (uuid: string) =>
    set((state) => ({
      ...state,
      focusedUUID: uuid,
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