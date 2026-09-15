#!/usr/bin/env node

import { createHash } from "node:crypto";
import { constants as fsConstants } from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const SERVICES = [
  "patios",
  "paving",
  "fencing",
  "decking",
  "brickwork",
  "landscaping",
  "garden-transformations",
  "unknown",
];

const SERVICE_FOLDERS = new Set([
  "patios",
  "paving",
  "fencing",
  "decking",
  "brickwork",
  "landscaping",
]);

const STAGES = ["before", "during", "after", "detail", "unknown"];
const QUALITIES = ["website-ready", "usable", "poor", "unknown"];
const GENERATED_DIRS = new Set(["jobs", "services", "_review", "_duplicates"]);
const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".heic"]);

const DEFAULT_CONFIG = {
  imagesRoot: "source-photos",
  dryRun: true,
  action: "copy",
  confidenceThreshold: 0.65,
  copyServices: false,
  classifier: "metadata",
  jobGapHours: 4,
  gpsSplitMeters: 750,
  allowMoveOriginals: false,
};

class IImageClassifier {
  async classify() {
    throw new Error("IImageClassifier.classify must be implemented by a subclass.");
  }
}

class MetadataOnlyImageClassifier extends IImageClassifier {
  async classify(image, job) {
    const haystack = `${image.relativePath} ${job.slug}`.toLowerCase();
    const service = scoreService(haystack);
    const stage = scoreStage(haystack, image.indexInJob, job.images.length);
    const quality = scoreQuality(image);
    const confidenceParts = [service.confidence, stage.confidence, quality.confidence];
    const confidence = round(confidenceParts.reduce((sum, part) => sum + part, 0) / confidenceParts.length);

    return {
      service: service.value,
      stage: stage.value,
      quality: quality.value,
      confidence,
      classifier: "metadata",
      reasons: [
        ...service.reasons,
        ...stage.reasons,
        ...quality.reasons,
        "Metadata-only classification is intentionally conservative.",
      ],
    };
  }
}

class OpenAIImageClassifier extends IImageClassifier {
  constructor(config) {
    super();
    this.config = config;
  }

  async classify() {
    return {
      service: "unknown",
      stage: "unknown",
      quality: "unknown",
      confidence: 0,
      classifier: "openai-placeholder",
      reasons: [
        "OpenAI image classification is a disabled placeholder. Configure and implement the provider before use.",
        "Expected output schema is structured JSON: service, stage, quality, confidence, reasons.",
      ],
    };
  }
}

class OllamaImageClassifier extends IImageClassifier {
  constructor(config) {
    super();
    this.config = config;
  }

  async classify() {
    return {
      service: "unknown",
      stage: "unknown",
      quality: "unknown",
      confidence: 0,
      classifier: "ollama-placeholder",
      reasons: [
        "Ollama image classification is a disabled placeholder. Configure and implement the provider before use.",
        "Expected output schema is structured JSON: service, stage, quality, confidence, reasons.",
      ],
    };
  }
}

async function main() {
  const cli = parseArgs(process.argv.slice(2));
  const config = await loadConfig(cli);
  validateConfig(config);

  const imagesRoot = path.resolve(process.cwd(), config.imagesRoot);
  const jsonReportPath = path.join(imagesRoot, "image-sort-plan.json");
  const markdownReportPath = path.join(imagesRoot, "image-sort-plan.md");

  const classifier = createClassifier(config);
  const scanned = await scanImages(imagesRoot);
  const images = await Promise.all(scanned.map((filePath) => buildImageRecord(filePath, imagesRoot)));
  const sortedImages = images.sort(compareImages);
  const jobs = groupImages(sortedImages, config);
  const exactDuplicates = findExactDuplicates(sortedImages);
  const nearDuplicates = findNearDuplicates(sortedImages);
  const plan = await buildPlan({
    config,
    imagesRoot,
    jobs,
    classifier,
    exactDuplicates,
    nearDuplicates,
  });

  if (!config.dryRun) {
    await executePlan(plan, config);
  }

  await writeReports(plan, jsonReportPath, markdownReportPath);

  console.log(
    `${config.dryRun ? "Dry run" : "Execution"} complete: ${plan.summary.imageCount} images, ${plan.summary.jobCount} jobs.`,
  );
  console.log(`JSON: ${path.relative(process.cwd(), jsonReportPath)}`);
  console.log(`Markdown: ${path.relative(process.cwd(), markdownReportPath)}`);
}

function parseArgs(args) {
  const parsed = {};

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (!arg.startsWith("--")) continue;

    const [rawKey, rawValue] = arg.slice(2).split("=");
    const key = normalizeArgKey(rawKey);
    const value = rawValue ?? args[i + 1];

    if (rawValue === undefined && value && !value.startsWith("--")) {
      i += 1;
    }

    if (key === "execute") {
      parsed.dryRun = false;
      continue;
    }

    if (key === "dryRun") {
      parsed.dryRun = parseBoolean(value);
      continue;
    }

    if (["copyServices", "allowMoveOriginals"].includes(key)) {
      parsed[key] = parseBoolean(value);
      continue;
    }

    if (key === "threshold") {
      parsed.confidenceThreshold = Number(value);
      continue;
    }

    if (key === "jobGapHours") {
      parsed.jobGapHours = Number(value);
      continue;
    }

    if (key === "gpsSplitMeters") {
      parsed.gpsSplitMeters = Number(value);
      continue;
    }

    parsed[key] = value === undefined || value.startsWith("--") ? true : value;
  }

  return parsed;
}

function normalizeArgKey(key) {
  return key.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
}

function parseBoolean(value) {
  if (typeof value === "boolean") return value;
  if (value === undefined) return true;
  return ["1", "true", "yes", "on"].includes(String(value).toLowerCase());
}

async function loadConfig(cli) {
  const configFile = cli.config ?? "image-sort.config.local.json";
  const fileConfig = await readJsonIfExists(path.resolve(process.cwd(), configFile));
  const envConfig = {
    dryRun: envBoolean("IMAGE_SORT_DRY_RUN"),
    action: process.env.IMAGE_SORT_ACTION,
    confidenceThreshold: envNumber("IMAGE_SORT_CONFIDENCE_THRESHOLD"),
    copyServices: envBoolean("IMAGE_SORT_COPY_SERVICES"),
    classifier: process.env.IMAGE_SORT_CLASSIFIER,
    jobGapHours: envNumber("IMAGE_SORT_JOB_GAP_HOURS"),
    gpsSplitMeters: envNumber("IMAGE_SORT_GPS_SPLIT_METERS"),
    allowMoveOriginals: envBoolean("IMAGE_SORT_ALLOW_MOVE_ORIGINALS"),
  };

  return compactObject({
    ...DEFAULT_CONFIG,
    ...fileConfig,
    ...compactObject(envConfig),
    ...cli,
  });
}

async function readJsonIfExists(filePath) {
  try {
    return JSON.parse(await fs.readFile(filePath, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") return {};
    throw error;
  }
}

function envBoolean(name) {
  return process.env[name] === undefined ? undefined : parseBoolean(process.env[name]);
}

function envNumber(name) {
  return process.env[name] === undefined ? undefined : Number(process.env[name]);
}

function compactObject(object) {
  return Object.fromEntries(Object.entries(object).filter(([, value]) => value !== undefined));
}

function validateConfig(config) {
  if (!["copy", "move"].includes(config.action)) {
    throw new Error("action must be either copy or move.");
  }

  if (config.action === "move" && !config.allowMoveOriginals) {
    throw new Error(
      "action=move is blocked by default to preserve original images. Use copy, or set allowMoveOriginals only after backing up the source folder.",
    );
  }

  if (config.confidenceThreshold < 0 || config.confidenceThreshold > 1) {
    throw new Error("confidenceThreshold must be between 0 and 1.");
  }

  if (!["metadata", "openai", "ollama"].includes(config.classifier)) {
    throw new Error("classifier must be metadata, openai, or ollama.");
  }
}

function createClassifier(config) {
  if (config.classifier === "openai") return new OpenAIImageClassifier(config);
  if (config.classifier === "ollama") return new OllamaImageClassifier(config);
  return new MetadataOnlyImageClassifier();
}

async function scanImages(imagesRoot) {
  const results = [];

  async function walk(directory) {
    const entries = await fs.readdir(directory, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(directory, entry.name);
      const relative = path.relative(imagesRoot, fullPath);
      const firstSegment = relative.split(path.sep)[0];

      if (entry.isDirectory()) {
        if (GENERATED_DIRS.has(firstSegment)) continue;
        await walk(fullPath);
        continue;
      }

      if (!entry.isFile()) continue;
      const extension = path.extname(entry.name).toLowerCase();
      if (IMAGE_EXTENSIONS.has(extension)) {
        results.push(fullPath);
      }
    }
  }

  await walk(imagesRoot);
  return results;
}

async function buildImageRecord(filePath, imagesRoot) {
  const stat = await fs.stat(filePath);
  const extension = path.extname(filePath).toLowerCase();
  const fileBuffer = await fs.readFile(filePath);
  const imageMetadata = readImageMetadata(fileBuffer, extension);
  const hash = sha1(fileBuffer);
  const filenameDate = dateFromFilename(path.basename(filePath));
  const bestDate =
    imageMetadata.exifDateTaken ??
    filenameDate?.toISOString() ??
    safeDate(stat.birthtime) ??
    safeDate(stat.mtime) ??
    null;

  return {
    sourcePath: filePath,
    relativePath: normalizePath(path.relative(imagesRoot, filePath)),
    filename: path.basename(filePath),
    basename: path.basename(filePath, extension),
    extension,
    size: stat.size,
    width: imageMetadata.width,
    height: imageMetadata.height,
    createdAt: safeDate(stat.birthtime),
    modifiedAt: safeDate(stat.mtime),
    exifDateTaken: imageMetadata.exifDateTaken,
    filenameDate: filenameDate?.toISOString() ?? null,
    bestDate,
    gps: imageMetadata.gps,
    hash,
    metadataWarnings: imageMetadata.warnings,
  };
}

function readImageMetadata(buffer, extension) {
  if (extension === ".jpg" || extension === ".jpeg") return readJpegMetadata(buffer);
  if (extension === ".png") return readPngMetadata(buffer);
  if (extension === ".webp") return readWebpMetadata(buffer);
  return {
    width: null,
    height: null,
    exifDateTaken: null,
    gps: null,
    warnings: ["HEIC dimensions and EXIF are not parsed by this dependency-free utility."],
  };
}

function readJpegMetadata(buffer) {
  const metadata = { width: null, height: null, exifDateTaken: null, gps: null, warnings: [] };
  if (buffer.length < 4 || buffer[0] !== 0xff || buffer[1] !== 0xd8) {
    metadata.warnings.push("Not a valid JPEG header.");
    return metadata;
  }

  let offset = 2;
  while (offset + 4 < buffer.length) {
    if (buffer[offset] !== 0xff) {
      offset += 1;
      continue;
    }

    const marker = buffer[offset + 1];
    if (marker === 0xda || marker === 0xd9) break;

    const segmentLength = buffer.readUInt16BE(offset + 2);
    const segmentStart = offset + 4;
    const segmentEnd = segmentStart + segmentLength - 2;
    if (segmentLength < 2 || segmentEnd > buffer.length) break;

    if (isSofMarker(marker) && segmentStart + 5 < segmentEnd) {
      metadata.height = buffer.readUInt16BE(segmentStart + 1);
      metadata.width = buffer.readUInt16BE(segmentStart + 3);
    }

    if (marker === 0xe1 && buffer.toString("ascii", segmentStart, segmentStart + 6) === "Exif\0\0") {
      const exif = parseExif(buffer.subarray(segmentStart + 6, segmentEnd));
      metadata.exifDateTaken = exif.exifDateTaken;
      metadata.gps = exif.gps;
      metadata.warnings.push(...exif.warnings);
    }

    offset = segmentEnd;
  }

  return metadata;
}

function isSofMarker(marker) {
  return [
    0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf,
  ].includes(marker);
}

function parseExif(buffer) {
  const warnings = [];
  if (buffer.length < 8) return { exifDateTaken: null, gps: null, warnings: ["EXIF block is too small."] };

  const byteOrder = buffer.toString("ascii", 0, 2);
  const littleEndian = byteOrder === "II";
  if (!littleEndian && byteOrder !== "MM") {
    return { exifDateTaken: null, gps: null, warnings: ["EXIF byte order is not recognised."] };
  }

  const readUInt16 = (offset) => (littleEndian ? buffer.readUInt16LE(offset) : buffer.readUInt16BE(offset));
  const readUInt32 = (offset) => (littleEndian ? buffer.readUInt32LE(offset) : buffer.readUInt32BE(offset));
  const firstIfdOffset = readUInt32(4);
  const ifd0 = parseIfd(buffer, firstIfdOffset, readUInt16, readUInt32, littleEndian, warnings);
  const exifIfd = ifd0.tags.get(0x8769);
  const gpsIfd = ifd0.tags.get(0x8825);
  const exif = exifIfd ? parseIfd(buffer, exifIfd.value, readUInt16, readUInt32, littleEndian, warnings) : null;
  const gps = gpsIfd ? parseGps(parseIfd(buffer, gpsIfd.value, readUInt16, readUInt32, littleEndian, warnings)) : null;
  const rawDate =
    exif?.tags.get(0x9003)?.value ??
    exif?.tags.get(0x9004)?.value ??
    ifd0.tags.get(0x0132)?.value ??
    null;

  return {
    exifDateTaken: rawDate ? parseExifDate(rawDate) : null,
    gps,
    warnings,
  };
}

function parseIfd(buffer, offset, readUInt16, readUInt32, littleEndian, warnings) {
  const tags = new Map();
  if (!Number.isFinite(offset) || offset < 0 || offset + 2 > buffer.length) {
    warnings.push("Invalid EXIF IFD offset.");
    return { tags };
  }

  const count = readUInt16(offset);
  for (let index = 0; index < count; index += 1) {
    const entryOffset = offset + 2 + index * 12;
    if (entryOffset + 12 > buffer.length) break;

    const tag = readUInt16(entryOffset);
    const type = readUInt16(entryOffset + 2);
    const countValue = readUInt32(entryOffset + 4);
    const valueOffset = entryOffset + 8;
    const value = readExifValue(buffer, type, countValue, valueOffset, readUInt16, readUInt32, littleEndian);
    tags.set(tag, { type, count: countValue, value });
  }

  return { tags };
}

function readExifValue(buffer, type, count, valueOffset, readUInt16, readUInt32, littleEndian) {
  const typeSizes = new Map([
    [1, 1],
    [2, 1],
    [3, 2],
    [4, 4],
    [5, 8],
    [7, 1],
    [9, 4],
    [10, 8],
  ]);
  const unitSize = typeSizes.get(type) ?? 1;
  const byteLength = unitSize * count;
  const actualOffset = byteLength <= 4 ? valueOffset : readUInt32(valueOffset);
  if (actualOffset < 0 || actualOffset + byteLength > buffer.length) return null;

  if (type === 2) {
    return buffer.toString("ascii", actualOffset, actualOffset + byteLength).replace(/\0+$/, "").trim();
  }

  if (type === 3) {
    return count === 1
      ? readUInt16(actualOffset)
      : Array.from({ length: count }, (_, i) => readUInt16(actualOffset + i * 2));
  }

  if (type === 4) {
    return count === 1
      ? readUInt32(actualOffset)
      : Array.from({ length: count }, (_, i) => readUInt32(actualOffset + i * 4));
  }

  if (type === 5) {
    const rational = (i) => {
      const numerator = readUInt32(actualOffset + i * 8);
      const denominator = readUInt32(actualOffset + i * 8 + 4);
      return denominator === 0 ? 0 : numerator / denominator;
    };
    return count === 1 ? rational(0) : Array.from({ length: count }, (_, i) => rational(i));
  }

  if (type === 1 || type === 7) {
    return count === 1 ? buffer[actualOffset] : Array.from(buffer.subarray(actualOffset, actualOffset + byteLength));
  }

  if (type === 9) {
    return littleEndian ? buffer.readInt32LE(actualOffset) : buffer.readInt32BE(actualOffset);
  }

  return null;
}

function parseGps(ifd) {
  const latitudeRef = ifd.tags.get(1)?.value;
  const latitudeParts = ifd.tags.get(2)?.value;
  const longitudeRef = ifd.tags.get(3)?.value;
  const longitudeParts = ifd.tags.get(4)?.value;

  if (!Array.isArray(latitudeParts) || !Array.isArray(longitudeParts)) return null;

  return {
    latitude: dmsToDecimal(latitudeParts, latitudeRef),
    longitude: dmsToDecimal(longitudeParts, longitudeRef),
  };
}

function dmsToDecimal(parts, ref) {
  const value = parts[0] + parts[1] / 60 + parts[2] / 3600;
  return ["S", "W"].includes(ref) ? -value : value;
}

function parseExifDate(value) {
  const match = String(value).match(/^(\d{4}):(\d{2}):(\d{2})[ T](\d{2}):(\d{2}):(\d{2})/);
  if (!match) return null;
  const [, year, month, day, hour, minute, second] = match.map(Number);
  const date = new Date(year, month - 1, day, hour, minute, second);
  return Number.isNaN(date.valueOf()) ? null : date.toISOString();
}

function readPngMetadata(buffer) {
  const pngSignature = "89504e470d0a1a0a";
  if (buffer.subarray(0, 8).toString("hex") !== pngSignature || buffer.toString("ascii", 12, 16) !== "IHDR") {
    return { width: null, height: null, exifDateTaken: null, gps: null, warnings: ["Not a valid PNG header."] };
  }

  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
    exifDateTaken: null,
    gps: null,
    warnings: [],
  };
}

function readWebpMetadata(buffer) {
  const metadata = { width: null, height: null, exifDateTaken: null, gps: null, warnings: [] };
  if (buffer.toString("ascii", 0, 4) !== "RIFF" || buffer.toString("ascii", 8, 12) !== "WEBP") {
    metadata.warnings.push("Not a valid WebP header.");
    return metadata;
  }

  const chunkType = buffer.toString("ascii", 12, 16);
  if (chunkType === "VP8X" && buffer.length >= 30) {
    metadata.width = 1 + buffer.readUIntLE(24, 3);
    metadata.height = 1 + buffer.readUIntLE(27, 3);
  } else if (chunkType === "VP8 " && buffer.length >= 30) {
    metadata.width = buffer.readUInt16LE(26) & 0x3fff;
    metadata.height = buffer.readUInt16LE(28) & 0x3fff;
  } else if (chunkType === "VP8L" && buffer.length >= 25) {
    const bits = buffer.readUInt32LE(21);
    metadata.width = (bits & 0x3fff) + 1;
    metadata.height = ((bits >> 14) & 0x3fff) + 1;
  } else {
    metadata.warnings.push("WebP dimensions could not be parsed.");
  }

  return metadata;
}

function dateFromFilename(filename) {
  const matches = filename.match(/\b(\d{10})\b/g);
  if (!matches) return null;

  for (const value of matches.reverse()) {
    const seconds = Number(value);
    const date = new Date(seconds * 1000);
    if (date.getUTCFullYear() >= 2000 && date.getUTCFullYear() <= 2035) {
      return date;
    }
  }

  return null;
}

function compareImages(a, b) {
  const aTime = a.bestDate ? Date.parse(a.bestDate) : 0;
  const bTime = b.bestDate ? Date.parse(b.bestDate) : 0;
  if (aTime !== bTime) return aTime - bTime;
  return a.relativePath.localeCompare(b.relativePath);
}

function groupImages(images, config) {
  const jobs = [];
  let current = null;
  let jobNumber = 0;
  const maxGapMs = config.jobGapHours * 60 * 60 * 1000;

  for (const image of images) {
    const imageTime = image.bestDate ? Date.parse(image.bestDate) : null;
    const previous = current?.images.at(-1);
    const previousTime = previous?.bestDate ? Date.parse(previous.bestDate) : null;
    const timeGap = imageTime !== null && previousTime !== null ? imageTime - previousTime : 0;
    const gpsGap =
      previous?.gps && image.gps ? distanceMeters(previous.gps, image.gps) > config.gpsSplitMeters : false;
    const shouldStartJob = !current || timeGap > maxGapMs || gpsGap;

    if (shouldStartJob) {
      jobNumber += 1;
      current = {
        number: jobNumber,
        slug: createJobSlug(image.bestDate, jobNumber),
        startDate: image.bestDate,
        endDate: image.bestDate,
        images: [],
      };
      jobs.push(current);
    }

    image.indexInJob = current.images.length;
    current.images.push(image);
    current.endDate = image.bestDate ?? current.endDate;
  }

  return jobs;
}

function createJobSlug(dateValue, jobNumber) {
  const date = dateValue ? new Date(dateValue) : null;
  const datePart = date && !Number.isNaN(date.valueOf()) ? date.toISOString().slice(0, 10) : "unknown-date";
  return safeSlug(`${datePart}-job-${String(jobNumber).padStart(2, "0")}`);
}

function scoreService(haystack) {
  const patterns = [
    ["patios", /\b(patio|porcelain|sandstone|limestone|terrace)\b/],
    ["paving", /\b(paving|paver|path|drive|driveway|block[- ]?pav)\b/],
    ["fencing", /\b(fence|fencing|gate|boundary|screen)\b/],
    ["decking", /\b(deck|decking|composite)\b/],
    ["brickwork", /\b(brick|wall|planter|step|retaining)\b/],
    ["garden-transformations", /\b(transformation|makeover|renovation|full[- ]?garden)\b/],
    ["landscaping", /\b(landscape|landscaping|garden|turf|lawn|planting)\b/],
  ];

  for (const [value, pattern] of patterns) {
    if (pattern.test(haystack)) {
      return { value, confidence: 0.75, reasons: [`Matched ${value} keyword from path or filename.`] };
    }
  }

  return { value: "unknown", confidence: 0.2, reasons: ["No service keywords found in path or filename."] };
}

function scoreStage(haystack, indexInJob, jobSize) {
  const patterns = [
    ["before", /\b(before|pre|start|old)\b/],
    ["during", /\b(during|progress|prep|dig|base|install|build)\b/],
    ["after", /\b(after|complete|finished|final)\b/],
    ["detail", /\b(detail|close|joint|edge|finish)\b/],
  ];

  for (const [value, pattern] of patterns) {
    if (pattern.test(haystack)) {
      return { value, confidence: 0.8, reasons: [`Matched ${value} stage keyword from path or filename.`] };
    }
  }

  if (jobSize >= 8) {
    const ratio = indexInJob / Math.max(jobSize - 1, 1);
    if (ratio <= 0.12) {
      return { value: "before", confidence: 0.45, reasons: ["Early position in job sequence suggests before."] };
    }
    if (ratio >= 0.82) {
      return { value: "after", confidence: 0.45, reasons: ["Late position in job sequence suggests after."] };
    }
  }

  return { value: "unknown", confidence: 0.25, reasons: ["No reliable stage signal found."] };
}

function scoreQuality(image) {
  const megapixels = image.width && image.height ? (image.width * image.height) / 1_000_000 : null;

  if (!megapixels) {
    return { value: "unknown", confidence: 0.25, reasons: ["No dimensions available for quality scoring."] };
  }

  if (image.width >= 1200 && image.height >= 800 && megapixels >= 1) {
    return { value: "website-ready", confidence: 0.8, reasons: ["Image dimensions are suitable for website use."] };
  }

  if (image.width >= 800 && image.height >= 600) {
    return { value: "usable", confidence: 0.65, reasons: ["Image dimensions are usable but not ideal for hero use."] };
  }

  return { value: "poor", confidence: 0.75, reasons: ["Image dimensions are small for website use."] };
}

async function buildPlan({ config, imagesRoot, jobs, classifier, exactDuplicates, nearDuplicates }) {
  const plannedJobs = [];
  const actions = [];
  let reviewCount = 0;
  let serviceCopyCount = 0;

  for (const job of jobs) {
    const jobPlan = {
      slug: job.slug,
      startDate: job.startDate,
      endDate: job.endDate,
      imageCount: job.images.length,
      images: [],
    };

    for (const image of job.images) {
      const classification = normalizeClassification(await classifier.classify(image, job));
      const needsReview =
        classification.confidence < config.confidenceThreshold ||
        classification.stage === "unknown" ||
        classification.quality === "poor";
      const jobStageFolder = needsReview ? "_review" : classification.stage;
      const jobDestination = await destinationFor({
        imagesRoot,
        folderParts: ["jobs", job.slug, jobStageFolder],
        image,
      });
      const imageActions = [
        {
          type: config.action,
          target: normalizePath(path.relative(imagesRoot, jobDestination.path)),
          absoluteTarget: jobDestination.path,
          status: jobDestination.status,
          reason: needsReview ? "Needs human review before publishing." : "Confident enough for staged job folder.",
        },
      ];

      if (needsReview) reviewCount += 1;

      if (
        config.copyServices &&
        SERVICE_FOLDERS.has(classification.service) &&
        ["website-ready", "usable"].includes(classification.quality) &&
        ["after", "detail"].includes(classification.stage) &&
        classification.confidence >= config.confidenceThreshold
      ) {
        const serviceDestination = await destinationFor({
          imagesRoot,
          folderParts: ["services", classification.service],
          image,
        });
        imageActions.push({
          type: "copy",
          target: normalizePath(path.relative(imagesRoot, serviceDestination.path)),
          absoluteTarget: serviceDestination.path,
          status: serviceDestination.status,
          reason: "Optional service gallery candidate.",
        });
        serviceCopyCount += 1;
      }

      const imagePlan = {
        ...image,
        classification,
        actions: imageActions,
      };

      jobPlan.images.push(imagePlan);
      actions.push(...imageActions.map((action) => ({ sourcePath: image.sourcePath, sourceHash: image.hash, ...action })));
    }

    plannedJobs.push(jobPlan);
  }

  const imageCount = jobs.reduce((sum, job) => sum + job.images.length, 0);
  const destinationCount = actions.filter((action) => action.status !== "exists-identical-skip").length;

  return {
    generatedAt: new Date().toISOString(),
    mode: config.dryRun ? "dry-run" : "execute",
    config: {
      imagesRoot: normalizePath(path.relative(process.cwd(), imagesRoot)),
      dryRun: config.dryRun,
      action: config.action,
      confidenceThreshold: config.confidenceThreshold,
      copyServices: config.copyServices,
      classifier: config.classifier,
      jobGapHours: config.jobGapHours,
      gpsSplitMeters: config.gpsSplitMeters,
    },
    summary: {
      imageCount,
      jobCount: plannedJobs.length,
      reviewCount,
      destinationCount,
      serviceCopyCount,
      exactDuplicateGroupCount: exactDuplicates.length,
      nearDuplicateGroupCount: nearDuplicates.length,
    },
    duplicates: {
      exact: exactDuplicates,
      near: nearDuplicates,
    },
    jobs: plannedJobs,
    actions,
  };
}

function normalizeClassification(classification) {
  return {
    service: SERVICES.includes(classification.service) ? classification.service : "unknown",
    stage: STAGES.includes(classification.stage) ? classification.stage : "unknown",
    quality: QUALITIES.includes(classification.quality) ? classification.quality : "unknown",
    confidence: clamp(Number(classification.confidence) || 0, 0, 1),
    classifier: classification.classifier ?? "unknown",
    reasons: Array.isArray(classification.reasons) ? classification.reasons : [],
  };
}

async function destinationFor({ imagesRoot, folderParts, image }) {
  const folder = path.join(imagesRoot, ...folderParts);
  const safeBase = safeSlug(image.basename) || image.hash.slice(0, 12);
  const target = path.join(folder, `${safeBase}${image.extension}`);
  const uniquePath = await resolveNonOverwritingTarget(target, image.hash);

  return uniquePath;
}

async function resolveNonOverwritingTarget(target, sourceHash) {
  const extension = path.extname(target);
  const base = target.slice(0, -extension.length);
  const sourceHashShort = sourceHash.slice(0, 10);
  const candidates = [target, `${base}-${sourceHashShort}${extension}`];

  for (const candidate of candidates) {
    const existingHash = await hashFileIfExists(candidate);
    if (!existingHash) return { path: candidate, status: "planned" };
    if (existingHash === sourceHash) return { path: candidate, status: "exists-identical-skip" };
  }

  let index = 2;
  while (index < 1000) {
    const candidate = `${base}-${sourceHashShort}-${index}${extension}`;
    const existingHash = await hashFileIfExists(candidate);
    if (!existingHash) return { path: candidate, status: "planned" };
    if (existingHash === sourceHash) return { path: candidate, status: "exists-identical-skip" };
    index += 1;
  }

  throw new Error(`Could not find a safe destination for ${target}`);
}

async function executePlan(plan, config) {
  const orderedActions = [...plan.actions].sort((a, b) => {
    if (a.type === b.type) return 0;
    return a.type === "move" ? 1 : -1;
  });

  for (const action of orderedActions) {
    if (action.status === "exists-identical-skip") continue;

    await fs.mkdir(path.dirname(action.absoluteTarget), { recursive: true });

    if (action.type === "copy") {
      await fs.copyFile(action.sourcePath, action.absoluteTarget, fsConstants.COPYFILE_EXCL);
      continue;
    }

    if (action.type === "move") {
      if (!config.allowMoveOriginals) {
        throw new Error("Refusing to move originals without allowMoveOriginals.");
      }
      await fs.rename(action.sourcePath, action.absoluteTarget);
    }
  }
}

async function writeReports(plan, jsonReportPath, markdownReportPath) {
  await fs.writeFile(jsonReportPath, `${JSON.stringify(stripAbsolutePaths(plan), null, 2)}\n`, "utf8");
  await fs.writeFile(markdownReportPath, markdownReport(plan), "utf8");
}

function stripAbsolutePaths(plan) {
  return {
    ...plan,
    jobs: plan.jobs.map((job) => ({
      ...job,
      images: job.images.map(({ sourcePath, actions, ...image }) => ({
        ...image,
        actions: actions.map(({ absoluteTarget, ...action }) => action),
      })),
    })),
    actions: plan.actions.map(({ absoluteTarget, ...action }) => action),
  };
}

function markdownReport(plan) {
  const lines = [
    "# Image Sort Plan",
    "",
    `Generated: ${plan.generatedAt}`,
    `Mode: ${plan.mode}`,
    `Images scanned: ${plan.summary.imageCount}`,
    `Likely jobs: ${plan.summary.jobCount}`,
    `Images needing review: ${plan.summary.reviewCount}`,
    `Planned destinations: ${plan.summary.destinationCount}`,
    `Exact duplicate groups: ${plan.summary.exactDuplicateGroupCount}`,
    `Near duplicate groups: ${plan.summary.nearDuplicateGroupCount}`,
    "",
    "## Settings",
    "",
    `- dryRun: ${plan.config.dryRun}`,
    `- action: ${plan.config.action}`,
    `- confidenceThreshold: ${plan.config.confidenceThreshold}`,
    `- copyServices: ${plan.config.copyServices}`,
    `- classifier: ${plan.config.classifier}`,
    "",
  ];

  if (plan.duplicates.exact.length > 0) {
    lines.push("## Exact Duplicates", "");
    for (const group of plan.duplicates.exact) {
      lines.push(`- ${group.hash.slice(0, 12)}: ${group.files.join(", ")}`);
    }
    lines.push("");
  }

  if (plan.duplicates.near.length > 0) {
    lines.push("## Possible Near Duplicates", "");
    for (const group of plan.duplicates.near.slice(0, 25)) {
      lines.push(`- ${group.key}: ${group.files.join(", ")}`);
    }
    if (plan.duplicates.near.length > 25) lines.push(`- ...${plan.duplicates.near.length - 25} more groups`);
    lines.push("");
  }

  lines.push("## Jobs", "");
  for (const job of plan.jobs) {
    lines.push(`### ${job.slug}`);
    lines.push("");
    lines.push(`Dates: ${job.startDate ?? "unknown"} to ${job.endDate ?? "unknown"}`);
    lines.push(`Images: ${job.imageCount}`);
    lines.push("");
    lines.push("| File | Service | Stage | Quality | Confidence | Destination |");
    lines.push("| --- | --- | --- | --- | ---: | --- |");

    for (const image of job.images) {
      const destination = image.actions.map((action) => `${action.target} (${action.status})`).join("<br>");
      lines.push(
        `| ${escapeMarkdown(image.relativePath)} | ${image.classification.service} | ${image.classification.stage} | ${image.classification.quality} | ${image.classification.confidence.toFixed(2)} | ${escapeMarkdown(destination)} |`,
      );
    }

    lines.push("");
  }

  return `${lines.join("\n")}\n`;
}

function findExactDuplicates(images) {
  const groups = new Map();
  for (const image of images) {
    const group = groups.get(image.hash) ?? [];
    group.push(image.relativePath);
    groups.set(image.hash, group);
  }

  return Array.from(groups.entries())
    .filter(([, files]) => files.length > 1)
    .map(([hash, files]) => ({ hash, files }));
}

function findNearDuplicates(images) {
  const groups = new Map();
  for (const image of images) {
    if (!image.width || !image.height || !image.bestDate) continue;
    const minuteBucket = Math.floor(Date.parse(image.bestDate) / 60000);
    const key = `${image.size}:${image.width}x${image.height}:${minuteBucket}`;
    const group = groups.get(key) ?? [];
    group.push(image.relativePath);
    groups.set(key, group);
  }

  return Array.from(groups.entries())
    .filter(([, files]) => files.length > 1)
    .map(([key, files]) => ({ key, files }));
}

function safeDate(date) {
  return date instanceof Date && !Number.isNaN(date.valueOf()) ? date.toISOString() : null;
}

function safeSlug(value) {
  return String(value)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-")
    .slice(0, 80);
}

function sha1(buffer) {
  return createHash("sha1").update(buffer).digest("hex");
}

async function hashFileIfExists(filePath) {
  try {
    return sha1(await fs.readFile(filePath));
  } catch (error) {
    if (error.code === "ENOENT") return null;
    throw error;
  }
}

function normalizePath(value) {
  return value.split(path.sep).join("/");
}

function distanceMeters(a, b) {
  const radius = 6_371_000;
  const lat1 = toRadians(a.latitude);
  const lat2 = toRadians(b.latitude);
  const deltaLat = toRadians(b.latitude - a.latitude);
  const deltaLon = toRadians(b.longitude - a.longitude);
  const h =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLon / 2) ** 2;
  return 2 * radius * Math.asin(Math.sqrt(h));
}

function toRadians(value) {
  return (value * Math.PI) / 180;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function round(value) {
  return Math.round(value * 100) / 100;
}

function escapeMarkdown(value) {
  return String(value).replace(/\|/g, "\\|");
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
