import { Bar, Doughnut } from "react-chartjs-2";
import {
    ArcElement,
    BarElement,
    CategoryScale,
    Chart as ChartJS,
    LinearScale,
    Tooltip,
    type ChartOptions,
} from "chart.js";
import { useTheme } from "../../hooks/useTheme";
import { formatCurrency } from "../../utils/formatCurrency";
import type { MonthPoint } from "../../utils/finance";
import { categoryColor } from "../../utils/colors";

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip);


const tooltipBase = (isDark: boolean) => ({
    backgroundColor: isDark ? "#0f172a" : "#ffffff",
    titleColor: isDark ? "#f1f5f9" : "#0f172a",
    bodyColor: isDark ? "#cbd5e1" : "#475569",
    borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(15,23,42,0.08)",
    borderWidth: 1,
    padding: 10,
    cornerRadius: 6,
    boxPadding: 4,
    usePointStyle: true,
    titleFont: { family: "Inter", weight: 600 as const },
    bodyFont: { family: "Inter" },
});

interface DonutProps {
    data: { categoryId: number; categoryName: string; total: number }[];
    centerLabel: string;
    centerValue: string;
}

export const DonutChart = ({ data, centerLabel, centerValue }: DonutProps) => {
    const { isDark } = useTheme();
    const total = data.reduce((s, d) => s + d.total, 0);

    const chartData = {
        labels: data.map((d) => d.categoryName),
        datasets: [
            {
                data: data.map((d) => d.total),
                backgroundColor: data.map((d) => categoryColor(d.categoryId)),
                borderColor: isDark ? "#0f172a" : "#ffffff",
                borderWidth: 2,
                hoverOffset: 4,
            },
        ],
    };

    const options: ChartOptions<"doughnut"> = {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "70%",
        animation: { animateRotate: true, duration: 1000, easing: "easeOutQuart" },
        plugins: {
            legend: { display: false },
            tooltip: {
                ...tooltipBase(isDark),
                callbacks: {
                    label: (ctx) => {
                        const v = ctx.raw as number;
                        const pct = total ? ((v / total) * 100).toFixed(1) : "0";
                        return ` ${formatCurrency(v)} · ${pct} %`;
                    },
                },
            },
        },
    };

    return (
        <div className="relative mx-auto aspect-square w-full max-w-[220px]">
            <Doughnut data={chartData} options={options} />
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-xs text-slate-400">{centerLabel}</span>
                <span className="text-base font-semibold text-slate-900 tabular-nums dark:text-white">{centerValue}</span>
            </div>
        </div>
    );
};

export const CashflowChart = ({ series }: { series: MonthPoint[] }) => {
    const { isDark } = useTheme();
    const tick = isDark ? "#64748b" : "#94a3b8";

    const chartData = {
        labels: series.map((p) => p.label),
        datasets: [
            {
                label: "Revenus",
                data: series.map((p) => p.income),
                backgroundColor: "#2a9d8f",
                hoverBackgroundColor: "#238b7e",
                borderRadius: 4,
                borderSkipped: false as const,
                barPercentage: 0.7,
                categoryPercentage: 0.6,
            },
            {
                label: "Dépenses",
                data: series.map((p) => p.expense),
                backgroundColor: isDark ? "#475569" : "#cbd5e1",
                hoverBackgroundColor: isDark ? "#64748b" : "#94a3b8",
                borderRadius: 4,
                borderSkipped: false as const,
                barPercentage: 0.7,
                categoryPercentage: 0.6,
            },
        ],
    };

    const options: ChartOptions<"bar"> = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: "index", intersect: false },
        animation: { duration: 900, easing: "easeOutQuart" },
        plugins: {
            legend: { display: false },
            tooltip: {
                ...tooltipBase(isDark),
                callbacks: { label: (ctx) => ` ${ctx.dataset.label} : ${formatCurrency(ctx.raw as number)}` },
            },
        },
        scales: {
            x: {
                grid: { display: false },
                border: { display: false },
                ticks: { color: tick, font: { family: "Inter", size: 12 } },
            },
            y: {
                beginAtZero: true,
                border: { display: false },
                grid: { color: isDark ? "rgba(255,255,255,0.05)" : "rgba(15,23,42,0.05)" },
                ticks: {
                    color: tick,
                    font: { family: "Inter", size: 11 },
                    maxTicksLimit: 5,
                    callback: (v) => new Intl.NumberFormat("fr-FR", { notation: "compact" }).format(Number(v)) + " €",
                },
            },
        },
    };

    return <Bar data={chartData} options={options} />;
};
