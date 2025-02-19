import { create } from "zustand";

const initialState = null;

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
