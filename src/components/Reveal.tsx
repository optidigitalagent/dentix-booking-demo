import { useEffect, useRef, useState } from "react";

export function useReveal<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setShown(true);
            io.disconnect();
          }
        });
      },
      { threshold: 0.12 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return { ref, className: shown ? "reveal-up in" : "reveal-up" };
}

export function Reveal({
  children,
  delay = 0,
  as: Tag = "div",
  className = "",
  ...rest
}: {
  children: React.ReactNode;
  delay?: number;
  as?: React.ElementType;
  className?: string;
} & Record<string, unknown>) {
  const { ref, className: revealClass } = useReveal<HTMLDivElement>();
  return (
    <Tag
      ref={ref}
      className={`${revealClass} ${className}`.trim()}
      style={{ ["--d" as string]: `${delay}ms` }}
      {...rest}
    >
      {children}
    </Tag>
  );
}
