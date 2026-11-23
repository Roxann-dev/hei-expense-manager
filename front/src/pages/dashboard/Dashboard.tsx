import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import {
    AlertTriangle,
    ArrowDownLeft,
    ArrowUpRight,
    Lightbulb,
    PiggyBank,
    Plus,
    Repeat,
    TrendingDown,
    TrendingUp,
    Wallet,
} from "lucide-react";
import { getBudgetAlert, getSummary } from "../../services/summaryService";
import { getExpenses, type Expense } from "../../services/expenseService";
import { getIncomes, type IncomeResponse } from "../../services/incomeService";
import { formatCurrency } from "../../utils/formatCurrency";
import { formatDate } from "../../utils/formatDate";
import { cashflowSeries, expenseDate, monthlyTotals, percentChange } from "../../utils/finance";
import { CashflowChart, DonutChart } from "../../components/charts/Chart";
import { CATEGORY_COLORS } from "../../utils/colors";
import AnimatedNumber from "../../components/ui/AnimatedNumber";
import Button from "../../components/ui/Button";
import { Skeleton } from "../../components/ui/Loader";
import { itemVariants, listVariants } from "../../utils/motion";
import { useApiError } from "../../hooks/useApiError";

interface Summary {
    totalExpenses: number;
    categoryCount: number;
    expensesByCategory: { categoryId: number; categoryName: string; total: number }[];
    lastUpdated: string;
}

const formatPct = (n: number) => `${Math.round(n)} %`;

const Delta = ({ value, invert = false }: { value: number | null; invert?: boolean }) => {
    if (value === null) return <span className="text-xs text-slate-400">— vs mois dernier</span>;
    const up = value >= 0;
    const good = invert ? !up : up;
    const Icon = up ? TrendingUp : TrendingDown;
    return (
        <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
                good ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
            }`}
        >
            <Icon className="size-3" />
            {up ? "+" : ""}
            {value.toFixed(0)} %
        </span>
    );
};

interface KpiProps {
    label: string;
    value: number;
    format: (n: number) => string;
    icon: ReactNode;
    tone: string;
    footer: ReactNode;
    highlight?: boolean;
}

const Kpi = ({ label, value, format, icon, tone, footer, highlight }: KpiProps) => (
    <motion.div
        variants={itemVariants}
        whileHover={{ y: -4 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className={
            highlight
                ? "relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-500 to-brand-800 p-5 text-white shadow-xl shadow-brand-500/25"
                : "card p-5"
        }
    >
        {highlight && <div className="absolute -top-10 -right-10 size-32 rounded-full bg-white/10 blur-2xl" />}
        <div className="relative flex items-center justify-between">
            <span className={`text-sm font-medium ${highlight ? "text-white/80" : "text-slate-500 dark:text-slate-400"}`}>{label}</span>
            <div className={`grid size-9 place-items-center rounded-xl ${tone}`}>{icon}</div>
        </div>
        <AnimatedNumber
            value={value}
            format={format}
            className={`relative mt-3 block font-display text-2xl font-bold ${highlight ? "" : "text-slate-900 dark:text-white"}`}
        />
        <div className="relative mt-3">{footer}</div>
    </motion.div>
);

const DashboardSkeleton = () => (
    <div className="space-y-6">
        <Skeleton className="h-9 w-64" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-36 rounded-2xl" />
            ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
            <Skeleton className="h-80 rounded-2xl lg:col-span-2" />
            <Skeleton className="h-80 rounded-2xl" />
        </div>
    </div>
);

const greeting = () => {
    const h = new Date().getHours();
    return h < 6 ? "Bonne nuit" : h < 18 ? "Bonjour" : "Bonsoir";
};

const Dashboard: React.FC = () => {
    const [summary, setSummary] = useState<Summary | null>(null);
    const [alert, setAlert] = useState<{ alert: boolean; message: string } | null>(null);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [incomes, setIncomes] = useState<IncomeResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const onError = useApiError();
    const navigate = useNavigate();

    useEffect(() => {
        (async () => {
            try {
                const [s, e, i] = await Promise.all([getSummary(), getExpenses(), getIncomes()]);
                setSummary(s);
                setExpenses(e);
                setIncomes(i);
                getBudgetAlert().then(setAlert).catch(() => undefined);
            } catch (err) {
                onError(err, "Impossible de charger le tableau de bord");
            } finally {
                setLoading(false);
            }
        })();
    }, [onError]);

    const stats = useMemo(() => {
        const now = new Date();
        const cur = monthlyTotals(expenses, incomes, now.getFullYear(), now.getMonth());
        const prev = monthlyTotals(expenses, incomes, now.getFullYear(), now.getMonth() - 1);
        const totalIncome = incomes.reduce((s, i) => s + i.amount, 0);
        const totalExpense = summary?.totalExpenses ?? expenses.reduce((s, e) => s + e.amount, 0);
        const savingsRate = cur.income > 0 ? Math.max(0, ((cur.income - cur.expense) / cur.income) * 100) : 0;
        return {
            cur,
            balance: totalIncome - totalExpense,
            incomeDelta: percentChange(cur.income, prev.income),
            expenseDelta: percentChange(cur.expense, prev.expense),
            savingsRate,
        };
    }, [expenses, incomes, summary]);

    const series = useMemo(() => cashflowSeries(expenses, incomes, 6), [expenses, incomes]);

    const categories = useMemo(() => {
        const list = [...(summary?.expensesByCategory ?? [])].sort((a, b) => b.total - a.total);
        if (list.length <= 6) return list;
        const rest = list.slice(5).reduce((s, c) => s + c.total, 0);
        return [...list.slice(0, 5), { categoryId: -1, categoryName: "Autres", total: rest }];
    }, [summary]);
    const catTotal = categories.reduce((s, c) => s + c.total, 0);

    const recent = useMemo(() => {
        const rows = [
            ...incomes.map((i) => ({
                key: `i${i.id}`,
                kind: "income" as const,
                title: i.source,
                sub: i.description || "Revenu",
                date: i.date,
                amount: i.amount,
                recurring: false,
            })),
            ...expenses.map((e) => ({
                key: `e${e.id}`,
                kind: "expense" as const,
                title: e.description || e.category?.name || "Dépense",
                sub: e.category?.name ?? "Dépense",
                date: expenseDate(e),
                amount: e.amount,
                recurring: e.type === "RECURRING",
            })),
        ];
        return rows.sort((a, b) => +new Date(b.date) - +new Date(a.date)).slice(0, 6);
    }, [expenses, incomes]);

    if (loading) return <DashboardSkeleton />;

    const lowBalance = stats.balance > 0 && stats.balance <= 50;

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p className="text-sm text-slate-500 capitalize dark:text-slate-400">
                        {new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
                    </p>
                    <h1 className="mt-1 text-2xl font-extrabold text-slate-900 sm:text-3xl dark:text-white">{greeting()} 👋</h1>
                </div>
                <div className="flex gap-2">
                    <Button variant="secondary" icon={<Plus className="size-4" />} onClick={() => navigate("/incomes?new=1")}>
                        Revenu
                    </Button>
                    <Button icon={<Plus className="size-4" />} onClick={() => navigate("/expenses?new=1")}>
                        Dépense
                    </Button>
                </div>
            </div>

            <AnimatePresence>
                {alert?.alert && (
                    <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="flex items-start gap-3 rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-rose-700 dark:text-rose-300"
                    >
                        <AlertTriangle className="mt-0.5 size-5 shrink-0" />
                        <p className="text-sm font-semibold">{alert.message}</p>
                    </motion.div>
                )}
                {lowBalance && (
                    <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-start gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 text-amber-800 dark:text-amber-300"
                    >
                        <Lightbulb className="mt-0.5 size-5 shrink-0" />
                        <div className="text-sm">
                            <p className="font-semibold">Votre solde est faible ({formatCurrency(stats.balance)})</p>
                            <p className="opacity-80">Pensez à limiter vos dépenses ou à ajouter des revenus.</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.div variants={listVariants} initial="hidden" animate="show" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <Kpi
                    highlight
                    label="Solde total"
                    value={stats.balance}
                    format={formatCurrency}
                    icon={<Wallet className="size-4" />}
                    tone="bg-white/15 text-white"
                    footer={<span className="text-xs text-white/70">Tous revenus − toutes dépenses</span>}
                />
                <Kpi
                    label="Revenus du mois"
                    value={stats.cur.income}
                    format={formatCurrency}
                    icon={<ArrowDownLeft className="size-4" />}
                    tone="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    footer={<Delta value={stats.incomeDelta} />}
                />
                <Kpi
                    label="Dépenses du mois"
                    value={stats.cur.expense}
                    format={formatCurrency}
                    icon={<ArrowUpRight className="size-4" />}
                    tone="bg-brand-500/10 text-brand-600 dark:text-brand-400"
                    footer={<Delta value={stats.expenseDelta} invert />}
                />
                <Kpi
                    label="Taux d'épargne"
                    value={stats.savingsRate}
                    format={formatPct}
                    icon={<PiggyBank className="size-4" />}
                    tone="bg-amber-500/10 text-amber-600 dark:text-amber-400"
                    footer={
                        <div className="h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-white/5">
                            <motion.div
                                className="h-full rounded-full bg-gradient-to-r from-amber-400 to-emerald-500"
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(100, stats.savingsRate)}%` }}
                                transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
                            />
                        </div>
                    }
                />
            </motion.div>

            <div className="grid gap-4 lg:grid-cols-3">
                <motion.section
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="card p-5 lg:col-span-2"
                >
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <h2 className="font-bold text-slate-900 dark:text-white">Flux de trésorerie</h2>
                            <p className="text-xs text-slate-400">6 derniers mois</p>
                        </div>
                        <div className="flex gap-4 text-xs font-medium text-slate-500 dark:text-slate-400">
                            <span className="flex items-center gap-1.5">
                                <span className="size-2.5 rounded-full bg-emerald-500" /> Revenus
                            </span>
                            <span className="flex items-center gap-1.5">
                                <span className="size-2.5 rounded-full bg-[#7c6cf2]" /> Dépenses
                            </span>
                        </div>
                    </div>
                    <div className="h-64">
                        <CashflowChart series={series} />
                    </div>
                </motion.section>

                <motion.section
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.22 }}
                    className="card p-5"
                >
                    <h2 className="font-bold text-slate-900 dark:text-white">Par catégorie</h2>
                    <p className="mb-4 text-xs text-slate-400">Répartition de toutes vos dépenses</p>
                    {categories.length === 0 ? (
                        <p className="py-16 text-center text-sm text-slate-400">Aucune dépense pour l'instant</p>
                    ) : (
                        <>
                            <DonutChart data={categories} centerLabel="Total" centerValue={formatCurrency(catTotal)} />
                            <ul className="mt-5 space-y-2.5">
                                {categories.map((c, i) => (
                                    <li key={c.categoryId} className="flex items-center gap-2.5 text-sm">
                                        <span className="size-2.5 shrink-0 rounded-full" style={{ background: CATEGORY_COLORS[i] }} />
                                        <span className="flex-1 truncate text-slate-600 dark:text-slate-300">{c.categoryName}</span>
                                        <span className="text-xs text-slate-400 tabular-nums">
                                            {catTotal ? Math.round((c.total / catTotal) * 100) : 0} %
                                        </span>
                                        <span className="w-24 text-right font-semibold text-slate-900 tabular-nums dark:text-white">
                                            {formatCurrency(c.total)}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </>
                    )}
                </motion.section>
            </div>

            <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card p-5">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="font-bold text-slate-900 dark:text-white">Dernières opérations</h2>
                    <Link to="/expenses" className="text-xs font-semibold text-brand-600 hover:underline dark:text-brand-400">
                        Tout voir
                    </Link>
                </div>
                {recent.length === 0 ? (
                    <p className="py-8 text-center text-sm text-slate-400">Ajoutez un revenu ou une dépense pour commencer.</p>
                ) : (
                    <motion.ul variants={listVariants} initial="hidden" animate="show" className="divide-y divide-slate-100 dark:divide-white/5">
                        {recent.map((r) => (
                            <motion.li key={r.key} variants={itemVariants} className="flex items-center gap-3 py-3">
                                <div
                                    className={`grid size-10 shrink-0 place-items-center rounded-xl ${
                                        r.kind === "income"
                                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                            : "bg-brand-500/10 text-brand-600 dark:text-brand-400"
                                    }`}
                                >
                                    {r.kind === "income" ? <ArrowDownLeft className="size-4" /> : <ArrowUpRight className="size-4" />}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">{r.title}</p>
                                    <p className="flex items-center gap-1.5 text-xs text-slate-400">
                                        {r.recurring && <Repeat className="size-3" />}
                                        {r.sub} · {formatDate(r.date)}
                                    </p>
                                </div>
                                <span
                                    className={`text-sm font-bold tabular-nums ${
                                        r.kind === "income" ? "text-emerald-600 dark:text-emerald-400" : "text-slate-900 dark:text-white"
                                    }`}
                                >
                                    {r.kind === "income" ? "+" : "−"} {formatCurrency(r.amount)}
                                </span>
                            </motion.li>
                        ))}
                    </motion.ul>
                )}
            </motion.section>
        </div>
    );
};

export default Dashboard;
