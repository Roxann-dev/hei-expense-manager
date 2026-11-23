import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";

interface ModalProps {
    open: boolean;
    onClose: () => void;
    title: string;
    description?: string;
    children: ReactNode;
    size?: "sm" | "md";
}

const Modal = ({ open, onClose, title, description, children, size = "md" }: ModalProps) => {
    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
        document.addEventListener("keydown", onKey);
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.removeEventListener("keydown", onKey);
            document.body.style.overflow = prev;
        };
    }, [open, onClose]);

    return createPortal(
        <AnimatePresence>
            {open && (
                <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-4">
                    <motion.div
                        className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={onClose}
                    />
                    <motion.div
                        role="dialog"
                        aria-modal="true"
                        aria-label={title}
                        className={`relative max-h-[92vh] w-full overflow-y-auto rounded-t-3xl border border-slate-200/70 bg-white p-6 shadow-2xl
                            sm:rounded-3xl dark:border-white/10 dark:bg-slate-900 ${size === "sm" ? "sm:max-w-sm" : "sm:max-w-lg"}`}
                        initial={{ opacity: 0, y: 40, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 24, scale: 0.98 }}
                        transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    >
                        <div className="mb-5 flex items-start justify-between gap-4">
                            <div>
                                <h2 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h2>
                                {description && <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{description}</p>}
                            </div>
                            <button
                                onClick={onClose}
                                aria-label="Fermer"
                                className="-m-1 cursor-pointer rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/10 dark:hover:text-white"
                            >
                                <X className="size-5" />
                            </button>
                        </div>
                        {children}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>,
        document.body
    );
};

export default Modal;
