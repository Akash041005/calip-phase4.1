"use client";

import { createContext, useContext, useEffect, useCallback, useMemo, useSyncExternalStore } from "react";
import { useAuth } from "../auth/AuthProvider";
import { updatePreferences } from "../../lib/usersApi";

const ThemeContext = createContext({
  isDark: false,
  toggleTheme: () => {},
  setTheme: () => {},
});

function subscribeTheme(callback) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("storage", callback);
  const obs = new MutationObserver(callback);
  obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => {
    window.removeEventListener("storage", callback);
    obs.disconnect();
  };
}

function getThemeSnapshot() {
  if (typeof document === "undefined") return false;
  return document.documentElement.classList.contains("dark");
}

function getServerSnapshot() {
  return false;
}

export function ThemeProvider({ children }) {
  const { user, updateUser, isAuthenticated } = useAuth();
  const isDark = useSyncExternalStore(subscribeTheme, getThemeSnapshot, getServerSnapshot);

  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem("calip-theme") : null;
    let shouldBeDark = false;
    if (stored !== null) {
      shouldBeDark = stored === "dark";
    } else if (user?.settings?.darkMode !== undefined) {
      shouldBeDark = Boolean(user.settings.darkMode);
    } else if (typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      shouldBeDark = true;
    }

    const root = document.documentElement;
    // Guard DOM write: toggling class unconditionally re-fires the
    // MutationObserver in subscribeTheme -> extra re-render loop.
    const isCurrentlyDark = root.classList.contains("dark");
    if (shouldBeDark !== isCurrentlyDark) {
      root.classList.toggle("dark", shouldBeDark);
    }
  }, [user?.settings?.darkMode]);

  const toggleTheme = useCallback(async () => {
    const next = !document.documentElement.classList.contains("dark");
    const root = document.documentElement;
    if (next) {
      root.classList.add("dark");
      localStorage.setItem("calip-theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("calip-theme", "light");
    }

    if (updateUser) {
      updateUser((prev) => ({
        ...prev,
        settings: { ...(prev?.settings || {}), darkMode: next },
      }));
    }

    if (isAuthenticated) {
      try {
        await updatePreferences({ darkMode: next });
      } catch {
        // Local state remains responsive even if server sync fails
      }
    }
  }, [updateUser, isAuthenticated]);

  const setTheme = useCallback((dark) => {
    const root = document.documentElement;
    if (dark) {
      root.classList.add("dark");
      localStorage.setItem("calip-theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("calip-theme", "light");
    }
  }, []);

  // Memoize context value: without this, every AuthProvider render creates a
  // new object and re-renders the whole tree even when theme is unchanged.
  const value = useMemo(
    () => ({ isDark, toggleTheme, setTheme }),
    [isDark, toggleTheme, setTheme]
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

export default ThemeProvider;

