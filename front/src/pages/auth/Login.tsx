import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { useAuthContext } from "../../context/AuthContext";
import { login } from "../../services/authService";
import { loginSchema } from "../../utils/validators";
import { errorMessage } from "../../hooks/useApiError";
import Button from "../../components/ui/Button";
import Field from "../../components/ui/Input";
import AuthLayout, { PasswordInput } from "./AuthLayout";

const Login = () => {
    const navigate = useNavigate();
    const { login: setToken } = useAuthContext();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        const parsed = loginSchema.safeParse({ email, password });
        if (!parsed.success) {
            setError(parsed.error.issues[0]?.message ?? "Champs invalides");
            return;
        }

        setLoading(true);
        try {
            const res = await login(email, password);
            setToken(res.data.token);
            navigate("/dashboard");
        } catch (err) {
            setError(errorMessage(err, "Email ou mot de passe incorrect"));
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout title="Bon retour 👋" subtitle="Connectez-vous pour retrouver votre tableau de bord.">
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
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Votre mot de passe"
                    />
                </Field>

                <Button type="submit" size="lg" loading={loading} className="group w-full">
                    Se connecter
                    {!loading && <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />}
                </Button>
            </form>

            <p className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
                Pas encore de compte ?{" "}
                <Link to="/signup" className="font-semibold text-brand-600 hover:underline dark:text-brand-400">
                    Créer un compte
                </Link>
            </p>
        </AuthLayout>
    );
};

export default Login;
