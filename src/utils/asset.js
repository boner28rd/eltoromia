/**
 * Resolve a public-folder path against the deployment base.
 *
 * Image paths live in src/data/*.json as runtime strings like
 * "/images/projects/x/after-1.webp". Vite's `base` only rewrites URLs it can
 * see at build time (imports, CSS url()), so these would 404 on any deployment
 * that is not served from the domain root - a GitHub project Page, for example,
 * serves from /<repo>/.
 *
 * Every <img src> in the app must go through this.
 */
export function asset(path) {
  if (!path) return path;
  if (/^(https?:)?\/\//.test(path) || path.startsWith("data:")) return path;

  const base = import.meta.env.BASE_URL || "/";
  return `${base.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Same, but absolute - Open Graph images must be fully qualified URLs. */
export function absoluteAsset(path) {
  const resolved = asset(path);
  if (!resolved || /^https?:/.test(resolved)) return resolved;
  return typeof window === "undefined" ? resolved : new URL(resolved, window.location.origin).href;
}
