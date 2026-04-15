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
    rotation: { x: 0, y:0, z:0 },
    deltaRotation: { x: 0, y:0, z:0 },
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
          productData: {
            ...selected.productData,
            imgUrls: { ...selected.productData.imgUrls },
          },
          sceneData: {
            ...selected.sceneData,
            fileData: { ...selected.sceneData.fileData },
            materials: { ...selected.sceneData.materials },
          },
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

    setFocusAndMaterial: (name, materialID) =>
      set((state) => ({
        selection: {
          ...state.selection,
          isFocused: name,
          materialID: materialID,
        }
      })),

  toggleAnimateRotation: () => {
    set((state) => ({
      selection: {
        ...state.selection,
        productData: {
          ...state.selection.productData,
          imgUrls: {...state.selection.productData.imgUrls },
        },
        sceneData: {
          ...state.selection.sceneData,
          fileData: { ...state.selection.sceneData.fileData },
          materials: { ...state.selection.sceneData.materials },
          animateRotation: !state.selection.sceneData.animateRotation,
        },
      }
    }));
  },

setRotation: (vals) => {
    set((state) => ({
      selection: {
        ...state.selection,
        productData: {
          ...state.selection.productData,
          imgUrls: {...state.selection.productData.imgUrls },
        },
        sceneData: {
          ...state.selection.sceneData,
          fileData: { ...state.selection.sceneData.fileData },
          materials: { ...state.selection.sceneData.materials },
          rotation: { ...state.selection.sceneData.rotation }, 
          deltaRotation: {...vals},
          defaultRotationAnimationActive: false,
        },
      }
    }));
  },

  toggleDefaultRotationAnimation: () => {
    set((state) => ({
      selection: {
        ...state.selection,
        productData: {
          ...state.selection.productData,
          imgUrls: {...state.selection.productData.imgUrls },
        },
        sceneData: {
          ...state.selection.sceneData,
          fileData: { ...state.selection.sceneData.fileData },
          materials: { ...state.selection.sceneData.materials },
          rotation: { ...state.selection.sceneData.rotation },
          defaultRotationAnimationActive: !state.selection.sceneData.defaultRotationAnimationActive, // toggle
          deltaRotation: { ...initialState.sceneData.deltaRotation }, // reset deltaRotation (this may not be a good design decision)
        },
      }
    }));
  },

  reset: () =>
    set({
      selection: {
        ...initialState,
        productData: {
          ...initialState.productData,
          imgUrls: { ...initialState.productData.imgUrls }
        },
        sceneData: {
          ...initialState.sceneData,
          fileData: { ...initialState.sceneData.fileData },
          materials: {
            ...initialState.sceneData.materials, 
            materialIDs: [ ...initialState.sceneData.materials.materialIDs],
          },
          rotation: { ...initialState.sceneData.rotation },
          deltaRotation: { ...initialState.sceneData.deltaRotation },
        },
      },
    }),
});

const useSelection = create(selectionStore);

export default useSelection;
