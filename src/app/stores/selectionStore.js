import { create } from 'zustand';

const initialState = {
  focusedName: null,
  focusedUUID: null,
  focusedMaterialID: '',
  defaultRotationAnimationActive: true,
  deltaRotation: { x: 0, y: 0, z: 0 },
};

function isolateSelection(selection) {
  return {
    ...selection,
    deltaRotation: { ...selection.deltaRotation },
  };
}

const selectionStore = (set) => ({
  selection: initialState,

  setFocused: (name, materialID, uuid) =>
    set((state) => ({
      selection: {
        ...isolateSelection(state.selection),
        focusedName: name,
        focusedUUID: uuid,
        focusedMaterialID: materialID,
      },
    })),

  setFocusedUUID: (uuid) =>
    set((state) => ({
      selection: {
        ...isolateSelection(state.selection),
        focusedUUID: uuid,
      },
    })),

  setMaterialID: (id) =>
    set((state) => ({
      selection: {
        ...isolateSelection(state.selection),
        focusedMaterialID: id,
      },
    })),

  setRotation: (vals) =>
    set((state) => {
      const cloned = isolateSelection(state.selection);
      cloned.deltaRotation = { ...vals };
      cloned.defaultRotationAnimationActive = false;
      return { selection: cloned };
    }),

  toggleDefaultRotationAnimation: () =>
    set((state) => {
      const cloned = isolateSelection(state.selection);
      cloned.defaultRotationAnimationActive = !state.selection.defaultRotationAnimationActive;
      cloned.deltaRotation = { ...initialState.deltaRotation };
      return { selection: cloned };
    }),

  reset: () => set({ selection: isolateSelection(initialState) }),
});

const useSelection = create(selectionStore);

export default useSelection;
