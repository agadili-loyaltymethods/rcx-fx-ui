import { create } from 'zustand';

interface DrawerStore {
  isDrawerOpen: boolean;
  setDrawerState: (isOpen: boolean) => void;
}

export const useDrawerStore = create<DrawerStore>((set) => ({
  isDrawerOpen: false,
  setDrawerState: (isOpen) => set({ isDrawerOpen: isOpen }),
}));

export const useDrawer = () => {
  const { isDrawerOpen, setDrawerState } = useDrawerStore();
  
  return {
    isDrawerOpen,
    setDrawerState,
  };
};