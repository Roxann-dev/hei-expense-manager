import { Link } from "react-router-dom";

const NotFound = () => (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
        <p className="text-sm font-medium text-slate-400">404</p>
        <h1 className="mt-2 text-xl font-semibold text-slate-900 dark:text-white">Page introuvable</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Cette adresse ne correspond à aucune page.</p>
        <Link
            to="/dashboard"
            className="mt-6 text-sm font-medium text-slate-900 underline underline-offset-4 hover:text-slate-600 dark:text-white dark:hover:text-slate-300"
        >
            Retour à l'accueil
        </Link>
    </div>
);

export default NotFound;
