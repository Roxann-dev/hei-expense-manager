export const listVariants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.025 } },
};

export const itemVariants = {
    hidden: { opacity: 0, y: 4 },
    show: { opacity: 1, y: 0, transition: { duration: 0.18, ease: "easeOut" as const } },
    exit: { opacity: 0, transition: { duration: 0.12 } },
};
