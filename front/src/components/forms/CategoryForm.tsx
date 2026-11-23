import { useState } from "react";
import { toast } from "react-toastify";
import { createCategory, updateCategory } from "../../services/ccategoryService.ts";
import { errorMessage } from "../../hooks/useApiError";
import Button from "../ui/Button";
import Field from "../ui/Input";

interface CategoryFormProps {
    category: { id?: number; name: string } | null;
    onSubmit: () => void;
    onCancel: () => void;
}

const IDEAS = ["Transport", "Loyer", "Loisirs", "Santé", "Abonnements", "Études"];

const CategoryForm: React.FC<CategoryFormProps> = ({ category, onSubmit, onCancel }) => {
    const [name, setName] = useState(category?.name || "");
    const [error, setError] = useState<string>();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return setError("Donnez un nom à la catégorie");
        setLoading(true);
        try {
            if (category?.id) await updateCategory(category.id, name.trim());
            else await createCategory(name.trim());
            toast.success(category?.id ? "Catégorie renommée" : "Catégorie créée");
            onSubmit();
        } catch (err) {
            setError(errorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <Field label="Nom" htmlFor="cat-name" error={error}>
                <input
                    id="cat-name"
                    autoFocus
                    value={name}
                    onChange={(e) => {
                        setName(e.target.value);
                        setError(undefined);
                    }}
                    placeholder="Ex. Courses"
                    className="field"
                />
            </Field>
            {!category?.id && (
                <div className="flex flex-wrap gap-1.5">
                    {IDEAS.map((idea) => (
                        <button
                            key={idea}
                            type="button"
                            onClick={() => setName(idea)}
                            className="cursor-pointer rounded-md border border-slate-200 px-2 py-0.5 text-xs text-slate-600 transition hover:border-slate-300 dark:border-slate-700 dark:text-slate-300"
                        >
                            {idea}
                        </button>
                    ))}
                </div>
            )}
            <div className="flex gap-2 pt-2">
                <Button type="button" variant="secondary" onClick={onCancel} className="flex-1">
                    Annuler
                </Button>
                <Button type="submit" loading={loading} className="flex-1">
                    {category?.id ? "Enregistrer" : "Créer"}
                </Button>
            </div>
        </form>
    );
};

export default CategoryForm;
