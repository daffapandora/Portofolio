"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { ReactNode, useSyncExternalStore } from "react";

interface ThemeProviderProps {
  children: ReactNode;
}

// Hydration-safe mounting detection using useSyncExternalStore
const emptySubscribe = () => () => { };
const getSnapshot = () => true;
const getServerSnapshot = () => false;

export function ThemeProvider({ children }: ThemeProviderProps) {
  const mounted = useSyncExternalStore(emptySubscribe, getSnapshot, getServerSnapshot);

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <NextThemesProvider
      attribute="data-theme"
      defaultTheme="dark"
      enableSystem={false}
      disableTransitionOnChange={false}
    >
      {children}
    </NextThemesProvider>
  );
}
