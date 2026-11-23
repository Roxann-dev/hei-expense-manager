import { useCallback, useSyncExternalStore } from "react";

type Theme = "light" | "dark";

const listeners = new Set<() => void>();

const read = (): Theme =>
    document.documentElement.classList.contains("dark") ? "dark" : "light";

const subscribe = (cb: () => void) => {
    listeners.add(cb);
    return () => listeners.delete(cb);
};

export const setTheme = (theme: Theme) => {
    const root = document.documentElement;
    const apply = () => {
        root.classList.toggle("dark", theme === "dark");
        listeners.forEach((l) => l());
    };
    try {
        localStorage.setItem("theme", theme);
    } catch {
        /* stockage indisponible : on garde juste le thème en mémoire */
    }

    // Transition douce entre thèmes quand le navigateur le permet
    const doc = document as Document & { startViewTransition?: (cb: () => void) => unknown };
    if (doc.startViewTransition && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        doc.startViewTransition(apply);
    } else {
        apply();
    }
};

export const useTheme = () => {
    const theme = useSyncExternalStore(subscribe, read, () => "light" as Theme);
    const toggle = useCallback(() => setTheme(theme === "dark" ? "light" : "dark"), [theme]);
    return { theme, isDark: theme === "dark", toggle, setTheme };
};
