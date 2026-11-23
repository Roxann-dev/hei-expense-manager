type Cell = string | number | null | undefined;

const escape = (v: Cell) => {
    const s = v === null || v === undefined ? "" : String(v);
    return /[";\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

/** Télécharge un CSV (séparateur « ; » pour qu'Excel FR l'ouvre directement). */
export const exportCsv = (filename: string, headers: string[], rows: Cell[][]) => {
    const content = [headers, ...rows].map((r) => r.map(escape).join(";")).join("\r\n");
    const blob = new Blob(["﻿" + content], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
};
