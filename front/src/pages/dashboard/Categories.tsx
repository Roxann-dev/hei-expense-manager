import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Lock, Pencil, Plus, Shapes, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import { deleteCategory, getCategories } from "../../services/ccategoryService.ts";
import { getExpenses, type Expense } from "../../services/expenseService";
import { formatCurrency } from "../../utils/formatCurrency";
import { useApiError } from "../../hooks/useApiError";
import CategoryForm from "../../components/forms/CategoryForm";
import Modal from "../../components/ui/Modal";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import Button from "../../components/ui/Button";
import { Skeleton } from "../../components/ui/Loader";
import { EmptyState, PageHeader } from "../../components/ui/PageHeader";
import { itemVariants, listVariants } from "../../utils/motion";
import { categoryColor } from "../../utils/colors";

interface Category {
    id: number;
    name: string;
    userId: number | null;
    isDefault: boolean;
    createdAt: string;
}

const Categories: React.FC = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(true);
    const [formOpen, setFormOpen] = useState(false);
    const [editing, setEditing] = useState<Category | null>(null);
    const [toDelete, setToDelete] = useState<Category | null>(null);
    const onError = useApiError();

    const load = useCallback(async () => {
        try {
            const [c, e] = await Promise.all([getCategories(), getExpenses()]);
            setCategories(c);
            setExpenses(e);
        } catch (err) {
            onError(err, "Impossible de charger les catégories");
        } finally {
            setLoading(false);
        }
    }, [onError]);

    useEffect(() => {
        load();
    }, [load]);

    const usage = useMemo(() => {
        const map = new Map<number, { total: number; count: number }>();
        expenses.forEach((e) => {
            const u = map.get(e.categoryId) ?? { total: 0, count: 0 };
            u.total += e.amount;
            u.count += 1;
            map.set(e.categoryId, u);
        });
        const max = Math.max(1, ...[...map.values()].map((u) => u.total));
        return { get: (id: number) => map.get(id) ?? { total: 0, count: 0 }, max };
    }, [expenses]);

    const handleDelete = async () => {
        if (!toDelete) return;
        try {
            await deleteCategory(toDelete.id);
            setCategories((l) => l.filter((c) => c.id !== toDelete.id));
            toast.success("Catégorie supprimée");
        } catch (err) {
            onError(err, "Suppression impossible");
        }
    };

    const openNew = () => {
        setEditing(null);
        setFormOpen(true);
    };

    return (
        <div>
            <PageHeader
                title="Catégories"
                subtitle="Les catégories par défaut ne peuvent pas être modifiées."
                actions={
                    <Button icon={<Plus className="size-4" />} onClick={openNew}>
                        Nouvelle catégorie
                    </Button>
                }
            />

            {loading ? (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <Skeleton key={i} className="h-36 rounded-xl" />
                    ))}
                </div>
            ) : categories.length === 0 ? (
                <EmptyState
                    icon={<Shapes className="size-6" />}
                    title="Aucune catégorie"
                    text="Créez une catégorie pour classer vos dépenses."
                    action={
                        <Button icon={<Plus className="size-4" />} onClick={openNew}>
                            Créer une catégorie
                        </Button>
                    }
                />
            ) : (
                <motion.ul variants={listVariants} initial="hidden" animate="show" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    <AnimatePresence initial={false}>
                        {categories.map((c) => {
                            const color = categoryColor(c.id);
                            const u = usage.get(c.id);
                            return (
                                <motion.li
                                    key={c.id}
                                    layout
                                    variants={itemVariants}
                                    exit={{ opacity: 0 }}
                                    className="card group p-4"
                                >
                                    <div className="flex items-center justify-between">
                                        <div
                                            className="flex items-center gap-2"
                                        >
                                            <span className="size-2.5 rounded-sm" style={{ background: color }} />
                                            <h3 className="truncate text-sm font-medium text-slate-900 dark:text-white">{c.name}</h3>
                                        </div>
                                        {c.isDefault ? (
                                            <span className="inline-flex items-center gap-1 text-xs text-slate-400" title="Catégorie par défaut, non modifiable">
                                                <Lock className="size-3" /> Défaut
                                            </span>
                                        ) : (
                                            <div className="flex opacity-100 transition-opacity md:opacity-0 md:group-focus-within:opacity-100 md:group-hover:opacity-100">
                                                <button
                                                    onClick={() => {
                                                        setEditing(c);
                                                        setFormOpen(true);
                                                    }}
                                                    aria-label={`Renommer ${c.name}`}
                                                    className="grid size-8 cursor-pointer place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/10 dark:hover:text-white"
                                                >
                                                    <Pencil className="size-4" />
                                                </button>
                                                <button
                                                    onClick={() => setToDelete(c)}
                                                    aria-label={`Supprimer ${c.name}`}
                                                    className="grid size-8 cursor-pointer place-items-center rounded-lg text-slate-400 hover:bg-red-500/10 hover:text-red-500"
                                                >
                                                    <Trash2 className="size-4" />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                    <p className="mt-3 text-lg font-semibold text-slate-900 tabular-nums dark:text-white">{formatCurrency(u.total)}</p>
                                    <p className="text-xs text-slate-400">
                                        {u.count} dépense{u.count > 1 ? "s" : ""}
                                    </p>
                                    <div className="mt-3 h-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                                        <motion.div
                                            className="h-full rounded-full"
                                            style={{ background: color }}
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(u.total / usage.max) * 100}%` }}
                                            transition={{ duration: 0.5, ease: "easeOut" }}
                                        />
                                    </div>
                                </motion.li>
                            );
                        })}
                    </AnimatePresence>
                </motion.ul>
            )}

            <Modal open={formOpen} onClose={() => setFormOpen(false)} title={editing ? "Renommer la catégorie" : "Nouvelle catégorie"} size="sm">
                <CategoryForm
                    key={editing?.id ?? "new"}
                    category={editing}
                    onCancel={() => setFormOpen(false)}
                    onSubmit={() => {
                        setFormOpen(false);
                        load();
                    }}
                />
            </Modal>

            <ConfirmDialog
                open={!!toDelete}
                title="Supprimer cette catégorie ?"
                message={
                    toDelete && usage.get(toDelete.id).count > 0
                        ? `« ${toDelete.name} » contient ${usage.get(toDelete.id).count} dépense(s). Le serveur refusera la suppression tant qu'elles existent.`
                        : `« ${toDelete?.name ?? ""} » sera définitivement supprimée.`
                }
                onConfirm={handleDelete}
                onClose={() => setToDelete(null)}
            />
        </div>
    );
};

export default Categories;
