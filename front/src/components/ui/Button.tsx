import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { Loader2 } from "lucide-react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: Variant;
    size?: Size;
    loading?: boolean;
    icon?: ReactNode;
}

const variants: Record<Variant, string> = {
    primary:
        "bg-gradient-to-b from-brand-500 to-brand-600 text-white shadow-[0_1px_0_rgb(255_255_255/0.2)_inset,0_6px_16px_-6px_var(--color-brand-600)] hover:from-brand-400 hover:to-brand-600",
    secondary:
        "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10",
    ghost: "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5",
    danger: "bg-gradient-to-b from-rose-500 to-rose-600 text-white shadow-[0_6px_16px_-6px_var(--color-rose-600)] hover:from-rose-400",
};

const sizes: Record<Size, string> = {
    sm: "h-8 px-3 text-xs gap-1.5 rounded-lg",
    md: "h-10 px-4 text-sm gap-2 rounded-xl",
    lg: "h-12 px-5 text-sm gap-2 rounded-xl",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ variant = "primary", size = "md", loading, icon, className = "", children, disabled, ...rest }, ref) => (
        <button
            ref={ref}
            disabled={disabled || loading}
            className={`inline-flex cursor-pointer items-center justify-center font-semibold whitespace-nowrap transition-all duration-200
                active:scale-[0.97] disabled:pointer-events-none disabled:opacity-60
                focus-visible:ring-4 focus-visible:ring-brand-500/25 focus-visible:outline-none
                ${variants[variant]} ${sizes[size]} ${className}`}
            {...rest}
        >
            {loading ? <Loader2 className="size-4 animate-spin" /> : icon}
            {children}
        </button>
    )
);

Button.displayName = "Button";
export default Button;
