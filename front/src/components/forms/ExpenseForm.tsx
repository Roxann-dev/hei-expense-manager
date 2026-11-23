import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { FileUp, Paperclip, X } from "lucide-react";
import { toast } from "react-toastify";
import { createExpense, updateExpense } from "../../services/expenseService";
import type { CreateExpenseDTO, Expense, ExpenseTypeUI } from "../../services/expenseService";
import { uploadReceipt } from "../../services/receiptService";
import { toInputDate, todayInput } from "../../utils/formatDate";
import { errorMessage } from "../../hooks/useApiError";
import Button from "../ui/Button";
import Field from "../ui/Input";

type ExpenseFormProps = {
    onSuccess?: () => void;
    onCancel?: () => void;
    initialData?: Expense | null;
    categories: { id: number; name: string }[];
};

const MAX_SIZE = 5 * 1024 * 1024;

/** Sélecteur à deux options avec une pastille qui glisse. */
const Segmented = ({ value, onChange }: { value: ExpenseTypeUI; onChange: (v: ExpenseTypeUI) => void }) => (
    <div className="grid grid-cols-2 rounded-xl bg-slate-100 p-1 dark:bg-white/5">
        {(["One-time", "Recurring"] as const).map((opt) => (
            <button
                key={opt}
                type="button"
                onClick={() => onChange(opt)}
                className={`relative cursor-pointer rounded-lg py-2 text-sm font-semibold transition-colors ${
                    value === opt ? "text-slate-900 dark:text-white" : "text-slate-500 hover:text-slate-700 dark:text-slate-400"
                }`}
            >
                {value === opt && (
                    <motion.span
                        layoutId="expense-type-pill"
                        className="absolute inset-0 rounded-lg bg-white shadow-sm dark:bg-slate-700"
                        transition={{ type: "spring", stiffness: 500, damping: 36 }}
                    />
                )}
                <span className="relative">{opt === "One-time" ? "Ponctuelle" : "Récurrente"}</span>
            </button>
        ))}
    </div>
);

const ExpenseForm: React.FC<ExpenseFormProps> = ({ onSuccess, onCancel, initialData, categories }) => {
    const isEdit = !!initialData?.id;
    const [amount, setAmount] = useState<string>(initialData ? String(initialData.amount) : "");
    const [type, setType] = useState<ExpenseTypeUI>(initialData?.type === "RECURRING" ? "Recurring" : "One-time");
    const [date, setDate] = useState(toInputDate(initialData?.date) || todayInput());
    const [startDate, setStartDate] = useState(toInputDate(initialData?.startDate) || todayInput());
    const [endDate, setEndDate] = useState(toInputDate(initialData?.endDate));
    const [categoryId, setCategoryId] = useState(initialData?.categoryId ? String(initialData.categoryId) : "");
    const [description, setDescription] = useState(initialData?.description || "");
    const [receiptFile, setReceiptFile] = useState<File | null>(null);
    const [dragging, setDragging] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!categoryId && categories.length === 1) setCategoryId(String(categories[0].id));
    }, [categories, categoryId]);

    const pickFile = (f: File | undefined | null) => {
        if (!f) return;
        if (!/\.(jpe?g|png|pdf)$/i.test(f.name)) return toast.error("Format accepté : JPG, PNG ou PDF");
        if (f.size > MAX_SIZE) return toast.error("Fichier trop lourd (5 Mo maximum)");
        setReceiptFile(f);
    };

    const validate = () => {
        const e: Record<string, string> = {};
        const n = parseFloat(amount);
        if (!n || n <= 0) e.amount = "Saisissez un montant positif";
        if (!categoryId) e.categoryId = "Choisissez une catégorie";
        if (type === "One-time" && !date) e.date = "Choisissez une date";
        if (type === "Recurring" && !startDate) e.startDate = "Choisissez une date de début";
        if (type === "Recurring" && endDate && endDate < startDate) e.endDate = "La fin doit être après le début";
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        setLoading(true);

        const data: CreateExpenseDTO = {
            amount: parseFloat(amount),
            type,
            date: type === "One-time" ? date : undefined,
            startDate: type === "Recurring" ? startDate : undefined,
            endDate: type === "Recurring" && endDate ? endDate : undefined,
            categoryId: parseInt(categoryId, 10),
            description,
        };

        try {
            const saved =
                isEdit && initialData?.id
                    ? await updateExpense(initialData.id, { ...data, type: type === "One-time" ? "ONE_TIME" : "RECURRING" })
                    : await createExpense(data);

            if (receiptFile && saved?.id) {
                try {
                    await uploadReceipt(saved.id, receiptFile);
                } catch (err) {
                    toast.warn(`Dépense enregistrée, mais le reçu n'a pas pu être envoyé : ${errorMessage(err)}`);
                }
            }
            toast.success(isEdit ? "Dépense mise à jour" : "Dépense ajoutée");
            onSuccess?.();
        } catch (err) {
            toast.error(errorMessage(err, "Impossible d'enregistrer la dépense"));
        } finally {
            setLoading(false);
        }
    };

    const reveal = {
        initial: { opacity: 0, height: 0 },
        animate: { opacity: 1, height: "auto" },
        exit: { opacity: 0, height: 0 },
        transition: { duration: 0.22 },
    };

    return (
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <Field label="Montant" htmlFor="amount" error={errors.amount}>
                <div className="relative">
                    <input
                        id="amount"
                        type="number"
                        inputMode="decimal"
                        min="0.01"
                        step="0.01"
                        autoFocus
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="field pr-10 font-display text-2xl font-bold"
                        placeholder="0,00"
                    />
                    <span className="pointer-events-none absolute inset-y-0 right-4 grid place-items-center text-lg font-semibold text-slate-400">€</span>
                </div>
            </Field>

            <Field label="Type">
                <Segmented value={type} onChange={setType} />
            </Field>

            <AnimatePresence initial={false} mode="popLayout">
                {type === "One-time" ? (
                    <motion.div key="one" {...reveal} className="overflow-hidden">
                        <Field label="Date" htmlFor="date" error={errors.date}>
                            <input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} className="field" />
                        </Field>
                    </motion.div>
                ) : (
                    <motion.div key="rec" {...reveal} className="grid grid-cols-2 gap-3 overflow-hidden">
                        <Field label="Début" htmlFor="start" error={errors.startDate}>
                            <input id="start" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="field" />
                        </Field>
                        <Field label="Fin (optionnel)" htmlFor="end" error={errors.endDate}>
                            <input id="end" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="field" />
                        </Field>
                    </motion.div>
                )}
            </AnimatePresence>

            <Field label="Catégorie" htmlFor="category" error={errors.categoryId}>
                <select id="category" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="field cursor-pointer">
                    <option value="">Choisir une catégorie…</option>
                    {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                            {c.name}
                        </option>
                    ))}
                </select>
            </Field>

            <Field label="Description" htmlFor="desc">
                <input
                    id="desc"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="field"
                    placeholder="Ex. Courses de la semaine"
                />
            </Field>

            <Field label="Reçu (optionnel)">
                <input
                    ref={fileRef}
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf"
                    className="hidden"
                    onChange={(e) => pickFile(e.target.files?.[0])}
                />
                {receiptFile ? (
                    <div className="flex items-center gap-3 rounded-xl border border-brand-500/30 bg-brand-500/5 px-3.5 py-2.5">
                        <Paperclip className="size-4 text-brand-500" />
                        <span className="flex-1 truncate text-sm font-medium">{receiptFile.name}</span>
                        <button
                            type="button"
                            onClick={() => setReceiptFile(null)}
                            aria-label="Retirer le fichier"
                            className="cursor-pointer rounded-md p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700 dark:hover:bg-white/10"
                        >
                            <X className="size-4" />
                        </button>
                    </div>
                ) : (
                    <button
                        type="button"
                        onClick={() => fileRef.current?.click()}
                        onDragOver={(e) => {
                            e.preventDefault();
                            setDragging(true);
                        }}
                        onDragLeave={() => setDragging(false)}
                        onDrop={(e) => {
                            e.preventDefault();
                            setDragging(false);
                            pickFile(e.dataTransfer.files?.[0]);
                        }}
                        className={`flex w-full cursor-pointer flex-col items-center gap-1 rounded-xl border-2 border-dashed px-4 py-5 text-sm transition-colors ${
                            dragging
                                ? "border-brand-400 bg-brand-500/5 text-brand-600"
                                : "border-slate-200 text-slate-500 hover:border-brand-300 hover:text-brand-600 dark:border-white/10 dark:text-slate-400"
                        }`}
                    >
                        <FileUp className="size-5" />
                        <span className="font-semibold">Glissez un fichier ou cliquez</span>
                        <span className="text-xs text-slate-400">
                            {initialData?.receiptPath ? "Un reçu est déjà joint · le remplacer" : "JPG, PNG ou PDF · 5 Mo max"}
                        </span>
                    </button>
                )}
            </Field>

            <div className="flex gap-2 pt-2">
                <Button type="button" variant="secondary" onClick={onCancel} className="flex-1">
                    Annuler
                </Button>
                <Button type="submit" loading={loading} className="flex-1">
                    {isEdit ? "Enregistrer" : "Ajouter"}
                </Button>
            </div>
        </form>
    );
};

export default ExpenseForm;
