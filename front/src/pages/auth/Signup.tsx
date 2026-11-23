import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { toast } from "react-toastify";
import { useAuthContext } from "../../context/AuthContext";
import { signup } from "../../services/authService";
import { signupSchema } from "../../utils/validators";
import { errorMessage } from "../../hooks/useApiError";
import Button from "../../components/ui/Button";
import Field from "../../components/ui/Input";
import AuthLayout, { PasswordInput } from "./AuthLayout";

const strength = (pw: string) => {
    let s = 0;
    if (pw.length >= 6) s++;
    if (pw.length >= 10) s++;
    if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++;
    if (/\d/.test(pw) || /[^A-Za-z0-9]/.test(pw)) s++;
    return s;
};

const levels = [
    { label: "Trop court", color: "bg-rose-500" },
    { label: "Faible", color: "bg-rose-500" },
    { label: "Moyen", color: "bg-amber-500" },
    { label: "Bon", color: "bg-emerald-500" },
    { label: "Excellent", color: "bg-emerald-500" },
];

const Signup: React.FC = () => {
    const navigate = useNavigate();
    const { login: setToken } = useAuthContext();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const score = strength(password);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        const parsed = signupSchema.safeParse({ email, password });
        if (!parsed.success) {
            setError(parsed.error.issues[0]?.message ?? "Champs invalides");
            return;
        }

        setLoading(true);
        try {
            const res = await signup(email, password);
            setToken(res.data.token);
            toast.success("Bienvenue sur CashFlow !");
            navigate("/dashboard");
        } catch (err) {
            setError(errorMessage(err, "L'inscription a échoué"));
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout title="Créer un compte" subtitle="Quelques secondes suffisent pour commencer à suivre votre budget.">
            <form className="space-y-5" onSubmit={handleSubmit} noValidate>
                <AnimatePresence>
                    {error && (
                        <motion.p
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm font-medium text-rose-600 dark:text-rose-400"
                        >
                            {error}
                        </motion.p>
                    )}
                </AnimatePresence>

                <Field label="Email" htmlFor="email">
                    <input
                        id="email"
                        type="email"
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="field"
                        placeholder="vous@exemple.com"
                    />
                </Field>

                <Field label="Mot de passe" htmlFor="password">
                    <PasswordInput
                        id="password"
                        autoComplete="new-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="6 caractères minimum"
                    />
                    {password && (
                        <div className="mt-2.5">
                            <div className="flex gap-1">
                                {[0, 1, 2, 3].map((i) => (
                                    <div key={i} className="h-1 flex-1 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
                                        <motion.div
                                            className={`h-full ${levels[score].color}`}
                                            initial={false}
                                            animate={{ width: i < score ? "100%" : "0%" }}
                                            transition={{ duration: 0.3 }}
                                        />
                                    </div>
                                ))}
                            </div>
                            <p className="mt-1.5 text-xs text-slate-400">{levels[score].label}</p>
                        </div>
                    )}
                </Field>

                <Button type="submit" size="lg" loading={loading} className="group w-full">
                    Créer mon compte
                    {!loading && <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />}
                </Button>
            </form>

            <p className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
                Déjà inscrit ?{" "}
                <Link to="/login" className="font-semibold text-brand-600 hover:underline dark:text-brand-400">
                    Se connecter
                </Link>
            </p>
        </AuthLayout>
    );
};

export default Signup;
