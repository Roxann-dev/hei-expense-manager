import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowLeft } from "lucide-react";

const NotFound = () => (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
        <motion.h1
            className="bg-gradient-to-br from-brand-400 to-brand-700 bg-clip-text font-display text-[8rem] leading-none font-extrabold text-transparent"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1, y: [0, -10, 0] }}
            transition={{ opacity: { duration: 0.4 }, scale: { type: "spring" }, y: { duration: 4, repeat: Infinity, ease: "easeInOut" } }}
        >
            404
        </motion.h1>
        <p className="mt-2 text-lg font-semibold text-slate-800 dark:text-slate-100">Cette page n'existe pas</p>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Le lien est peut-être cassé, ou la page a été déplacée.</p>
        <Link
            to="/dashboard"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-500/25 transition hover:bg-brand-500"
        >
            <ArrowLeft className="size-4" /> Retour au tableau de bord
        </Link>
    </div>
);

export default NotFound;
