import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import {
    AlertTriangle,
    ArrowDownLeft,
    ArrowUpRight,
    Plus,
    Repeat,
    TrendingDown,
    TrendingUp,
} from "lucide-react";
import { getBudgetAlert, getSummary } from "../../services/summaryService";
import { getExpenses, type Expense } from "../../services/expenseService";
import { getIncomes, type IncomeResponse } from "../../services/incomeService";
import { formatCurrency } from "../../utils/formatCurrency";
import { formatDate } from "../../utils/formatDate";
import { cashflowSeries, expenseDate, monthlyTotals, percentChange } from "../../utils/finance";
import { CashflowChart, DonutChart } from "../../components/charts/Chart";
import { categoryColor } from "../../utils/colors";
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
    if (value === null) return <span className="text-xs text-slate-400">Pas de données le mois dernier</span>;
    const up = value >= 0;
    const good = invert ? !up : up;
    const Icon = up ? TrendingUp : TrendingDown;
    return (
        <span className={`inline-flex items-center gap-1 text-xs ${good ? "text-teal-700 dark:text-teal-400" : "text-red-600 dark:text-red-400"}`}>
            <Icon className="size-3" />
            {up ? "+" : ""}
            {value.toFixed(0)} % <span className="text-slate-400">vs mois dernier</span>
        </span>
    );
};

interface KpiProps {
    label: string;
    value: number;
    format: (n: number) => string;
    footer: ReactNode;
    valueClass?: string;
}

const Kpi = ({ label, value, format, footer, valueClass = "text-slate-900 dark:text-white" }: KpiProps) => (
    <motion.div variants={itemVariants} className="card p-4">
        <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
        <AnimatedNumber value={value} format={format} className={`mt-1.5 block text-2xl font-semibold tracking-tight ${valueClass}`} />
        <div className="mt-2">{footer}</div>
    </motion.div>
);

const DashboardSkeleton = () => (
    <div className="space-y-6">
        <Skeleton className="h-9 w-64" />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-36 rounded-xl" />
            ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
            <Skeleton className="h-80 rounded-xl lg:col-span-2" />
            <Skeleton className="h-80 rounded-xl" />
        </div>
    </div>
);

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
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-xl font-semibold text-slate-900 dark:text-white">Vue d'ensemble</h1>
                    <p className="mt-0.5 text-sm text-slate-500 first-letter:uppercase dark:text-slate-400">
                        {new Date().toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}
                    </p>
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
                        className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-800 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300"
                    >
                        <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                        <p className="text-sm">{alert.message}</p>
                    </motion.div>
                )}
                {lowBalance && (
                    <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300"
                    >
                        <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                        <div className="text-sm">
                            <p className="font-medium">Solde bas : {formatCurrency(stats.balance)}</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.div variants={listVariants} initial="hidden" animate="show" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <Kpi
                    label="Solde"
                    value={stats.balance}
                    format={formatCurrency}
                    valueClass={stats.balance < 0 ? "text-red-600 dark:text-red-400" : "text-slate-900 dark:text-white"}
                    footer={<span className="text-xs text-slate-400">Depuis la création du compte</span>}
                />
                <Kpi label="Revenus ce mois" value={stats.cur.income} format={formatCurrency} footer={<Delta value={stats.incomeDelta} />} />
                <Kpi label="Dépenses ce mois" value={stats.cur.expense} format={formatCurrency} footer={<Delta value={stats.expenseDelta} invert />} />
                <Kpi
                    label="Épargne ce mois"
                    value={stats.savingsRate}
                    format={formatPct}
                    footer={
                        <div className="mt-1 h-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                            <motion.div
                                className="h-full rounded-full bg-teal-600"
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(100, stats.savingsRate)}%` }}
                                transition={{ duration: 0.6, ease: "easeOut" }}
                            />
                        </div>
                    }
                />
            </motion.div>

            <div className="grid gap-4 lg:grid-cols-3">
                <motion.section
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="card flex flex-col p-4 lg:col-span-2"
                >
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Revenus et dépenses</h2>
                            <p className="text-xs text-slate-400">6 derniers mois</p>
                        </div>
                        <div className="flex gap-4 text-xs font-medium text-slate-500 dark:text-slate-400">
                            <span className="flex items-center gap-1.5">
                                <span className="size-2 rounded-sm bg-[#2a9d8f]" /> Revenus
                            </span>
                            <span className="flex items-center gap-1.5">
                                <span className="size-2 rounded-sm bg-slate-300 dark:bg-slate-600" /> Dépenses
                            </span>
                        </div>
                    </div>
                    <div className="min-h-64 flex-1">
                        <CashflowChart series={series} />
                    </div>
                </motion.section>

                <motion.section
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="card p-4"
                >
                    <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Dépenses par catégorie</h2>
                    <p className="mb-4 text-xs text-slate-400">Depuis le début</p>
                    {categories.length === 0 ? (
                        <p className="py-16 text-center text-sm text-slate-400">Pas encore de dépenses.</p>
                    ) : (
                        <>
                            <DonutChart data={categories} centerLabel="Total" centerValue={formatCurrency(catTotal)} />
                            <ul className="mt-5 space-y-2.5">
                                {categories.map((c) => (
                                    <li key={c.categoryId} className="flex items-center gap-2.5 text-sm">
                                        <span className="size-2 shrink-0 rounded-sm" style={{ background: categoryColor(c.categoryId) }} />
                                        <span className="flex-1 truncate text-slate-600 dark:text-slate-300">{c.categoryName}</span>
                                        <span className="text-xs text-slate-400 tabular-nums">
                                            {catTotal ? Math.round((c.total / catTotal) * 100) : 0} %
                                        </span>
                                        <span className="w-24 text-right text-slate-900 tabular-nums dark:text-white">
                                            {formatCurrency(c.total)}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </>
                    )}
                </motion.section>
            </div>

            <motion.section initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }} className="card p-4">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Dernières opérations</h2>
                    <Link to="/expenses" className="text-xs text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
                        Voir les dépenses
                    </Link>
                </div>
                {recent.length === 0 ? (
                    <p className="py-8 text-center text-sm text-slate-400">Aucune opération.</p>
                ) : (
                    <motion.ul variants={listVariants} initial="hidden" animate="show" className="divide-y divide-slate-100 dark:divide-white/5">
                        {recent.map((r) => (
                            <motion.li key={r.key} variants={itemVariants} className="flex items-center gap-3 py-3">
                                <div
                                    className={`grid size-8 shrink-0 place-items-center rounded-md ${
                                        r.kind === "income"
                                            ? "bg-teal-50 text-teal-700 dark:bg-teal-950/50 dark:text-teal-400"
                                            : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                                    }`}
                                >
                                    {r.kind === "income" ? <ArrowDownLeft className="size-4" /> : <ArrowUpRight className="size-4" />}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm text-slate-800 dark:text-slate-100">{r.title}</p>
                                    <p className="flex items-center gap-1.5 text-xs text-slate-400">
                                        {r.recurring && <Repeat className="size-3" />}
                                        {r.sub} · {formatDate(r.date)}
                                    </p>
                                </div>
                                <span
                                    className={`text-sm font-medium tabular-nums ${
                                        r.kind === "income" ? "text-teal-600 dark:text-teal-400" : "text-slate-900 dark:text-white"
                                    }`}
                                >
                                    {r.kind === "income" ? "+" : "−"}{formatCurrency(r.amount)}
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
