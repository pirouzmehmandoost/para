import { create } from 'zustand';

const initialState = {
  visible: false,
};

const MenuStore = (set, get) => ({
  menuState: initialState,

  getMenuState: () => get().menuState,
  
  setMenuState: (newState) => {
    set({
      ...menuState, 
      ...newState,
    });
  },

  reset: () => {
    set({ 
      menuState: {...initialState },
    });
  },
}); 

const useMenu = create(MenuStore);

export default useMenu;
