import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { CalendarDays, LogOut, Mail, Moon, Pencil, ShieldCheck } from "lucide-react";
import { toast } from "react-toastify";
import { loadProfile, updateProfile } from "../../services/profileService";
import { useAuthContext } from "../../context/AuthContext";
import { useApiError } from "../../hooks/useApiError";
import { DarkModeSwitch } from "../../components/ui/DarkModeSwitch";
import Button from "../../components/ui/Button";
import Field from "../../components/ui/Input";
import { Skeleton } from "../../components/ui/Loader";
import { PageHeader } from "../../components/ui/PageHeader";
import { itemVariants, listVariants } from "../../utils/motion";
import { PasswordInput } from "../auth/AuthLayout";
import { formatDate } from "../../utils/formatDate";

interface Profile {
    email: string;
    createdAt?: string;
    expenses?: unknown[];
    incomes?: unknown[];
    categories?: unknown[];
}

const Profiles = () => {
    const { token, logout } = useAuthContext();
    const navigate = useNavigate();
    const onError = useApiError();
    const [user, setUser] = useState<Profile | null>(null);
    const [editing, setEditing] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!token) return;
        loadProfile(token)
            .then((res) => setUser(res.data))
            .catch((err) => onError(err, "Impossible de charger le profil"));
    }, [token, onError]);

    const startEdit = () => {
        setEmail(user?.email ?? "");
        setPassword("");
        setEditing(true);
    };

    const save = async () => {
        if (!token) return;
        if (password && password.length < 6) return toast.error("Le mot de passe doit contenir au moins 6 caractères");
        const payload: { email?: string; password?: string } = {};
        if (email && email !== user?.email) payload.email = email;
        if (password) payload.password = password;
        if (!Object.keys(payload).length) return setEditing(false);

        setSaving(true);
        try {
            const res = await updateProfile(token, payload);
            setUser(res.data);
            setEditing(false);
            toast.success("Profil mis à jour");
        } catch (err) {
            onError(err, "La mise à jour a échoué");
        } finally {
            setSaving(false);
        }
    };

    const stats = [
        { label: "Dépenses", value: user?.expenses?.length ?? 0 },
        { label: "Revenus", value: user?.incomes?.length ?? 0 },
        { label: "Catégories perso", value: user?.categories?.length ?? 0 },
    ];

    return (
        <div className="mx-auto max-w-3xl">
            <PageHeader title="Profil" subtitle="Vos informations et vos préférences." />

            <motion.div variants={listVariants} initial="hidden" animate="show" className="space-y-4">
                {/* Carte d'identité */}
                <motion.section variants={itemVariants} className="card relative overflow-hidden p-6">
                    <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-r from-brand-500/20 via-fuchsia-500/10 to-amber-400/20" />
                    <div className="relative flex flex-col items-center gap-4 pt-6 text-center sm:flex-row sm:items-end sm:text-left">
                        <div className="grid size-20 place-items-center rounded-2xl bg-gradient-to-br from-amber-300 to-rose-400 font-display text-3xl font-extrabold text-white uppercase shadow-xl ring-4 ring-white dark:ring-slate-900">
                            {user?.email?.[0] ?? "?"}
                        </div>
                        <div className="flex-1">
                            {user ? (
                                <>
                                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">{user.email.split("@")[0]}</h2>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">{user.email}</p>
                                </>
                            ) : (
                                <div className="space-y-2">
                                    <Skeleton className="h-5 w-40" />
                                    <Skeleton className="h-4 w-56" />
                                </div>
                            )}
                        </div>
                        {!editing && (
                            <Button variant="secondary" icon={<Pencil className="size-4" />} onClick={startEdit} disabled={!user}>
                                Modifier
                            </Button>
                        )}
                    </div>

                    <div className="relative mt-6 grid grid-cols-3 gap-3">
                        {stats.map((s) => (
                            <div key={s.label} className="rounded-xl bg-slate-50 p-3 text-center dark:bg-white/[0.03]">
                                <p className="font-display text-xl font-bold text-slate-900 dark:text-white">{s.value}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">{s.label}</p>
                            </div>
                        ))}
                    </div>
                </motion.section>

                {/* Informations / édition */}
                <motion.section variants={itemVariants} className="card p-6">
                    <h3 className="mb-4 font-bold text-slate-900 dark:text-white">Informations du compte</h3>
                    <AnimatePresence mode="wait" initial={false}>
                        {editing ? (
                            <motion.div
                                key="edit"
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -6 }}
                                className="space-y-4"
                            >
                                <Field label="Adresse email" htmlFor="p-email">
                                    <input id="p-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="field" />
                                </Field>
                                <Field label="Nouveau mot de passe" htmlFor="p-pass" hint="Laissez vide pour garder l'actuel.">
                                    <PasswordInput
                                        id="p-pass"
                                        autoComplete="new-password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                    />
                                </Field>
                                <div className="flex justify-end gap-2">
                                    <Button variant="secondary" onClick={() => setEditing(false)}>
                                        Annuler
                                    </Button>
                                    <Button loading={saving} onClick={save}>
                                        Enregistrer
                                    </Button>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.dl
                                key="view"
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -6 }}
                                className="divide-y divide-slate-100 dark:divide-white/5"
                            >
                                {[
                                    { icon: Mail, label: "Email", value: user?.email ?? "…" },
                                    { icon: ShieldCheck, label: "Mot de passe", value: "••••••••••" },
                                    { icon: CalendarDays, label: "Membre depuis", value: formatDate(user?.createdAt) },
                                ].map(({ icon: Icon, label, value }) => (
                                    <div key={label} className="flex items-center gap-3 py-3">
                                        <Icon className="size-4 text-slate-400" />
                                        <dt className="flex-1 text-sm text-slate-500 dark:text-slate-400">{label}</dt>
                                        <dd className="text-sm font-semibold text-slate-800 dark:text-slate-100">{value}</dd>
                                    </div>
                                ))}
                            </motion.dl>
                        )}
                    </AnimatePresence>
                </motion.section>

                {/* Préférences */}
                <motion.section variants={itemVariants} className="card p-6">
                    <h3 className="mb-4 font-bold text-slate-900 dark:text-white">Préférences</h3>
                    <div className="flex items-center gap-3">
                        <div className="grid size-9 place-items-center rounded-xl bg-brand-500/10 text-brand-500">
                            <Moon className="size-4" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">Mode sombre</p>
                            <p className="text-xs text-slate-400">Plus doux pour les yeux le soir.</p>
                        </div>
                        <DarkModeSwitch />
                    </div>
                </motion.section>

                <motion.div variants={itemVariants} className="flex justify-center pt-2">
                    <Button
                        variant="ghost"
                        icon={<LogOut className="size-4" />}
                        onClick={() => {
                            logout();
                            navigate("/login");
                        }}
                        className="text-rose-500 hover:bg-rose-500/10 hover:text-rose-600 dark:text-rose-400"
                    >
                        Se déconnecter
                    </Button>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default Profiles;
