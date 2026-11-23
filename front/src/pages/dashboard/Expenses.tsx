import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { Download, Eye, FileDown, Pencil, Plus, Receipt, Repeat, Search, Trash2, X } from "lucide-react";
import { toast } from "react-toastify";
import { deleteExpense, getExpenses, type Expense } from "../../services/expenseService";
import { getCategories } from "../../services/ccategoryService";
import { downloadReceipt, getReceiptViewUrl } from "../../services/receiptService";
import { formatCurrency } from "../../utils/formatCurrency";
import { formatDate } from "../../utils/formatDate";
import { expenseDate } from "../../utils/finance";
import { exportCsv } from "../../utils/exportCsv";
import { useApiError } from "../../hooks/useApiError";
import ExpenseForm from "../../components/forms/ExpenseForm";
import Modal from "../../components/ui/Modal";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import Button from "../../components/ui/Button";
import { ListSkeleton } from "../../components/ui/Loader";
import { EmptyState, PageHeader } from "../../components/ui/PageHeader";
import { itemVariants, listVariants } from "../../utils/motion";
import { categoryColor } from "../../utils/colors";

type TypeFilter = "ALL" | "ONE_TIME" | "RECURRING";
type Sort = "date-desc" | "date-asc" | "amount-desc" | "amount-asc";

const IconBtn = ({ label, onClick, children, danger }: { label: string; onClick: () => void; children: React.ReactNode; danger?: boolean }) => (
    <button
        onClick={onClick}
        aria-label={label}
        title={label}
        className={`grid size-9 cursor-pointer place-items-center rounded-lg text-slate-400 transition ${
            danger ? "hover:bg-red-500/10 hover:text-red-500" : "hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/10 dark:hover:text-white"
        }`}
    >
        {children}
    </button>
);

const Expenses: React.FC = () => {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
    const [loading, setLoading] = useState(true);
    const [formOpen, setFormOpen] = useState(false);
    const [editing, setEditing] = useState<Expense | null>(null);
    const [toDelete, setToDelete] = useState<Expense | null>(null);
    const [query, setQuery] = useState("");
    const [catFilter, setCatFilter] = useState("ALL");
    const [typeFilter, setTypeFilter] = useState<TypeFilter>("ALL");
    const [sort, setSort] = useState<Sort>("date-desc");
    const [params, setParams] = useSearchParams();
    const onError = useApiError();

    const load = useCallback(async () => {
        try {
            const [e, c] = await Promise.all([getExpenses(), getCategories()]);
            setExpenses(e);
            setCategories(c);
        } catch (err) {
            onError(err, "Impossible de charger les dépenses");
        } finally {
            setLoading(false);
        }
    }, [onError]);

    useEffect(() => {
        load();
    }, [load]);

    // Ouverture directe du formulaire depuis le tableau de bord (?new=1)
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
        const list = expenses.filter(
            (e) =>
                (catFilter === "ALL" || String(e.categoryId) === catFilter) &&
                (typeFilter === "ALL" || e.type === typeFilter) &&
                (!q || (e.description ?? "").toLowerCase().includes(q) || (e.category?.name ?? "").toLowerCase().includes(q))
        );
        const [key, dir] = sort.split("-") as ["date" | "amount", "asc" | "desc"];
        const sign = dir === "asc" ? 1 : -1;
        return list.sort((a, b) =>
            key === "amount" ? (a.amount - b.amount) * sign : (+new Date(expenseDate(a)) - +new Date(expenseDate(b))) * sign
        );
    }, [expenses, query, catFilter, typeFilter, sort]);

    const total = visible.reduce((s, e) => s + e.amount, 0);
    const filtered = query || catFilter !== "ALL" || typeFilter !== "ALL";

    const openNew = () => {
        setEditing(null);
        setFormOpen(true);
    };

    const handleDelete = async () => {
        if (!toDelete?.id) return;
        try {
            await deleteExpense(toDelete.id);
            setExpenses((list) => list.filter((e) => e.id !== toDelete.id));
            toast.success("Dépense supprimée");
        } catch (err) {
            onError(err, "Suppression impossible");
        }
    };

    const handleExport = () => {
        exportCsv(
            `depenses-${new Date().toISOString().slice(0, 10)}.csv`,
            ["Date", "Type", "Catégorie", "Description", "Montant (€)", "Fin"],
            visible.map((e) => [
                expenseDate(e).slice(0, 10),
                e.type === "ONE_TIME" ? "Ponctuelle" : "Récurrente",
                e.category?.name ?? "",
                e.description ?? "",
                e.amount.toFixed(2).replace(".", ","),
                e.endDate?.slice(0, 10) ?? "",
            ])
        );
    };

    const openReceipt = (id: number) => {
        try {
            window.open(getReceiptViewUrl(id), "_blank", "noopener");
        } catch (err) {
            onError(err);
        }
    };

    return (
        <div>
            <PageHeader
                title="Dépenses"
                
                actions={
                    <>
                        <Button variant="secondary" icon={<FileDown className="size-4" />} onClick={handleExport} disabled={!visible.length}>
                            Exporter
                        </Button>
                        <Button icon={<Plus className="size-4" />} onClick={openNew}>
                            Nouvelle dépense
                        </Button>
                    </>
                }
            />

            <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center">
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
                <div className="grid grid-cols-3 gap-2 md:flex">
                    <select value={catFilter} onChange={(e) => setCatFilter(e.target.value)} className="field cursor-pointer md:w-44" aria-label="Catégorie">
                        <option value="ALL">Catégorie</option>
                        {categories.map((c) => (
                            <option key={c.id} value={c.id}>
                                {c.name}
                            </option>
                        ))}
                    </select>
                    <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as TypeFilter)} className="field cursor-pointer md:w-36" aria-label="Type">
                        <option value="ALL">Type</option>
                        <option value="ONE_TIME">Ponctuelles</option>
                        <option value="RECURRING">Récurrentes</option>
                    </select>
                    <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} className="field cursor-pointer md:w-40" aria-label="Trier">
                        <option value="date-desc">Plus récentes</option>
                        <option value="date-asc">Plus anciennes</option>
                        <option value="amount-desc">Montant ↓</option>
                        <option value="amount-asc">Montant ↑</option>
                    </select>
                </div>
            </div>

            {!loading && expenses.length > 0 && (
                <div className="mb-4 flex items-center justify-between px-1 text-sm">
                    <span className="text-slate-500 dark:text-slate-400">
                        {visible.length} dépense{visible.length > 1 ? "s" : ""}
                        {filtered && (
                            <button
                                onClick={() => {
                                    setQuery("");
                                    setCatFilter("ALL");
                                    setTypeFilter("ALL");
                                }}
                                className="ml-2 inline-flex cursor-pointer items-center gap-1 text-slate-900 underline underline-offset-4 dark:text-white"
                            >
                                <X className="size-3" /> Effacer les filtres
                            </button>
                        )}
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                        Total : <span className="tabular-nums">{formatCurrency(total)}</span>
                    </span>
                </div>
            )}

            {loading ? (
                <ListSkeleton rows={5} />
            ) : expenses.length === 0 ? (
                <EmptyState
                    icon={<Receipt className="size-6" />}
                    title="Aucune dépense"
                    text="Les dépenses que vous ajoutez apparaîtront ici."
                    action={
                        <Button icon={<Plus className="size-4" />} onClick={openNew}>
                            Ajouter une dépense
                        </Button>
                    }
                />
            ) : visible.length === 0 ? (
                <EmptyState icon={<Search className="size-6" />} title="Aucun résultat" text="Aucune dépense ne correspond à ces filtres." />
            ) : (
                <motion.ul variants={listVariants} initial="hidden" animate="show" className="card divide-y divide-slate-100 overflow-hidden dark:divide-slate-800">
                    <AnimatePresence initial={false}>
                        {visible.map((e) => {
                            const color = categoryColor(e.categoryId);
                            return (
                                <motion.li
                                    key={e.id}
                                    layout
                                    variants={itemVariants}
                                    exit="exit"
                                    className="group flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-white/[0.02]"
                                >
                                    <div
                                        className="h-8 w-1 shrink-0 rounded-full"
                                        style={{ background: color }}
                                    />
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">
                                            {e.description || e.category?.name || "Dépense"}
                                        </p>
                                        <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-400">
                                            <span>{e.category?.name}</span>
                                            <span>·</span>
                                            {e.type === "RECURRING" ? (
                                                <span className="inline-flex items-center gap-1">
                                                    <Repeat className="size-3" />
                                                    Depuis le {formatDate(e.startDate)}
                                                    {e.endDate ? ` jusqu'au ${formatDate(e.endDate)}` : " · sans fin"}
                                                </span>
                                            ) : (
                                                <span>{formatDate(e.date)}</span>
                                            )}
                                            {e.receiptPath && (
                                                <span className="inline-flex items-center gap-1" title="Reçu joint">
                                                    <Receipt className="size-3" /> reçu
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <span className="text-sm font-medium text-slate-900 tabular-nums dark:text-white">
                                        −{formatCurrency(e.amount)}
                                    </span>
                                    <div className="flex items-center opacity-100 transition-opacity md:opacity-0 md:group-focus-within:opacity-100 md:group-hover:opacity-100">
                                        {e.receiptPath && e.id && (
                                            <>
                                                <IconBtn label="Voir le reçu" onClick={() => openReceipt(e.id!)}>
                                                    <Eye className="size-4" />
                                                </IconBtn>
                                                <IconBtn label="Télécharger le reçu" onClick={() => downloadReceipt(e.id!).catch((err) => onError(err))}>
                                                    <Download className="size-4" />
                                                </IconBtn>
                                            </>
                                        )}
                                        <IconBtn
                                            label="Modifier"
                                            onClick={() => {
                                                setEditing(e);
                                                setFormOpen(true);
                                            }}
                                        >
                                            <Pencil className="size-4" />
                                        </IconBtn>
                                        <IconBtn label="Supprimer" danger onClick={() => setToDelete(e)}>
                                            <Trash2 className="size-4" />
                                        </IconBtn>
                                    </div>
                                </motion.li>
                            );
                        })}
                    </AnimatePresence>
                </motion.ul>
            )}

            <Modal
                open={formOpen}
                onClose={() => setFormOpen(false)}
                title={editing ? "Modifier la dépense" : "Nouvelle dépense"}
                            >
                <ExpenseForm
                    key={editing?.id ?? "new"}
                    initialData={editing}
                    categories={categories}
                    onCancel={() => setFormOpen(false)}
                    onSuccess={() => {
                        setFormOpen(false);
                        load();
                    }}
                />
            </Modal>

            <ConfirmDialog
                open={!!toDelete}
                title="Supprimer cette dépense ?"
                message={
                    toDelete
                        ? `« ${toDelete.description || toDelete.category?.name || "Dépense"} » de ${formatCurrency(toDelete.amount)} sera définitivement supprimée.`
                        : ""
                }
                onConfirm={handleDelete}
                onClose={() => setToDelete(null)}
            />
        </div>
    );
};

export default Expenses;
