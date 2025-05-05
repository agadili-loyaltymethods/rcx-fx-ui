import { useState, useCallback } from 'react';
import { create } from 'zustand';

interface DialogStore {
  isOpen: boolean;
  dialogProps: any;
  openDialog: (props: any) => void;
  closeDialog: () => void;
}

export const useDialogStore = create<DialogStore>((set) => ({
  isOpen: false,
  dialogProps: {},
  openDialog: (props) => set({ isOpen: true, dialogProps: props }),
  closeDialog: () => set({ isOpen: false, dialogProps: {} }),
}));

export const useDialog = () => {
  const { isOpen, dialogProps, openDialog, closeDialog } = useDialogStore();
  
  return {
    isOpen,
    dialogProps,
    openDialog,
    closeDialog,
  };
};