import { create } from 'zustand'
import portfolio from "../../lib/globals"


// const initialState = {
//   name: "Oval Bag",
//   imgUrl: [
//     '/oval_bag_blender_matte_white_front.png',
//     '/oval_bag_blender_glossy_white_front.png',
//     '/oval_bag_blender_matte_black_front.png',
//     '/oval_bag_blender_matte_black_quarter.png',
//     '/oval_bag_blender_matte_black_top.png',
//     '/oval_bag_blender_matte_black_side.png',
//   ],
//   price: `$ ${100}`,
//   productType: "bag",
//   colors: [
//     ['Matte White', '#ece8e2'],
//     ["Glossy White", '#ece8e2'],
//     ["Matte Black", '#fbda44'],
//   ],
//   modelUrl: "/oval_bag_1.glb"
// };
const initialState = portfolio.products[0]


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
    return get().selection
  },

});


const useSelection = create(selectionStore);

export default useSelection;

