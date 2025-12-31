import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

type OpenReason = '' | 'user-toggle' | 'route-change' | 'firstPageVisit';

type MenuState = {
  activeSection: string;
  isBackgroundEnabled: boolean;
  lastInteractionAt: number;
  openReason: OpenReason;
  pathname: string;
  visible: boolean;
};

type MenuStore = {
  menuState: MenuState;
  firstPageVisited: boolean;
  hasHydrated: boolean;
  getMenuState: () => MenuState;
  setMenuState: (partial: Partial<MenuState>) => void;
  setVisible: (visible: boolean) => void;
  setPageVisited: () => void;
  setHasHydrated: (v: boolean) => void;
  reset: () => void;
};

const initialMenuState: MenuState = {
  activeSection: '',
  isBackgroundEnabled: true,
  lastInteractionAt: 0,
  openReason: '',
  pathname: '',
  visible: false,
};

const useMenu = create<MenuStore>()(
  persist(
    (set, get) => ({
      menuState: initialMenuState,
      firstPageVisited: false,
      hasHydrated: false,

      getMenuState: () => get().menuState,

      setMenuState: (partial) =>
        set((state) => ({
          menuState: { ...state.menuState, ...partial },
        })),

      setVisible: (visible) =>
        set((state) => ({
          menuState: { ...state.menuState, visible },
        })),

      setPageVisited: () => set({ firstPageVisited: true }),
      setHasHydrated: (v) => set({ hasHydrated: v }),

      reset: () => set({ menuState: { ...initialMenuState } }),
    }),
    {
      name: 'para.userSession',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ firstPageVisited: state.firstPageVisited }),
      onRehydrateStorage: () => (state) => { state?.setHasHydrated(true) },
    }
  )
);

export default useMenu;