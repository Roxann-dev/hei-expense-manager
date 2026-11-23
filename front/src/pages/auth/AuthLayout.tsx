import { useState, type InputHTMLAttributes, type ReactNode } from "react";
import { motion } from "motion/react";
import { Eye, EyeOff, TrendingUp, Wallet } from "lucide-react";
import { ThemeToggle } from "../../components/ui/DarkModeSwitch";

export const PasswordInput = (props: InputHTMLAttributes<HTMLInputElement>) => {
    const [show, setShow] = useState(false);
    return (
        <div className="relative">
            <input {...props} type={show ? "text" : "password"} className="field pr-11" />
            <button
                type="button"
                onClick={() => setShow((s) => !s)}
                aria-label={show ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                className="absolute inset-y-0 right-0 grid w-11 cursor-pointer place-items-center text-slate-400 hover:text-slate-700 dark:hover:text-white"
            >
                {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
        </div>
    );
};

const FloatingCard = ({ className, delay, children }: { className: string; delay: number; children: ReactNode }) => (
    <motion.div
        className={`absolute rounded-2xl border border-white/15 bg-white/10 p-4 text-white shadow-2xl backdrop-blur-md ${className}`}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: [0, -10, 0] }}
        transition={{
            opacity: { delay, duration: 0.6 },
            y: { delay, duration: 6, repeat: Infinity, ease: "easeInOut" },
        }}
    >
        {children}
    </motion.div>
);

const bars = [38, 62, 45, 80, 56, 92];

const Showcase = () => (
    <div className="relative hidden overflow-hidden bg-gradient-to-br from-brand-500 via-brand-700 to-slate-950 lg:block">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgb(255_255_255/0.18),transparent_45%)]" />
        <motion.div
            className="absolute -right-24 -bottom-24 size-96 rounded-full bg-fuchsia-400/30 blur-3xl"
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />

        <div className="relative flex h-full flex-col justify-between p-12 text-white">
            <div className="flex items-center gap-2.5">
                <div className="grid size-9 place-items-center rounded-xl bg-white/15 backdrop-blur">
                    <Wallet className="size-5" />
                </div>
                <span className="font-display text-lg font-extrabold">CashFlow</span>
            </div>

            <div className="relative h-80">
                <FloatingCard className="top-0 left-0 w-64" delay={0.2}>
                    <p className="text-xs text-white/70">Solde du mois</p>
                    <p className="mt-1 font-display text-2xl font-bold">+ 1 248,50 €</p>
                    <div className="mt-4 flex h-16 items-end gap-1.5">
                        {bars.map((h, i) => (
                            <motion.div
                                key={i}
                                className="flex-1 rounded-t-md bg-white/70"
                                initial={{ height: 0 }}
                                animate={{ height: `${h}%` }}
                                transition={{ delay: 0.6 + i * 0.08, type: "spring", stiffness: 120, damping: 14 }}
                            />
                        ))}
                    </div>
                </FloatingCard>
                <FloatingCard className="right-4 bottom-4 w-56" delay={0.5}>
                    <div className="flex items-center gap-3">
                        <div className="grid size-9 place-items-center rounded-xl bg-emerald-400/25 text-emerald-200">
                            <TrendingUp className="size-4" />
                        </div>
                        <div>
                            <p className="text-xs text-white/70">Épargne</p>
                            <p className="font-semibold">+18 % ce mois-ci</p>
                        </div>
                    </div>
                </FloatingCard>
            </div>

            <div>
                <h2 className="font-display text-3xl leading-tight font-extrabold">
                    Vos finances,
                    <br />
                    enfin claires.
                </h2>
                <p className="mt-3 max-w-sm text-white/70">
                    Suivez vos revenus et dépenses, repérez où part votre argent et gardez le contrôle de votre budget.
                </p>
            </div>
        </div>
    </div>
);

const AuthLayout = ({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) => (
    <div className="grid min-h-screen lg:grid-cols-2">
        <div className="relative flex items-center justify-center px-4 py-12 sm:px-8">
            <ThemeToggle className="absolute top-5 right-5" />
            <motion.div
                className="w-full max-w-sm"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
                <div className="mb-8 grid size-11 place-items-center rounded-2xl bg-gradient-to-br from-brand-400 to-brand-700 text-white shadow-lg shadow-brand-500/30 lg:hidden">
                    <Wallet className="size-5" />
                </div>
                <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">{title}</h1>
                <p className="mt-2 mb-8 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
                {children}
            </motion.div>
        </div>
        <Showcase />
    </div>
);

export default AuthLayout;
