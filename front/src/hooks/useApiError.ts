import { useCallback } from "react";
import { toast } from "react-toastify";
import { useAuthContext } from "../context/AuthContext";

export const errorMessage = (err: unknown, fallback = "Une erreur est survenue."): string => {
    if (err && typeof err === "object" && "response" in err) {
        const data = (err as { response?: { data?: { message?: string; error?: string } } }).response?.data;
        if (data?.message || data?.error) return (data.message || data.error) as string;
    }
    if (err instanceof Error && err.message) return err.message;
    return fallback;
};

export const useApiError = () => {
    const { logout } = useAuthContext();
    return useCallback(
        (err: unknown, fallback?: string) => {
            const msg = errorMessage(err, fallback);
            if (msg === "NO_TOKEN" || /\b401\b|expir|token/i.test(msg)) {
                toast.error("Votre session a expiré. Reconnectez-vous.");
                logout();
                return;
            }
            toast.error(msg);
        },
        [logout]
    );
};
