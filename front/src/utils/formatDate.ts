export const formatDate = (dateString: string | undefined | null): string => {
    if (!dateString) return "—";

    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Date invalide";

    return date.toLocaleDateString("fr-FR", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
};

export const toInputDate = (dateString: string | undefined | null): string => {
    if (!dateString) return "";
    return dateString.slice(0, 10);
};

export const todayInput = (): string => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
