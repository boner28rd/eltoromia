# Eltoromia

Marketing site for **Eltoromia** — landscape and garden maintenance, Esher, Surrey.
React + Vite + Tailwind, no backend.

```bash
npm install
npm run dev      # http://127.0.0.1:5173
npm run build    # -> dist/  (~62 MB, almost all of it photography)
npm run preview
```

## Content

All copy and data live in `src/data/` as JSON. There is no CMS; edit the JSON.

| File | Holds |
| --- | --- |
| `company.json` | Name, contact details, service areas, story, values, process, SEO |
| `services.json` | The 12 services, each with copy, benefits, process and FAQs |
| `projects.json` | The 41 projects and their photo galleries |
| `reviews.json` | 33 customer reviews |
| `faq.json` | Site-wide FAQs |
| `stats.json`, `social-links.json`, `navigation.json` | Supporting bits |
| `imports/bark/` | Raw Bark profile extraction — the provenance for the company data above. Reference only; nothing imports it at runtime. |

## Photography

**Every photograph on this site is the company's own work.** There is no stock
imagery, and none should be added — the site's copy explicitly claims this.

Images are WebP, committed under `public/images/`:

- `projects/<project-id>/` — `before-*`, `during-*`, `after-*`, each at a full
  size and a `-sm` size used by the gallery cards
- `services/` — a card image, a `-sm` card image and a `-hero` per service
- `site/` — page heroes and the About imagery

The original full-size job photographs are **not** in this repo. They are the
master archive (~145 MB, 610 files) and live outside it, alongside the
photo-sorting scripts that group them. Keep them backed up separately.

### Adding a project

1. Pick the photographs and render WebP derivatives into
   `public/images/projects/<new-id>/` following the naming above.
2. Add an entry to `src/data/projects.json`. `image`/`thumb` are the card cover;
   `beforeImage`/`afterImage` drive the drag-to-compare slider and the
   "Before & after" badge; `gallery` is the ordered lightbox sequence.
3. Set `serviceSlug` to a slug that exists in `services.json` so the project
   appears on that service's page.

Keep descriptions to what is actually visible in the photographs — materials,
edge details, what was excavated. The projects deliberately claim no locations,
durations or dates, because that information does not exist in the source
photographs and inventing it would be a lie in the shop window.

## Components worth knowing

- `sections/ProjectsGrid.jsx` — filterable grid plus the lightbox (thumbnail
  strip, arrow keys, Escape to close)
- `sections/BeforeAfter.jsx` — drag-to-compare slider; the handle is a range
  input so it works with a keyboard and a screen reader
- `sections/ContactForm.jsx` — **no backend.** Composes a pre-filled `mailto:`
  to the address in `company.json`. If a form endpoint is ever added, replace
  `handleSubmit` and nothing else. Do not make it silently discard enquiries.

## Before this goes live

- Confirm the contact details in `company.json` with Jamie. They were read off
  the company's own advertising board and the Bark profile, not given directly.
- Check `faq.json` items 2 and 6 — they promise a "structured design pack" and a
  "written workmanship guarantee". Both are unverified.
