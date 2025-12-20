import { create } from 'zustand';

const initialState = {

  bannerUrl: '',
  description: '',
  imgUrls: {},
  isFocused: null,
  name: '',
  shortDescription: '',
  sceneData: {
    autoRotate: true,
    autoRotateSpeed: 1,
    autoUpdateMaterial: false,
    groupName: '',
    materials: {
      defaultMaterial: {},
      colorWays: {},
    },
    modelUrls: [
      { 
        name: '',
        url: ''
      },
    ],
    position: {},
    scale: 1,
  },
};

const selectionStore = (set, get) => ({
  selection: initialState,

  getSelection: () => get().selection,

  setSelection: (selected) => { set({ selection: selected }) },

  setIsFocused: (name) => 
    set((state) => ({ 
      selection: {
        ...state.selection,
        isFocused: name,
      }
    })),

  reset: () =>
    set({ 
      selection: { 
        ...initialState,
        sceneData: { ...initialState.sceneData }
      }
    }),
}); 

const useSelection = create(selectionStore);

export default useSelection;
