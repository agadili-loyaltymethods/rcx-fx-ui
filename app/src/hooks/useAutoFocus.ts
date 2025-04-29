import { useEffect, useRef } from 'react';

export const useAutoFocus = (shouldFocus: boolean = true) => {
  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (shouldFocus && elementRef.current) {
      setTimeout(() => {
        elementRef.current?.focus();
      }, 400);
    }
  }, [shouldFocus]);

  return elementRef;
};