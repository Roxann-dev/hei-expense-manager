import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { FileDown, HandCoins, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import { deleteIncome, getIncomes, type IncomeResponse } from "../../services/incomeService";
import { formatCurrency } from "../../utils/formatCurrency";
import { formatDate } from "../../utils/formatDate";
import { exportCsv } from "../../utils/exportCsv";
import { useApiError } from "../../hooks/useApiError";
import IncomeForm from "../../components/forms/IncomeForm";
import Modal from "../../components/ui/Modal";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import Button from "../../components/ui/Button";
import AnimatedNumber from "../../components/ui/AnimatedNumber";
import { ListSkeleton } from "../../components/ui/Loader";
import { EmptyState, PageHeader } from "../../components/ui/PageHeader";
import { itemVariants, listVariants } from "../../utils/motion";

type Sort = "date-desc" | "date-asc" | "amount-desc" | "amount-asc";

const Incomes: React.FC = () => {
    const [incomes, setIncomes] = useState<IncomeResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [formOpen, setFormOpen] = useState(false);
    const [editing, setEditing] = useState<IncomeResponse | null>(null);
    const [toDelete, setToDelete] = useState<IncomeResponse | null>(null);
    const [query, setQuery] = useState("");
    const [sort, setSort] = useState<Sort>("date-desc");
    const [params, setParams] = useSearchParams();
    const onError = useApiError();

    const load = useCallback(async () => {
        try {
            setIncomes(await getIncomes());
        } catch (err) {
            onError(err, "Impossible de charger les revenus");
        } finally {
            setLoading(false);
        }
    }, [onError]);

    useEffect(() => {
        load();
    }, [load]);

    useEffect(() => {
        if (params.get("new")) {
            setEditing(null);
            setFormOpen(true);
            params.delete("new");
            setParams(params, { replace: true });
        }
    }, [params, setParams]);

    const visible = useMemo(() => {
        const q = query.trim().toLowerCase();
        const list = incomes.filter(
            (i) => !q || i.source.toLowerCase().includes(q) || (i.description ?? "").toLowerCase().includes(q)
        );
        const [key, dir] = sort.split("-") as ["date" | "amount", "asc" | "desc"];
        const sign = dir === "asc" ? 1 : -1;
        return list.sort((a, b) => (key === "amount" ? a.amount - b.amount : +new Date(a.date) - +new Date(b.date)) * sign);
    }, [incomes, query, sort]);

    const stats = useMemo(() => {
        const now = new Date();
        const thisMonth = incomes
            .filter((i) => {
                const d = new Date(i.date);
                return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
            })
            .reduce((s, i) => s + i.amount, 0);
        const total = incomes.reduce((s, i) => s + i.amount, 0);
        const bySource = new Map<string, number>();
        incomes.forEach((i) => bySource.set(i.source, (bySource.get(i.source) ?? 0) + i.amount));
        const top = [...bySource.entries()].sort((a, b) => b[1] - a[1])[0];
        return { thisMonth, total, top, sources: [...bySource.keys()] };
    }, [incomes]);

    const openNew = () => {
        setEditing(null);
        setFormOpen(true);
    };

    const handleDelete = async () => {
        if (!toDelete) return;
        try {
            await deleteIncome(toDelete.id);
            setIncomes((l) => l.filter((i) => i.id !== toDelete.id));
            toast.success("Revenu supprimé");
        } catch (err) {
            onError(err, "Suppression impossible");
        }
    };

    const handleExport = () =>
        exportCsv(
            `revenus-${new Date().toISOString().slice(0, 10)}.csv`,
            ["Date", "Source", "Description", "Montant (€)"],
            visible.map((i) => [i.date.slice(0, 10), i.source, i.description ?? "", i.amount.toFixed(2).replace(".", ",")])
        );

    return (
        <div>
            <PageHeader
                title="Revenus"
                
                actions={
                    <>
                        <Button variant="secondary" icon={<FileDown className="size-4" />} onClick={handleExport} disabled={!visible.length}>
                            Exporter
                        </Button>
                        <Button icon={<Plus className="size-4" />} onClick={openNew}>
                            Nouveau revenu
                        </Button>
                    </>
                }
            />

            {!loading && incomes.length > 0 && (
                <motion.div variants={listVariants} initial="hidden" animate="show" className="mb-6 grid gap-3 sm:grid-cols-3">
                    <motion.div variants={itemVariants} className="card p-4">
                        <p className="text-sm text-slate-500 dark:text-slate-400">Ce mois-ci</p>
                        <AnimatedNumber
                            value={stats.thisMonth}
                            format={formatCurrency}
                            className="mt-1 block text-xl font-semibold text-slate-900 dark:text-white"
                        />
                    </motion.div>
                    <motion.div variants={itemVariants} className="card p-4">
                        <p className="text-sm text-slate-500 dark:text-slate-400">Total</p>
                        <AnimatedNumber value={stats.total} format={formatCurrency} className="mt-1 block text-xl font-semibold text-slate-900 dark:text-white" />
                    </motion.div>
                    <motion.div variants={itemVariants} className="card p-4">
                        <p className="text-sm text-slate-500 dark:text-slate-400">Source principale</p>
                        <p className="mt-1 truncate text-xl font-semibold text-slate-900 dark:text-white">{stats.top?.[0] ?? "—"}</p>
                    </motion.div>
                </motion.div>
            )}

            <div className="mb-4 flex flex-col gap-2 sm:flex-row">
                <div className="relative flex-1">
                    <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-slate-400" />
                    <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Rechercher"
                        className="field pl-10"
                        aria-label="Rechercher"
                    />
                </div>
                <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} className="field cursor-pointer sm:w-44" aria-label="Trier">
                    <option value="date-desc">Plus récents</option>
                    <option value="date-asc">Plus anciens</option>
                    <option value="amount-desc">Montant ↓</option>
                    <option value="amount-asc">Montant ↑</option>
                </select>
            </div>

            {loading ? (
                <ListSkeleton rows={4} />
            ) : incomes.length === 0 ? (
                <EmptyState
                    icon={<HandCoins className="size-6" />}
                    title="Aucun revenu"
                    text="Les revenus que vous ajoutez apparaîtront ici."
                    action={
                        <Button icon={<Plus className="size-4" />} onClick={openNew}>
                            Ajouter un revenu
                        </Button>
                    }
                />
            ) : visible.length === 0 ? (
                <EmptyState icon={<Search className="size-6" />} title="Aucun résultat" text="Aucun revenu ne correspond à votre recherche." />
            ) : (
                <motion.ul variants={listVariants} initial="hidden" animate="show" className="card divide-y divide-slate-100 overflow-hidden dark:divide-slate-800">
                    <AnimatePresence initial={false}>
                        {visible.map((i) => (
                            <motion.li
                                key={i.id}
                                layout
                                variants={itemVariants}
                                exit="exit"
                                className="group flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-white/[0.02]"
                            >
                                                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">{i.source}</p>
                                    <p className="mt-0.5 truncate text-xs text-slate-400">
                                        {formatDate(i.date)}
                                        {i.description ? ` · ${i.description}` : ""}
                                    </p>
                                </div>
                                <span className="text-sm font-medium text-teal-700 tabular-nums dark:text-teal-400">
                                    +{formatCurrency(i.amount)}
                                </span>
                                <div className="flex items-center opacity-100 transition-opacity md:opacity-0 md:group-focus-within:opacity-100 md:group-hover:opacity-100">
                                    <button
                                        onClick={() => {
                                            setEditing(i);
                                            setFormOpen(true);
                                        }}
                                        aria-label="Modifier"
                                        title="Modifier"
                                        className="grid size-9 cursor-pointer place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/10 dark:hover:text-white"
                                    >
                                        <Pencil className="size-4" />
                                    </button>
                                    <button
                                        onClick={() => setToDelete(i)}
                                        aria-label="Supprimer"
                                        title="Supprimer"
                                        className="grid size-9 cursor-pointer place-items-center rounded-lg text-slate-400 transition hover:bg-red-500/10 hover:text-red-500"
                                    >
                                        <Trash2 className="size-4" />
                                    </button>
                                </div>
                            </motion.li>
                        ))}
                    </AnimatePresence>
                </motion.ul>
            )}

            <Modal open={formOpen} onClose={() => setFormOpen(false)} title={editing ? "Modifier le revenu" : "Nouveau revenu"}>
                <IncomeForm
                    key={editing?.id ?? "new"}
                    initialData={editing}
                    suggestions={stats.sources}
                    onCancel={() => setFormOpen(false)}
                    onSuccess={() => {
                        setFormOpen(false);
                        load();
                    }}
                />
            </Modal>

            <ConfirmDialog
                open={!!toDelete}
                title="Supprimer ce revenu ?"
                message={toDelete ? `« ${toDelete.source} » de ${formatCurrency(toDelete.amount)} sera définitivement supprimé.` : ""}
                onConfirm={handleDelete}
                onClose={() => setToDelete(null)}
            />
        </div>
    );
};

export default Incomes;
