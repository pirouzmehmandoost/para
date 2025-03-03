import { create } from "zustand";

const initialState = {
  name: "",
  bannerUrl: "",
  description: "",
  shortDescription: "",
  imgUrls: {},
  sceneData: {
    autoRotate: true,
    autoRotateSpeed: 1,
    autoUpdateMaterial: false,
    groupName: "",
    isPointerOver: "",
    materials: {
      defaultMaterial: {},
      colorWays: {},
    },
    modelUrls: [{ name: "", url: "" }],
    position: {},
    scale: 0,
  },
};

const selectionStore = (set, get) => ({
  selection: initialState,

  getSelection: () => get().selection,

  setSelection: (selected) => {
    set((state) => ({
      ...state,
      selection: selected,
    }));
  },

  reset: () => {
    set((state) => ({
      ...state,
      selection: { ...initialState, sceneData: { ...initialState.sceneData } },
    }));
  },
});

const useSelection = create(selectionStore);

export default useSelection;
