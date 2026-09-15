import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

function ProjectModal({ project, onClose }) {
  const [index, setIndex] = useState(0);
  const closeRef = useRef(null);

  const gallery = project?.gallery || [];
  const count = gallery.length;

  useEffect(() => {
    setIndex(0);
  }, [project?.id]);

  useEffect(() => {
    if (!project) return undefined;
    closeRef.current?.focus();
    const onKey = (event) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowRight") setIndex((i) => (i + 1) % count);
      if (event.key === "ArrowLeft") setIndex((i) => (i - 1 + count) % count);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [project, count, onClose]);

  if (!project) return null;
  const current = gallery[index];

  return (
    <div
      className="fixed inset-0 z-[70] grid place-items-center bg-forest-900/85 p-3 backdrop-blur-sm sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="project-modal-title"
      onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}
    >
      <div className="max-h-[92vh] w-full max-w-5xl overflow-auto rounded-lg bg-paper shadow-lift">
        <div className="relative bg-charcoal">
          <img src={current.src} alt={`${project.title} - ${current.label.toLowerCase()}`} className="mx-auto max-h-[58vh] w-full object-contain" />

          <span className="absolute left-4 top-4 rounded-full bg-white/95 px-4 py-1.5 text-xs font-extrabold uppercase tracking-[0.16em] text-forest-900">
            {current.label}
          </span>

          <button ref={closeRef} onClick={onClose} className="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-full bg-white text-charcoal shadow" aria-label="Close project details">
            <X className="h-5 w-5" />
          </button>

          {count > 1 && (
            <>
              <button onClick={() => setIndex((i) => (i - 1 + count) % count)} className="absolute left-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-charcoal shadow transition hover:bg-white" aria-label="Previous photo">
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button onClick={() => setIndex((i) => (i + 1) % count)} className="absolute right-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-charcoal shadow transition hover:bg-white" aria-label="Next photo">
                <ChevronRight className="h-5 w-5" />
              </button>
              <span className="absolute bottom-4 right-4 rounded-full bg-charcoal/70 px-3 py-1 text-xs font-bold text-white">{index + 1} / {count}</span>
            </>
          )}
        </div>

        {count > 1 && (
          <div className="flex gap-2 overflow-x-auto bg-charcoal/90 px-3 py-3">
            {gallery.map((shot, i) => (
              <button
                key={shot.src}
                onClick={() => setIndex(i)}
                className={`relative h-16 w-20 shrink-0 overflow-hidden rounded ring-2 transition ${i === index ? "ring-clay" : "ring-transparent opacity-60 hover:opacity-100"}`}
                aria-label={`Show photo ${i + 1}, ${shot.label.toLowerCase()}`}
                aria-current={i === index}
              >
                <img src={shot.thumb} alt="" className="h-full w-full object-cover" loading="lazy" />
              </button>
            ))}
          </div>
        )}

        <div className="grid gap-8 p-6 md:grid-cols-[1.2fr_0.8fr] md:p-8">
          <div>
            <p className="eyebrow">{project.category}</p>
            <h2 id="project-modal-title" className="mt-3 font-display text-3xl font-extrabold">{project.title}</h2>
            <p className="body-lead mt-4">{project.summary}</p>
            <p className="mt-4 leading-8 text-charcoal/70">{project.details}</p>
          </div>
          <div className="rounded-lg bg-white p-5">
            <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-clay">What the job involved</p>
            <ul className="mt-4 grid gap-3">
              {project.highlights.map((highlight) => (
                <li key={highlight} className="rounded-md bg-paper px-4 py-3 font-semibold text-charcoal/75">{highlight}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProjectsGrid({ projects, categories, masonry = false, limit }) {
  const [filter, setFilter] = useState("All");
  const [selected, setSelected] = useState(null);

  const filtered = useMemo(
    () => projects.filter((project) => filter === "All" || project.category === filter),
    [projects, filter]
  );
  const visible = limit ? filtered.slice(0, limit) : filtered;

  return (
    <>
      {categories && (
        <div className="mb-10 flex flex-wrap gap-3">
          {categories.map((category) => {
            const total = category === "All" ? projects.length : projects.filter((p) => p.category === category).length;
            if (!total) return null;
            return (
              <button key={category} onClick={() => setFilter(category)} aria-pressed={filter === category} className={`rounded-full px-5 py-2.5 text-sm font-extrabold transition ${filter === category ? "bg-forest-900 text-white" : "bg-white text-charcoal/70 hover:bg-forest-50"}`}>
                {category} <span className={filter === category ? "text-white/60" : "text-charcoal/40"}>{total}</span>
              </button>
            );
          })}
        </div>
      )}

      <div className={masonry ? "masonry" : "grid gap-6 md:grid-cols-2 lg:grid-cols-3"}>
        {visible.map((project) => (
          <button key={project.id} onClick={() => setSelected(project)} className="group block w-full overflow-hidden rounded-lg bg-white text-left shadow-sm ring-1 ring-charcoal/10 transition hover:-translate-y-1 hover:shadow-premium">
            <div className="relative overflow-hidden">
              <img src={project.thumb} alt={project.title} loading="lazy" className={`${masonry ? "h-auto min-h-72" : "h-72"} w-full object-cover transition duration-700 group-hover:scale-105`} />
              <div className="absolute inset-0 bg-gradient-to-t from-forest-900/85 via-forest-900/20 to-transparent opacity-90" />
              {project.beforeImage && project.afterImage && (
                <span className="absolute right-4 top-4 rounded-full bg-clay px-3 py-1 text-xs font-extrabold uppercase tracking-[0.14em] text-white">Before &amp; after</span>
              )}
              <div className="absolute bottom-0 p-5 text-white">
                <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-wheat">{project.category} - {project.gallery.length} photos</p>
                <h3 className="mt-2 font-display text-2xl font-extrabold">{project.title}</h3>
              </div>
            </div>
            <p className="p-5 leading-7 text-charcoal/70">{project.summary}</p>
          </button>
        ))}
      </div>

      {!visible.length && <p className="text-charcoal/60">No projects in this category yet.</p>}

      <ProjectModal project={selected} onClose={() => setSelected(null)} />
    </>
  );
}
