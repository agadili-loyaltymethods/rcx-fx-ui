import { useState, useCallback } from 'react';
import { create } from 'zustand';

interface LoaderStore {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export const useLoaderStore = create<LoaderStore>((set) => ({
  isLoading: false,
  setIsLoading: (loading) => set({ isLoading: loading }),
}));

export const useLoader = () => {
  const { isLoading, setIsLoading } = useLoaderStore();
  
  return {
    isLoading,
    setIsLoading,
  };
};