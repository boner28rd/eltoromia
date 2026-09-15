import { useEffect, useRef, useState } from "react";
import stats from "../../data/stats.json";

function Counter({ value, suffix }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      const start = performance.now();
      const duration = 1100;
      const tick = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setCount(value * eased);
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      observer.disconnect();
    }, { threshold: 0.25 });

    observer.observe(node);
    return () => observer.disconnect();
  }, [value]);

  const decimals = Number.isInteger(value) ? 0 : 1;
  return <span ref={ref}>{count.toFixed(decimals)}{suffix}</span>;
}

export default function StatsBand({ items = stats }) {
  return (
    <section className="bg-forest-900 py-12 text-white">
      <div className="container-page grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => (
          <div key={item.label} className="border-l border-white/15 pl-5">
            <p className="font-display text-4xl font-extrabold sm:text-5xl"><Counter value={item.value} suffix={item.suffix} /></p>
            <p className="mt-2 text-sm font-semibold uppercase tracking-[0.16em] text-white/60">{item.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
