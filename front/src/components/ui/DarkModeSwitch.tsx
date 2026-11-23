import { AnimatePresence, motion } from "motion/react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "../../hooks/useTheme";

export const ThemeToggle = ({ className = "" }: { className?: string }) => {
    const { isDark, toggle } = useTheme();
    return (
        <button
            onClick={toggle}
            aria-label={isDark ? "Passer en mode clair" : "Passer en mode sombre"}
            className={`relative grid size-8 cursor-pointer place-items-center overflow-hidden rounded-md text-slate-500 transition
                hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white ${className}`}
        >
            <AnimatePresence mode="wait" initial={false}>
                <motion.span
                    key={isDark ? "moon" : "sun"}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.12 }}
                >
                    {isDark ? <Moon className="size-4" /> : <Sun className="size-4" />}
                </motion.span>
            </AnimatePresence>
        </button>
    );
};

export const DarkModeSwitch = () => {
    const { isDark, toggle } = useTheme();
    return (
        <button
            role="switch"
            aria-checked={isDark}
            aria-label="Mode sombre"
            onClick={toggle}
            className={`relative flex h-6 w-10 cursor-pointer items-center rounded-full p-0.5 transition-colors duration-300 ${
                isDark ? "bg-slate-100" : "bg-slate-300"
            }`}
        >
            <motion.span
                layout
                transition={{ duration: 0.15 }}
                className={`block size-5 rounded-full shadow-sm ${isDark ? "ml-auto bg-slate-900" : "bg-white"}`}
            >
            </motion.span>
        </button>
    );
};

export default DarkModeSwitch;
