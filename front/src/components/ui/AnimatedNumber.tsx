import { useEffect, useRef } from "react";
import { animate, useInView, useReducedMotion } from "motion/react";

interface AnimatedNumberProps {
    value: number;
    format: (n: number) => string;
    className?: string;
}

const AnimatedNumber = ({ value, format, className }: AnimatedNumberProps) => {
    const ref = useRef<HTMLSpanElement>(null);
    const inView = useInView(ref, { once: true });
    const reduce = useReducedMotion();
    const from = useRef(0);

    useEffect(() => {
        const node = ref.current;
        if (!node || !inView) return;
        if (reduce) {
            node.textContent = format(value);
            return;
        }
        const controls = animate(from.current, value, {
            duration: 1.1,
            ease: [0.16, 1, 0.3, 1],
            onUpdate: (v) => {
                node.textContent = format(v);
            },
        });
        from.current = value;
        return () => controls.stop();
    }, [value, inView, reduce, format]);

    return (
        <span ref={ref} className={`tabular-nums ${className ?? ""}`}>
            {format(0)}
        </span>
    );
};

export default AnimatedNumber;
