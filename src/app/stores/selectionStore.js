import { create } from 'zustand';

const initialState = {
  bannerUrl: '',
  displayName: '',
  isFocused: null,
  materialID: '',
  productData: {
    care: '',
    description: '',
    dimensions: '',
    imgUrls: {},
    materialSpecs: '',
    shortDescription: '',
    weight: '',
  },
  sceneData: {
    animateMaterial: true,
    defaultRotationAnimationActive: true,
    animatePosition: false,
    animateRotation: true,
    fileData: { nodeName: '', url: '', },
    groupName: '',
    materials: { defaultMaterialID: '', materialIDs: [], },
    position: {},
    rotation: { x: 0, y: 0, z: 0 },
    deltaRotation: { x: 0, y: 0, z: 0 },
    rotationSpeed: 1,
    scale: 1,
  },
};

function isolateSelection(selection) {
  return {
    ...selection,
    productData: {
      ...selection.productData,
      imgUrls: { ...selection.productData.imgUrls },
    },
    sceneData: {
      ...selection.sceneData,
      fileData: { ...selection.sceneData.fileData },
      materials: {
        ...selection.sceneData.materials,
        materialIDs: [...selection.sceneData.materials.materialIDs],
      },
      position: { ...selection.sceneData.position },
      rotation: { ...selection.sceneData.rotation },
      deltaRotation: { ...selection.sceneData.deltaRotation },
    },
  };
}

const selectionStore = (set, get) => ({
  selection: initialState,

  getSelection: () => get().selection,

  setSelection: (selected) =>
    set((state) => ({
      selection: {
        ...isolateSelection(selected),
        isFocused: selected?.isFocused ?? state.selection?.isFocused ?? null,
      },
    })),

  setIsFocused: (name) =>
    set((state) => ({
      selection: {
        ...isolateSelection(state.selection),
        isFocused: name,
      },
    })),

  setMaterialID: (id) =>
    set((state) => ({
      selection: {
        ...isolateSelection(state.selection),
        materialID: id,
      },
    })),

  setFocusAndMaterial: (name, materialID) =>
    set((state) => ({
      selection: {
        ...isolateSelection(state.selection),
        isFocused: name,
        materialID: materialID,
      },
    })),

  toggleAnimateRotation: () =>
    set((state) => {
      const cloned = isolateSelection(state.selection);
      cloned.sceneData.animateRotation = !state.selection.sceneData.animateRotation;
      return { selection: cloned };
    }),

  setRotation: (vals) =>
    set((state) => {
      const cloned = isolateSelection(state.selection);
      cloned.sceneData.deltaRotation = { ...vals };
      cloned.sceneData.defaultRotationAnimationActive = false;
      return { selection: cloned };
    }),

    toggleDefaultRotationAnimation: () =>
      set((state) => {
        const cloned = isolateSelection(state.selection);
        cloned.sceneData.defaultRotationAnimationActive = !state.selection.sceneData.defaultRotationAnimationActive;
        cloned.sceneData.deltaRotation = { ...initialState.sceneData.deltaRotation };
        return { selection: cloned };
      }),

    reset: () => set({ selection: isolateSelection(initialState) }),
});

const useSelection = create(selectionStore);

export default useSelection;
