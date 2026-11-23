import { Suspense, useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate, useOutlet } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { ArrowDownLeft, ArrowUpRight, LayoutDashboard, LogOut, Menu, Shapes, UserRound, X } from "lucide-react";
import { Logo } from "./Logo";
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

const Brand = Logo;

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
                        className={`relative flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors ${
                            active
                                ? "text-slate-900 dark:text-white"
                                : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                        }`}
                    >
                        {active && (
                            <motion.span
                                layoutId={layoutId}
                                className="absolute inset-0 rounded-md bg-slate-200/70 dark:bg-white/[0.07]"
                                transition={{ type: "spring", stiffness: 600, damping: 45 }}
                            />
                        )}
                        <Icon className="relative size-4" />
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
    const outlet = useOutlet(); // AnimatePresence garde l'ancien élément pendant la sortie : sans ça, la nouvelle page s'afficherait dans l'ancienne
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
        <div className="flex items-center gap-2.5 border-t border-slate-200 px-1 pt-4 dark:border-slate-800">
            <div className="grid size-8 shrink-0 place-items-center rounded-full bg-slate-200 text-xs font-semibold text-slate-700 uppercase dark:bg-slate-800 dark:text-slate-200">
                {email ? email[0] : "?"}
            </div>
            <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-slate-700 dark:text-slate-200">{email || "Mon compte"}</p>
            </div>
            <button
                onClick={handleLogout}
                aria-label="Se déconnecter"
                title="Se déconnecter"
                className="cursor-pointer rounded-lg p-2 text-slate-400 transition hover:bg-slate-200/70 hover:text-slate-700 dark:hover:bg-white/5 dark:hover:text-white"
            >
                <LogOut className="size-4" />
            </button>
        </div>
    );

    return (
        <div className="relative min-h-screen">

            <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r border-slate-200 bg-slate-50 px-3 py-4 lg:flex dark:border-slate-800 dark:bg-slate-950">
                <div className="mb-6 flex items-center justify-between pl-2.5">
                    <Brand />
                    <ThemeToggle />
                </div>
                <NavItems layoutId="nav-active" />
                <div className="mt-auto">
                    <UserCard />
                </div>
            </aside>

            <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur lg:hidden dark:border-slate-800 dark:bg-slate-950/90">
                <button
                    onClick={() => setDrawer(true)}
                    aria-label="Ouvrir le menu"
                    className="grid size-8 cursor-pointer place-items-center rounded-md text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5"
                >
                    <Menu className="size-5" />
                </button>
                <Brand />
                <ThemeToggle />
            </header>

            <AnimatePresence>
                {drawer && (
                    <div className="fixed inset-0 z-50 lg:hidden">
                        <motion.div
                            className="absolute inset-0 bg-slate-950/40"
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

            <main className="lg:pl-60">
                <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10 lg:px-10">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={location.pathname}
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.15, ease: "easeOut" }}
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
