import type { ReactNode } from "react";
import { motion } from "motion/react";

interface PageHeaderProps {
    title: string;
    subtitle?: string;
    actions?: ReactNode;
}

export const PageHeader = ({ title, subtitle, actions }: PageHeaderProps) => (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
            <h1 className="text-xl font-semibold text-slate-900 dark:text-white">{title}</h1>
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
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center rounded-xl border border-dashed border-slate-300 px-6 py-12 text-center dark:border-slate-700"
    >
        <div className="mb-3 text-slate-400">{icon}</div>
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{title}</h3>
        <p className="mt-1 max-w-sm text-sm text-slate-500 dark:text-slate-400">{text}</p>
        {action && <div className="mt-5">{action}</div>}
    </motion.div>
);
