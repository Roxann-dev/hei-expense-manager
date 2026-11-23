import { useState, type InputHTMLAttributes, type ReactNode } from "react";
import { Eye, EyeOff } from "lucide-react";
import { ThemeToggle } from "../../components/ui/DarkModeSwitch";
import { Logo } from "../../components/layout/Logo";

export const PasswordInput = (props: InputHTMLAttributes<HTMLInputElement>) => {
    const [show, setShow] = useState(false);
    return (
        <div className="relative">
            <input {...props} type={show ? "text" : "password"} className="field pr-10" />
            <button
                type="button"
                onClick={() => setShow((s) => !s)}
                aria-label={show ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                className="absolute inset-y-0 right-0 grid w-10 cursor-pointer place-items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
                {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
        </div>
    );
};

interface AuthLayoutProps {
    title: string;
    subtitle: string;
    children: ReactNode;
    footer: ReactNode;
}

const AuthLayout = ({ title, subtitle, children, footer }: AuthLayoutProps) => (
    <div className="flex min-h-screen flex-col">
        <header className="flex items-center justify-between px-6 py-5">
            <Logo />
            <ThemeToggle />
        </header>

        <main className="flex flex-1 items-start justify-center px-4 pt-[8vh] pb-16">
            <div className="w-full max-w-[380px]">
                <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">{title}</h1>
                <p className="mt-1.5 mb-7 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
                <div className="card p-6">{children}</div>
                <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">{footer}</p>
            </div>
        </main>
    </div>
);

export default AuthLayout;
