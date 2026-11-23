import type { ReactNode } from "react";

interface FieldProps {
    label: string;
    htmlFor?: string;
    hint?: string;
    error?: string;
    children: ReactNode;
}

/** Un libellé + un champ + un message d'aide ou d'erreur. */
export const Field = ({ label, htmlFor, hint, error, children }: FieldProps) => (
    <div>
        <label htmlFor={htmlFor} className="label">
            {label}
        </label>
        {children}
        {error ? (
            <p className="mt-1.5 text-xs font-medium text-rose-500">{error}</p>
        ) : hint ? (
            <p className="mt-1.5 text-xs text-slate-400">{hint}</p>
        ) : null}
    </div>
);

export default Field;
