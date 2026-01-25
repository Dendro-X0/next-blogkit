"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * ScrollReveal wraps its children in a div that animates when it enters the viewport.
 */
export function ScrollReveal({
    children,
    delay = 0,
    className = "",
    distance = "30px",
    duration = "0.8s",
    threshold = 0.1,
    once = true,
}: {
    children: ReactNode;
    delay?: number;
    className?: string;
    distance?: string;
    duration?: string;
    threshold?: number;
    once?: boolean;
}) {
    const [isVisible, setIsVisible] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    if (once) {
                        observer.unobserve(entry.target);
                    }
                } else if (!once) {
                    setIsVisible(false);
                }
            },
            { threshold }
        );

        const currentRef = ref.current;
        if (currentRef) {
            observer.observe(currentRef);
        }

        return () => {
            if (currentRef) {
                observer.unobserve(currentRef);
            }
        };
    }, [threshold, once]);

    return (
        <div
            ref={ref}
            className={className}
            style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? "translateY(0)" : `translateY(${distance})`,
                transition: `opacity ${duration} cubic-bezier(0.25, 0.46, 0.45, 0.94), transform ${duration} cubic-bezier(0.25, 0.46, 0.45, 0.94)`,
                transitionDelay: `${delay}ms`,
                willChange: "transform, opacity",
            }}
        >
            {children}
        </div>
    );
}
