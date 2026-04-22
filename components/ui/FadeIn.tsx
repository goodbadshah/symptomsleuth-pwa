"use client";

import { useEffect, useRef, useState } from "react";

interface FadeInProps {
  children: React.ReactNode;
  delay?: number; // ms - for stagger support
  className?: string;
}

export default function FadeIn({ children, delay = 0, className = "" }: FadeInProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Delay fires once, then we stop observing
          const timer = setTimeout(() => setVisible(true), delay);
          observer.unobserve(el);
          return () => clearTimeout(timer);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [delay]);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        transform: visible ? "translateY(0)" : "translateY(2rem)",
        filter: visible ? "blur(0)" : "blur(4px)",
        opacity: visible ? 1 : 0,
        transition: visible
          ? "transform 600ms cubic-bezier(0.32, 0.72, 0, 1), filter 600ms cubic-bezier(0.32, 0.72, 0, 1), opacity 600ms cubic-bezier(0.32, 0.72, 0, 1)"
          : "none",
      }}
    >
      {children}
    </div>
  );
}
