import type { ReactNode } from "react";
import { motion } from "motion/react";

interface PageHeaderProps {
    title: string;
    subtitle?: string;
    actions?: ReactNode;
}

export const PageHeader = ({ title, subtitle, actions }: PageHeaderProps) => (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
            <h1 className="text-2xl font-extrabold text-slate-900 sm:text-3xl dark:text-white">{title}</h1>
            {subtitle && <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
);

interface EmptyStateProps {
    icon: ReactNode;
    title: string;
    text: string;
    action?: ReactNode;
}

export const EmptyState = ({ icon, title, text, action }: EmptyStateProps) => (
    <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="card flex flex-col items-center px-6 py-14 text-center"
    >
        <div className="mb-4 grid size-14 place-items-center rounded-2xl bg-brand-500/10 text-brand-500">{icon}</div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white">{title}</h3>
        <p className="mt-1 max-w-sm text-sm text-slate-500 dark:text-slate-400">{text}</p>
        {action && <div className="mt-5">{action}</div>}
    </motion.div>
);
