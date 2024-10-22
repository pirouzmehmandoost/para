import { create } from 'zustand'

const initialSelection = {
    name: "Rock Bag v3.0",
    imgUrl: ["/rock_tote.png"],
    price: `$ ${100}`,
    productType: "bag",
    modelUrl: '/oval_bag_glossy_black.glb',
};


const selectionStore = (set, get) => ({
    selection: initialSelection,

    getSelection: () => { 
        const currentSelection = get().selection;
        return currentSelection;
    },


    setSelection: (selected) => {
    set((state) => ({
        ...state,
      selection: selected,
    }));
  },

    reset: () => {
        set((state) => ({
            ...state,
          selection: initialSelection,
        }));
        return get().selection
    },

  });


const useSelection = create(selectionStore);

  export default useSelection;

