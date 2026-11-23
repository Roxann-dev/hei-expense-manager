import { Suspense, useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate, useOutlet } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { ArrowDownLeft, ArrowUpRight, LayoutDashboard, LogOut, Menu, Shapes, UserRound, Wallet, X } from "lucide-react";
import { useAuthContext } from "../../context/AuthContext";
import { ThemeToggle } from "../ui/DarkModeSwitch";
import { loadProfile } from "../../services/profileService";
import { ListSkeleton } from "../ui/Loader";

const links = [
    { to: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
    { to: "/incomes", label: "Revenus", icon: ArrowDownLeft },
    { to: "/expenses", label: "Dépenses", icon: ArrowUpRight },
    { to: "/categories", label: "Catégories", icon: Shapes },
    { to: "/profile", label: "Profil", icon: UserRound },
];

const Brand = () => (
    <div className="flex items-center gap-2.5">
        <div className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-brand-400 to-brand-700 text-white shadow-lg shadow-brand-500/30">
            <Wallet className="size-5" />
        </div>
        <span className="font-display text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">CashFlow</span>
    </div>
);

const NavItems = ({ onNavigate, layoutId }: { onNavigate?: () => void; layoutId: string }) => {
    const { pathname } = useLocation();
    return (
        <nav className="flex flex-col gap-1">
            {links.map(({ to, label, icon: Icon }) => {
                const active = pathname === to || (to === "/dashboard" && pathname === "/");
                return (
                    <NavLink
                        key={to}
                        to={to}
                        onClick={onNavigate}
                        className={`relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
                            active
                                ? "text-brand-700 dark:text-white"
                                : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                        }`}
                    >
                        {active && (
                            <motion.span
                                layoutId={layoutId}
                                className="absolute inset-0 rounded-xl bg-brand-500/10 ring-1 ring-brand-500/20 dark:bg-white/[0.06] dark:ring-white/10"
                                transition={{ type: "spring", stiffness: 500, damping: 38 }}
                            />
                        )}
                        <Icon className="relative size-[18px]" />
                        <span className="relative">{label}</span>
                    </NavLink>
                );
            })}
        </nav>
    );
};

export default function Navbar() {
    const { logout, token } = useAuthContext();
    const navigate = useNavigate();
    const location = useLocation();
    const outlet = useOutlet(); // figé par AnimatePresence pendant la sortie
    const [drawer, setDrawer] = useState(false);
    const [email, setEmail] = useState<string>("");

    useEffect(() => {
        if (!token) return;
        loadProfile(token)
            .then((res) => setEmail(res.data?.email ?? ""))
            .catch(() => undefined);
    }, [token]);

    useEffect(() => setDrawer(false), [location.pathname]);

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const UserCard = () => (
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 p-3 dark:border-white/[0.06]">
            <div className="grid size-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-amber-300 to-rose-400 text-sm font-bold text-white uppercase">
                {email ? email[0] : "?"}
            </div>
            <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">{email || "Mon compte"}</p>
                <p className="text-xs text-slate-400">Connecté</p>
            </div>
            <button
                onClick={handleLogout}
                aria-label="Se déconnecter"
                title="Se déconnecter"
                className="cursor-pointer rounded-lg p-2 text-slate-400 transition hover:bg-rose-500/10 hover:text-rose-500"
            >
                <LogOut className="size-4" />
            </button>
        </div>
    );

    return (
        <div className="relative min-h-screen">
            {/* Halo décoratif */}
            <div className="pointer-events-none fixed inset-x-0 top-0 -z-10 h-[420px] bg-[radial-gradient(60%_60%_at_70%_0%,color-mix(in_oklch,var(--color-brand-500)_14%,transparent),transparent)] dark:bg-[radial-gradient(60%_60%_at_70%_0%,color-mix(in_oklch,var(--color-brand-500)_22%,transparent),transparent)]" />

            {/* Barre latérale (écrans larges) */}
            <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-slate-200/70 bg-white/70 p-5 backdrop-blur-xl lg:flex dark:border-white/[0.06] dark:bg-slate-950/60">
                <div className="mb-8 flex items-center justify-between">
                    <Brand />
                    <ThemeToggle />
                </div>
                <NavItems layoutId="nav-active" />
                <div className="mt-auto">
                    <UserCard />
                </div>
            </aside>

            {/* Barre du haut (mobile) */}
            <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-slate-200/70 bg-white/70 px-4 backdrop-blur-xl lg:hidden dark:border-white/[0.06] dark:bg-slate-950/70">
                <button
                    onClick={() => setDrawer(true)}
                    aria-label="Ouvrir le menu"
                    className="grid size-10 cursor-pointer place-items-center rounded-xl text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5"
                >
                    <Menu className="size-5" />
                </button>
                <Brand />
                <ThemeToggle />
            </header>

            {/* Menu tiroir (mobile) */}
            <AnimatePresence>
                {drawer && (
                    <div className="fixed inset-0 z-50 lg:hidden">
                        <motion.div
                            className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setDrawer(false)}
                        />
                        <motion.aside
                            className="absolute inset-y-0 left-0 flex w-72 flex-col bg-white p-5 shadow-2xl dark:bg-slate-900"
                            initial={{ x: "-100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "-100%" }}
                            transition={{ type: "spring", stiffness: 420, damping: 40 }}
                        >
                            <div className="mb-8 flex items-center justify-between">
                                <Brand />
                                <button
                                    onClick={() => setDrawer(false)}
                                    aria-label="Fermer le menu"
                                    className="cursor-pointer rounded-lg p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5"
                                >
                                    <X className="size-5" />
                                </button>
                            </div>
                            <NavItems layoutId="nav-active-mobile" />
                            <div className="mt-auto">
                                <UserCard />
                            </div>
                        </motion.aside>
                    </div>
                )}
            </AnimatePresence>

            {/* Contenu, avec transition à chaque changement de page */}
            <main className="lg:pl-64">
                <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10 lg:px-10">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={location.pathname}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                        >
                            <Suspense fallback={<ListSkeleton rows={4} />}>
                                {outlet}
                            </Suspense>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
}
