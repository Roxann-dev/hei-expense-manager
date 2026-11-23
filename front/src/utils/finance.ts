import type { Expense } from "../services/expenseService";
import type { IncomeResponse } from "../services/incomeService";

export interface MonthPoint {
    key: string; // "2026-11"
    label: string; // "nov."
    income: number;
    expense: number;
}

const monthKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

/** Une dépense compte-t-elle pour ce mois ? Même règle que le backend (budgetAlertService). */
export const expenseHitsMonth = (e: Expense, start: Date, end: Date): boolean => {
    if (e.type === "ONE_TIME") {
        if (!e.date) return false;
        const d = new Date(e.date);
        return d >= start && d <= end;
    }
    if (!e.startDate) return false;
    const s = new Date(e.startDate);
    const en = e.endDate ? new Date(e.endDate) : null;
    return s <= end && (en === null || en >= start);
};

const monthBounds = (year: number, month: number) => ({
    start: new Date(year, month, 1),
    end: new Date(year, month + 1, 0, 23, 59, 59, 999),
});

export const monthlyTotals = (expenses: Expense[], incomes: IncomeResponse[], year: number, month: number) => {
    const { start, end } = monthBounds(year, month);
    const expense = expenses.filter((e) => expenseHitsMonth(e, start, end)).reduce((s, e) => s + e.amount, 0);
    const income = incomes
        .filter((i) => {
            const d = new Date(i.date);
            return d >= start && d <= end;
        })
        .reduce((s, i) => s + i.amount, 0);
    return { income, expense };
};

/** Les `count` derniers mois, du plus ancien au plus récent. */
export const cashflowSeries = (expenses: Expense[], incomes: IncomeResponse[], count = 6): MonthPoint[] => {
    const now = new Date();
    const out: MonthPoint[] = [];
    for (let i = count - 1; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const { income, expense } = monthlyTotals(expenses, incomes, d.getFullYear(), d.getMonth());
        out.push({
            key: monthKey(d),
            label: d.toLocaleDateString("fr-FR", { month: "short" }),
            income,
            expense,
        });
    }
    return out;
};

/** Variation en % entre deux valeurs, null si non calculable. */
export const percentChange = (current: number, previous: number): number | null => {
    if (previous === 0) return null;
    return ((current - previous) / Math.abs(previous)) * 100;
};

/** Date de référence pour trier une dépense. */
export const expenseDate = (e: Expense) => e.date ?? e.startDate ?? e.createdAt ?? "";
