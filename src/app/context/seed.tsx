'use client'

import React from 'react';
import { createContext, useContext, ReactNode } from "react";
import { useLocalStorage } from '../lib/useLocalStorage';

const Context = createContext<[number, (value: number) => void]>([0, () => {}]);

export function SeedProvider({ children }: Readonly<{
  children: ReactNode;
}>) {
  const [seed, setSeed] = useLocalStorage('seed', 0);
  return (
    <Context.Provider value={[seed, setSeed]}>{children}</Context.Provider>
  );
}

export function useSeedContext() {
  return useContext(Context);
}