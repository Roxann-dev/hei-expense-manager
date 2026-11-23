import React, { useState } from "react";
import { toast } from "react-toastify";
import { createIncome, updateIncome } from "../../services/incomeService";
import type { IncomeInput, IncomeResponse } from "../../services/incomeService";
import { toInputDate, todayInput } from "../../utils/formatDate";
import { errorMessage } from "../../hooks/useApiError";
import Button from "../ui/Button";
import Field from "../ui/Input";

type IncomeFormProps = {
    onSuccess?: () => void;
    onCancel?: () => void;
    initialData?: IncomeResponse | null;
    suggestions?: string[];
};

const DEFAULT_SOURCES = ["Salaire", "Freelance", "Bourse", "Aide familiale", "Vente"];

const IncomeForm: React.FC<IncomeFormProps> = ({ onSuccess, onCancel, initialData, suggestions = [] }) => {
    const isEdit = !!initialData?.id;
    const [amount, setAmount] = useState(initialData ? String(initialData.amount) : "");
    const [date, setDate] = useState(toInputDate(initialData?.date) || todayInput());
    const [source, setSource] = useState(initialData?.source || "");
    const [description, setDescription] = useState(initialData?.description || "");
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);

    const chips = Array.from(new Set([...suggestions, ...DEFAULT_SOURCES])).slice(0, 6);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const errs: Record<string, string> = {};
        const n = parseFloat(amount);
        if (!n || n <= 0) errs.amount = "Saisissez un montant positif";
        if (!date) errs.date = "Choisissez une date";
        if (!source.trim()) errs.source = "Indiquez la provenance";
        setErrors(errs);
        if (Object.keys(errs).length) return;

        const data: IncomeInput = { amount: n, date, source: source.trim(), description: description || undefined };
        setLoading(true);
        try {
            if (isEdit && initialData?.id) await updateIncome(initialData.id, data);
            else await createIncome(data);
            toast.success(isEdit ? "Revenu mis à jour" : "Revenu ajouté");
            onSuccess?.();
        } catch (err) {
            toast.error(errorMessage(err, "Impossible d'enregistrer le revenu"));
        } finally {
            setLoading(false);
        }
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

            <Field label="Source" htmlFor="source" error={errors.source}>
                <input id="source" value={source} onChange={(e) => setSource(e.target.value)} className="field" placeholder="Ex. Salaire" />
                <div className="mt-2 flex flex-wrap gap-1.5">
                    {chips.map((c) => (
                        <button
                            key={c}
                            type="button"
                            onClick={() => setSource(c)}
                            className={`cursor-pointer rounded-full px-3 py-1 text-xs font-semibold transition ${
                                source === c
                                    ? "bg-emerald-500 text-white"
                                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"
                            }`}
                        >
                            {c}
                        </button>
                    ))}
                </div>
            </Field>

            <Field label="Date" htmlFor="date" error={errors.date}>
                <input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} className="field" />
            </Field>

            <Field label="Description" htmlFor="desc">
                <input id="desc" value={description} onChange={(e) => setDescription(e.target.value)} className="field" placeholder="Optionnel" />
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

export default IncomeForm;
