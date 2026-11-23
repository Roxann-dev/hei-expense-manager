import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { LogOut, Mail, Pencil, ShieldCheck } from "lucide-react";
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
        { label: "Catégories", value: user?.categories?.length ?? 0 },
    ];

    return (
        <div className="max-w-2xl">
            <PageHeader title="Profil" />

            <motion.div variants={listVariants} initial="hidden" animate="show" className="space-y-4">
                <motion.section variants={itemVariants} className="card p-5">
                    <div className="flex items-center gap-4">
                        <div className="grid size-12 shrink-0 place-items-center rounded-full bg-slate-200 text-lg font-semibold text-slate-700 uppercase dark:bg-slate-800 dark:text-slate-200">
                            {user?.email?.[0] ?? "?"}
                        </div>
                        <div className="min-w-0 flex-1">
                            {user ? (
                                <>
                                    <h2 className="truncate font-medium text-slate-900 dark:text-white">{user.email}</h2>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Inscrit le {formatDate(user.createdAt)}</p>
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

                    <div className="mt-5 grid grid-cols-3 divide-x divide-slate-100 border-t border-slate-100 pt-4 dark:divide-slate-800 dark:border-slate-800">
                        {stats.map((s) => (
                            <div key={s.label} className="px-3 first:pl-0">
                                <p className="text-lg font-semibold text-slate-900 tabular-nums dark:text-white">{s.value}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">{s.label}</p>
                            </div>
                        ))}
                    </div>
                </motion.section>

                <motion.section variants={itemVariants} className="card p-5">
                    <h3 className="mb-3 text-sm font-semibold text-slate-900 dark:text-white">Compte</h3>
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
                                ].map(({ icon: Icon, label, value }) => (
                                    <div key={label} className="flex items-center gap-3 py-3">
                                        <Icon className="size-4 text-slate-400" />
                                        <dt className="flex-1 text-sm text-slate-500 dark:text-slate-400">{label}</dt>
                                        <dd className="text-sm text-slate-800 dark:text-slate-100">{value}</dd>
                                    </div>
                                ))}
                            </motion.dl>
                        )}
                    </AnimatePresence>
                </motion.section>

                <motion.section variants={itemVariants} className="card p-5">
                    <h3 className="mb-3 text-sm font-semibold text-slate-900 dark:text-white">Affichage</h3>
                    <div className="flex items-center gap-3">
                        <div className="flex-1">
                            <p className="text-sm text-slate-800 dark:text-slate-100">Mode sombre</p>
                        </div>
                        <DarkModeSwitch />
                    </div>
                </motion.section>

                <motion.div variants={itemVariants} className="pt-2">
                    <Button
                        variant="ghost"
                        icon={<LogOut className="size-4" />}
                        onClick={() => {
                            logout();
                            navigate("/login");
                        }}
                        className="text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
                    >
                        Se déconnecter
                    </Button>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default Profiles;
