export const Logo = () => (
    <div className="flex items-center gap-2">
        <svg viewBox="0 0 24 24" className="size-6 text-slate-900 dark:text-white" aria-hidden="true">
            <rect x="2" y="2" width="20" height="20" rx="6" fill="currentColor" />
            <path d="M8 15.5l3-3.5 2.5 2 3-4" fill="none" stroke="var(--color-brand-400)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="text-[15px] font-semibold tracking-tight text-slate-900 dark:text-white">CashFlow</span>
    </div>
);
