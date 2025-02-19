import { create } from "zustand";
import { portfolio } from "../../lib/globals";

//temporary
// const initialState = portfolio.projects[1];
const initialState = undefined;

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
