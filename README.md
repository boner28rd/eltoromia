# Eltoromia Website

## Local Image Sorting Utility

Run a dry-run scan of `source-photos`:

```bash
npm run sort:images
```

The utility scans supported source images recursively (`.jpg`, `.jpeg`, `.png`, `.webp`, `.heic`) and ignores generated folders:

- `source-photos/jobs`
- `source-photos/services`
- `source-photos/_review`
- `source-photos/_duplicates`

It writes:

- `source-photos/image-sort-plan.json`
- `source-photos/image-sort-plan.md`

Defaults are deliberately safe:

- `dryRun: true`
- `action: copy`
- existing destination images are not overwritten
- original images are left in place
- low-confidence or unknown-stage images go to each job's `_review` folder when executed

Execute the copy plan after reviewing the reports:

```bash
npm run sort:images -- --execute
```

Copy selected good `after` or `detail` images into service folders as well:

```bash
npm run sort:images -- --execute --copyServices true
```

Useful options:

```bash
npm run sort:images -- --dryRun true --action copy --threshold 0.65
npm run sort:images -- --jobGapHours 4 --gpsSplitMeters 750
npm run sort:images -- --classifier metadata
```

You can also create `image-sort.config.local.json` in the project root. Keep provider keys out of source control.

```json
{
  "dryRun": true,
  "action": "copy",
  "confidenceThreshold": 0.65,
  "copyServices": false,
  "classifier": "metadata"
}
```

Environment variables override config:

- `IMAGE_SORT_DRY_RUN`
- `IMAGE_SORT_ACTION`
- `IMAGE_SORT_CONFIDENCE_THRESHOLD`
- `IMAGE_SORT_COPY_SERVICES`
- `IMAGE_SORT_CLASSIFIER`
- `IMAGE_SORT_JOB_GAP_HOURS`
- `IMAGE_SORT_GPS_SPLIT_METERS`

`openai` and `ollama` classifiers are present as disabled placeholders behind the classifier setting. They return structured JSON-shaped results only and do not hardcode API keys.

`action: "move"` is recognised but blocked unless `allowMoveOriginals` or `IMAGE_SORT_ALLOW_MOVE_ORIGINALS` is explicitly enabled. Keep the default `copy` action for this project unless the source folder has been backed up.

## Local Image Classification Utility

Run the review-folder classifier:

```bash
npm run classify:images
```

It scans only:

```text
source-photos/jobs/*/_review
```

For each job folder it writes:

- `classification-report.json`

It also writes:

- `source-photos/jobs/classification-summary.md`

The classifier does not move, rename, delete, copy, or overwrite image files. Report writes are create-only, so if a report already exists the command stops instead of replacing it.

Default configuration lives in `appsettings.json`:

```json
{
  "ClassificationProvider": "Metadata"
}
```

You can also use a local `.env` file:

```bash
CLASSIFICATION_PROVIDER=Metadata
JOBS_ROOT=source-photos/jobs
REVIEW_FOLDER_NAME=_review
CONFIDENCE_THRESHOLD=0.65
```

`MetadataImageClassifier` is the active provider. It is conservative: it uses folder names, filenames, image dimensions, and review-sequence position to suggest category, service tags, stage, quality, title, slug, and folder naming.

`OpenAIImageClassifier` is included in the provider architecture but intentionally disabled. To enable it later, set `ClassificationProvider` to `OpenAI`, add an explicit implementation that sends each image with the allowed category/tag/stage/quality schema, and keep API keys in `.env`.

`Ollama` is reserved as a future provider value. Add an Ollama classifier behind the same `IImageClassifier` shape so the reports keep the same JSON schema.

## Photography

The site ships only the images it actually renders. They live in `public/` and are
WebP, generated from the originals:

- `public/images/projects/<project-id>/` - before / during / after shots per project,
  each at a full size and a `-sm` size used by the gallery cards
- `public/images/services/` - one card image and one hero per service
- `public/images/site/` - page heroes and the About imagery

The original full-size job photographs are **not** in `public/`. They live in
`source-photos/` so they are not copied into `dist/` and not served publicly:

- `source-photos/jobs/<date>-job-NN/_review/` - originals grouped by upload batch
- `source-photos/unsorted/` - the raw dump the sorter reads from

Keep it that way. Putting the originals back under `public/` adds roughly 145 MB
to every deploy and publishes customers' unedited garden photos at guessable URLs.

`src/data/projects.json` is generated content but is edited by hand from here on -
it holds the curated selection, the ordering of each gallery and the written copy
for every project.
