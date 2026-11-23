const PALETTE = [
    "#3b6fd4",
    "#e9a23b",
    "#d1495b",
    "#8a6fb3",
    "#5c9e4b",
    "#c06c3e",
    "#4a90a4",
    "#b0688f",
];

export const OTHER_COLOR = "#a0a7b4";

// Couleur dérivée de l'id : une catégorie garde la même couleur sur toutes les pages.
export const categoryColor = (id: number) => (id < 0 ? OTHER_COLOR : PALETTE[id % PALETTE.length]);
