import { useCallback, useEffect, useRef, useState } from "react";
import ButtonLink from "../ui/ButtonLink.jsx";
import { asset } from "../../utils/asset.js";

/**
 * Drag-to-reveal comparison of the same garden before and after.
 * The handle is a range input so it works with keyboard and screen readers
 * as well as pointer drags.
 */
export default function BeforeAfter({ project, eyebrow = "Before and after" }) {
  const [position, setPosition] = useState(50);
  const frameRef = useRef(null);
  const draggingRef = useRef(false);

  const setFromClientX = useCallback((clientX) => {
    const frame = frameRef.current;
    if (!frame) return;
    const { left, width } = frame.getBoundingClientRect();
    setPosition(Math.min(100, Math.max(0, ((clientX - left) / width) * 100)));
  }, []);

  useEffect(() => {
    const onMove = (event) => {
      if (!draggingRef.current) return;
      setFromClientX(event.clientX);
    };
    const stop = () => { draggingRef.current = false; };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", stop);
    window.addEventListener("pointercancel", stop);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", stop);
      window.removeEventListener("pointercancel", stop);
    };
  }, [setFromClientX]);

  if (!project?.beforeImage || !project?.afterImage) return null;

  return (
    <section className="section-padding bg-white">
      <div className="container-page">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <div>
            <p className="eyebrow">{eyebrow}</p>
            <h2 className="heading-lg mt-4">{project.title}</h2>
            <p className="body-lead mt-5">{project.summary}</p>
            <ul className="mt-6 grid gap-2">
              {project.highlights.slice(0, 3).map((highlight) => (
                <li key={highlight} className="font-semibold text-charcoal/70">- {highlight}</li>
              ))}
            </ul>
            <ButtonLink to="/projects" variant="ghost" className="mt-8">See more of our work</ButtonLink>
          </div>

          <figure className="m-0">
            <div
              ref={frameRef}
              className="relative aspect-[4/3] w-full touch-pan-y select-none overflow-hidden rounded-lg bg-charcoal"
              onPointerDown={(event) => { draggingRef.current = true; setFromClientX(event.clientX); }}
            >
              <img src={asset(project.afterImage)} alt={`${project.title}, after`} className="absolute inset-0 h-full w-full object-cover" draggable="false" />
              {/* Clipped rather than width-constrained, so the before shot never squashes as the handle moves. */}
              <img
                src={asset(project.beforeImage)}
                alt={`${project.title}, before`}
                className="absolute inset-0 h-full w-full object-cover"
                style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
                draggable="false"
              />

              <span className="pointer-events-none absolute left-4 top-4 rounded-full bg-white/95 px-4 py-1.5 text-xs font-extrabold uppercase tracking-[0.16em] text-forest-900">Before</span>
              <span className="pointer-events-none absolute right-4 top-4 rounded-full bg-forest-900/90 px-4 py-1.5 text-xs font-extrabold uppercase tracking-[0.16em] text-white">After</span>

              <div className="pointer-events-none absolute inset-y-0 w-0.5 bg-white shadow" style={{ left: `${position}%` }}>
                <span className="absolute top-1/2 grid h-11 w-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white text-base font-black text-forest-900 shadow-lift">&#8596;</span>
              </div>

              <input
                type="range"
                min="0"
                max="100"
                value={Math.round(position)}
                onChange={(event) => setPosition(Number(event.target.value))}
                aria-label={`Reveal the before and after of ${project.title}`}
                className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0"
              />
            </div>
            <figcaption className="mt-3 text-sm text-charcoal/55">Drag the handle, or use the arrow keys, to compare.</figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}
