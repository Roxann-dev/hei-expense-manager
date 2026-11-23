/** Conteneur et enfants pour faire apparaître une liste en cascade. */
export const listVariants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.04 } },
};

export const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 400, damping: 34 } },
    exit: { opacity: 0, x: -16, transition: { duration: 0.18 } },
};
