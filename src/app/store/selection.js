import { create } from "zustand";
// import { portfolio } from "../../lib/globals";
// const initialState = portfolio.projects[1];

const initialState = {
  name: "",
  bannerUrl: "",
  description: "",
  shortDescription: "",
  imgUrls: {},
  sceneData: {
    modelUrls: [{ name: "", url: "" }],
    scale: 0.0,
    position: {},
    autoRotate: true,
    autoRotateSpeed: 1,
    isPointerOver: "",
    autoUpdateMaterial: false,
    colorCodes: {
      defaultColor: {},
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
