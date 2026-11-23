import { AnimatePresence, motion } from "motion/react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "../../hooks/useTheme";

/** Bouton rond qui bascule entre clair et sombre, avec une icône qui pivote. */
export const ThemeToggle = ({ className = "" }: { className?: string }) => {
    const { isDark, toggle } = useTheme();
    return (
        <button
            onClick={toggle}
            aria-label={isDark ? "Passer en mode clair" : "Passer en mode sombre"}
            className={`relative grid size-10 cursor-pointer place-items-center overflow-hidden rounded-xl text-slate-500 transition
                hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white ${className}`}
        >
            <AnimatePresence mode="wait" initial={false}>
                <motion.span
                    key={isDark ? "moon" : "sun"}
                    initial={{ rotate: -90, scale: 0.4, opacity: 0 }}
                    animate={{ rotate: 0, scale: 1, opacity: 1 }}
                    exit={{ rotate: 90, scale: 0.4, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                >
                    {isDark ? <Moon className="size-5" /> : <Sun className="size-5" />}
                </motion.span>
            </AnimatePresence>
        </button>
    );
};

/** Interrupteur clair / sombre, utilisé dans le profil. */
export const DarkModeSwitch = () => {
    const { isDark, toggle } = useTheme();
    return (
        <button
            role="switch"
            aria-checked={isDark}
            aria-label="Mode sombre"
            onClick={toggle}
            className={`relative flex h-7 w-12 cursor-pointer items-center rounded-full p-1 transition-colors duration-300 ${
                isDark ? "bg-brand-500" : "bg-slate-300"
            }`}
        >
            <motion.span
                layout
                transition={{ type: "spring", stiffness: 600, damping: 32 }}
                className={`grid size-5 place-items-center rounded-full bg-white shadow ${isDark ? "ml-auto" : ""}`}
            >
                {isDark ? <Moon className="size-3 text-brand-600" /> : <Sun className="size-3 text-amber-500" />}
            </motion.span>
        </button>
    );
};

export default DarkModeSwitch;
