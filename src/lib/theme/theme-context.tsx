"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";
type Layout = "grid" | "list" | "card";

interface ModeContextType {
  theme: Theme;
  layout: Layout;
  setTheme: (theme: Theme) => void;
  setLayout: (layout: Layout) => void;
  resolvedTheme: "light" | "dark";
}

const ModeContext = createContext<ModeContextType | undefined>(undefined);

export function ModeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("system");
  const [layout, setLayoutState] = useState<Layout>("grid");
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");

  // Load preferences from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as Theme;
    const savedLayout = localStorage.getItem("layout") as Layout;

    if (savedTheme) setThemeState(savedTheme);
    if (savedLayout) setLayoutState(savedLayout);
  }, []);

  // Handle theme resolution and system preference detection
  useEffect(() => {
    const updateResolvedTheme = () => {
      if (theme === "system") {
        const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light";
        setResolvedTheme(systemTheme);
        document.documentElement.classList.toggle("dark", systemTheme === "dark");
      } else {
        setResolvedTheme(theme);
        document.documentElement.classList.toggle("dark", theme === "dark");
      }
    };

    updateResolvedTheme();

    if (theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      mediaQuery.addEventListener("change", updateResolvedTheme);
      return () => mediaQuery.removeEventListener("change", updateResolvedTheme);
    }
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  const setLayout = (newLayout: Layout) => {
    setLayoutState(newLayout);
    localStorage.setItem("layout", newLayout);
  };

  return (
    <ModeContext.Provider value={{ theme, layout, setTheme, setLayout, resolvedTheme }}>
      {children}
    </ModeContext.Provider>
  );
}

export function useMode() {
  const context = useContext(ModeContext);
  if (context === undefined) {
    throw new Error("useMode must be used within a ModeProvider");
  }
  return context;
}
