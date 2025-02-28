import { create } from "zustand";

const initialState = {
  name: "",
  bannerUrl: "",
  description: "",
  shortDescription: "",
  imgUrls: {},
  sceneData: {
    modelUrls: [{ name: "poop", url: "TEST" }],
    scale: 0,
    position: {},
    autoRotate: true,
    autoRotateSpeed: 1,
    isPointerOver: "",
    autoUpdateMaterial: false,
    materials: {
      defaultMMaterial: {},
      colorWays: {},
    },
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
      selection: initialState,
    }));
    return get().selection;
  },
});

const useSelection = create(selectionStore);

export default useSelection;
