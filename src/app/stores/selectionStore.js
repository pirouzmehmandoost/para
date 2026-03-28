import { create } from 'zustand';

const initialState = {
  bannerUrl: '',
  dimensions: '',
  description: '',
  details: '',
  imgUrls: {},
  materialID: '',
  isFocused: null,
  displayName: '',
  shortDescription: '',
  sceneData: {
    animatePosition: false,
    animateRotation: true,
    rotationSpeed: 1,
    animateMaterial: false,
    groupName: '',
    materials: {
      defaultMaterialID: '',
      materialIDs: [],
    },
    fileData: {
      nodeName: '',
      url: ''
    },
    position: {},
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
