import { create } from 'zustand';

type OpenReason = '' | 'user-toggle' | 'route-change' | 'startup';

type MenuState = {
  activeSection: string;
  isBackgroundEnabled: boolean;
  lastInteractionAt: number; // ms since epoch, or 0 if never
  openReason: OpenReason;
  pathname: string;
  visible: boolean;
};

type MenuStore = {
  menuState: MenuState;

  getMenuState: () => MenuState;

  setMenuState: (partial: Partial<MenuState>) => void;
  setVisible: (visible: boolean) => void;

  reset: () => void;
};

const initialState: MenuState = {
  activeSection: '',
  isBackgroundEnabled: true,
  lastInteractionAt: 0,
  openReason: '',
  pathname: '',
  visible: false,
};

const useMenu = create<MenuStore>((set, get) => ({
  menuState: initialState,

  getMenuState: () => get().menuState,

  setMenuState: (partial) =>
    set((state) => ({
      menuState: {
        ...state.menuState,
        ...partial,
      },
    })),

  setVisible: (visible) =>
    set((state) => ({
      menuState: {
        ...state.menuState,
        visible,
      },
    })),

  reset: () => set({ menuState: { ...initialState } }),
}));

export default useMenu;