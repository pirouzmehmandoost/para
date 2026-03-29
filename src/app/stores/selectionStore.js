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
    animatePosition: false,
    animateRotation: true,
    fileData: {
      nodeName: '',
      url: '',
    },
    groupName: '',
    materials: {
      defaultMaterialID: '',
      materialIDs: [],
    },
    position: {},
    rotation: 0,
    rotationSpeed: 1,
    scale: 1,
  },
};

const selectionStore = (set, get) => ({
  selection: initialState,

  getSelection: () => get().selection,

  setSelection: (selected) => {
    set((state) => {
      const prevFocused = state.selection?.isFocused ?? null;
      const nextFocused = selected?.isFocused ?? prevFocused;

      return {
        selection: {
          ...selected,
          isFocused: nextFocused,
        },
      };
    });
  },

  setIsFocused: (name) =>
    set((state) => ({
      selection: {
        ...state.selection,
        isFocused: name,
      }
    })),

  setMaterialID: (id) =>
    set((state) => ({
      selection: {
        ...state.selection,
        materialID: id,
      }
    })),

  reset: () =>
    set({
      selection: {
        ...initialState,
        sceneData: {
          ...initialState.sceneData,
          fileData: {
            ...initialState.sceneData.fileData,
          },
          materials: {
            ...initialState.sceneData.materials,
          },
        },
      },
    }),
});

const useSelection = create(selectionStore);

export default useSelection;
