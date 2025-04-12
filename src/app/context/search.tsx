'use client'

import React from 'react';
import { createContext, Dispatch, SetStateAction, useContext, useState, ReactNode } from "react";

const Context = createContext<[string, Dispatch<SetStateAction<string>>]>(["", () => {}]);

export function SearchProvider({ children }: Readonly<{
  children: ReactNode;
}>) {
  const [search, setSearch] = useState("");
  return (
    <Context.Provider value={[search, setSearch]}>{children}</Context.Provider>
  );
}

export function useSearchContext() {
  return useContext(Context);
}