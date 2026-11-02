import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

/**
 * One headline figure. `tone` is any colour token — the project-status tokens
 * in particular — and sets the card's top rule.
 *
 * Pass `animated` to count up the value on scroll entry and show a live-data dot.
 */
export function StatCard({ label, value, note, noteTone, tone, animated }: {
  label: ReactNode; value: ReactNode; note?: ReactNode; noteTone?: "up" | "pending"; tone?: string; animated?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(!animated);

  useEffect(() => {
    if (!animated) return;
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); observer.disconnect(); } },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [animated]);

  return (
    <div
      ref={ref}
      className={`stat-card${animated ? " stat-animated" : ""}${animated && inView ? " stat-in-view" : ""}`}
      style={tone ? ({ "--stat-tone": tone } as CSSProperties) : undefined}
    >
      {animated && <span className="stat-live-dot" aria-label="Live data" />}
      <div className="stat-label">{label}</div>
      <div className="stat-value">
        {animated ? <AnimatedNumber value={value} inView={inView} /> : value}
      </div>
      {note && <div className={`stat-change${noteTone ? ` ${noteTone}` : ""}`}>{note}</div>}
    </div>
  );
}


interface ParsedNumber {
  raw: ReactNode;
  prefix: string;
  targetNum: number;
  suffix: string;
  decimals: number;
}

function parseStatValue(val: ReactNode): ParsedNumber | null {
  if (typeof val === "number") {
    return {
      raw: val,
      prefix: "",
      targetNum: val,
      suffix: "",
      decimals: Number.isInteger(val) ? 0 : 1,
    };
  }
  if (typeof val === "string") {
    const match = val.match(/^([^0-9.-]*)([0-9]+(?:\.[0-9]+)?)(.*)$/);
    if (match) {
      return {
        raw: val,
        prefix: match[1],
        targetNum: parseFloat(match[2]),
        suffix: match[3],
        decimals: match[2].includes(".") ? (match[2].split(".")[1]?.length ?? 0) : 0,
      };
    }
  }
  return null;
}

function easeOutExpo(x: number): number {
  return x === 1 ? 1 : 1 - Math.pow(2, -10 * x);
}

function AnimatedNumber({
  value,
  inView,
  delay = 0,
  duration = 1200,
}: {
  value: ReactNode;
  inView: boolean;
  delay?: number;
  duration?: number;
}) {
  const parsed = parseStatValue(value);
  const [displayValue, setDisplayValue] = useState<ReactNode>(() => {
    if (parsed) {
      return `${parsed.prefix}0${parsed.suffix}`;
    }
    return value;
  });

  useEffect(() => {
    if (!parsed) {
      setDisplayValue(value);
      return;
    }

    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDisplayValue(value);
      return;
    }

    if (!inView) {
      setDisplayValue(`${parsed.prefix}0${parsed.suffix}`);
      return;
    }

    let rafId: number;
    let startTimestamp: number | null = null;
    let timeoutId: ReturnType<typeof setTimeout>;

    timeoutId = setTimeout(() => {
      const step = (timestamp: number) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const elapsed = timestamp - startTimestamp;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = easeOutExpo(progress);

        const currentNum = parsed.targetNum * easedProgress;
        const formattedNum = parsed.decimals > 0
          ? currentNum.toFixed(parsed.decimals)
          : Math.round(currentNum).toString();

        setDisplayValue(`${parsed.prefix}${formattedNum}${parsed.suffix}`);

        if (progress < 1) {
          rafId = requestAnimationFrame(step);
        } else {
          setDisplayValue(value);
        }
      };

      rafId = requestAnimationFrame(step);
    }, delay);

    return () => {
      clearTimeout(timeoutId);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [inView, value, delay, duration]);

  return <>{displayValue}</>;
}

/** The slate counter band from the S&B home page: large sky figures on slate. */
export function StatBand({
  items,
  children,
  animated = false,
}: {
  items: { value: ReactNode; label: ReactNode }[];
  children?: ReactNode;
  animated?: boolean;
}) {
  const bandRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(!animated);

  useEffect(() => {
    if (!animated) return;
    const el = bandRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setInView(true);
          } else {
            if (entry.boundingClientRect.top > window.innerHeight || entry.boundingClientRect.bottom < 0) {
              setInView(false);
            }
          }
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -30px 0px" }
    );

    observer.observe(el);

    const handleScroll = () => {
      const rect = el.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const progress = Math.min(1, Math.max(0, (windowHeight - rect.top) / (windowHeight + rect.height)));
      el.style.setProperty("--scroll-progress", progress.toFixed(3));
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", handleScroll);
    };
  }, [animated]);

  return (
    <div
      ref={bandRef}
      className={`band on-inverse${animated ? " animated" : ""}${inView ? " in-view" : ""}`}
    >
      <div className="band-stats">
        {items.map((item, i) => (
          <div
            key={i}
            className="band-stat-item"
            style={animated ? ({ transitionDelay: `${i * 100}ms` } as CSSProperties) : undefined}
          >
            <div className="band-stat-value">
              {animated ? (
                <AnimatedNumber value={item.value} inView={inView} delay={i * 100} />
              ) : (
                item.value
              )}
            </div>
            <div className="band-stat-label">{item.label}</div>
          </div>
        ))}
      </div>
      {children && <div style={{ display: "flex", justifyContent: "center", marginTop: "var(--space-8)" }}>{children}</div>}
    </div>
  );
}
