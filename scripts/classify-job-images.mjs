#!/usr/bin/env node

import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const PRIMARY_CATEGORIES = [
  "patios",
  "paving",
  "fencing",
  "decking",
  "brickwork",
  "driveways",
  "garden-transformations",
  "retaining-walls",
  "artificial-grass",
  "turfing",
  "landscaping",
  "outdoor-living",
  "pergolas",
  "drainage",
  "mixed-project",
  "unknown",
];

const SERVICE_TAGS = [
  "porcelain-patio",
  "sandstone-patio",
  "block-paving",
  "resin-driveway",
  "gravel-driveway",
  "sleeper-installation",
  "fencing-panel",
  "feather-edge-fencing",
  "composite-decking",
  "timber-decking",
  "garden-wall",
  "brickwork",
  "steps",
  "pathways",
  "raised-beds",
  "turf",
  "artificial-grass",
  "planting",
  "lighting",
  "pergola",
  "gazebo",
  "outdoor-kitchen",
  "garden-room",
  "drainage",
  "excavation",
  "groundworks",
];

const STAGES = ["before", "during", "after", "detail", "unknown"];
const QUALITIES = ["hero", "gallery", "usable", "poor"];
const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif", ".heic"]);

const DEFAULT_CONFIG = {
  ClassificationProvider: "Metadata",
  JobsRoot: "source-photos/jobs",
  ReviewFolderName: "_review",
  ConfidenceThreshold: 0.65,
};

const SERVICE_RULES = [
  {
    tag: "porcelain-patio",
    category: "patios",
    title: "Modern Porcelain Patio Installation",
    pattern: /\b(porcelain|porcelain[-_ ]?patio)\b/i,
  },
  {
    tag: "sandstone-patio",
    category: "patios",
    title: "Natural Sandstone Patio Installation",
    pattern: /\b(sandstone|indian[-_ ]?stone|natural[-_ ]?stone|patio)\b/i,
  },
  {
    tag: "block-paving",
    category: "driveways",
    title: "Block Paving Driveway Installation",
    pattern: /\b(block[-_ ]?pav|block[-_ ]?paving)\b/i,
  },
  {
    tag: "resin-driveway",
    category: "driveways",
    title: "Resin Driveway Installation",
    pattern: /\b(resin|resin[-_ ]?drive)\b/i,
  },
  {
    tag: "gravel-driveway",
    category: "driveways",
    title: "Gravel Driveway Installation",
    pattern: /\b(gravel|shingle[-_ ]?drive)\b/i,
  },
  {
    tag: "sleeper-installation",
    category: "retaining-walls",
    title: "Sleeper Retaining Wall Installation",
    pattern: /\b(sleeper|railway[-_ ]?sleeper)\b/i,
  },
  {
    tag: "fencing-panel",
    category: "fencing",
    title: "Garden Fencing Installation",
    pattern: /\b(fence|fencing|panel[-_ ]?fenc)\b/i,
  },
  {
    tag: "feather-edge-fencing",
    category: "fencing",
    title: "Feather Edge Fencing Installation",
    pattern: /\b(feather[-_ ]?edge|closeboard)\b/i,
  },
  {
    tag: "composite-decking",
    category: "decking",
    title: "Composite Decking Installation",
    pattern: /\b(composite[-_ ]?deck|composite)\b/i,
  },
  {
    tag: "timber-decking",
    category: "decking",
    title: "Timber Decking Installation",
    pattern: /\b(timber[-_ ]?deck|wood[-_ ]?deck|decking)\b/i,
  },
  {
    tag: "garden-wall",
    category: "brickwork",
    title: "Garden Wall Construction",
    pattern: /\b(garden[-_ ]?wall|walling)\b/i,
  },
  {
    tag: "brickwork",
    category: "brickwork",
    title: "Brickwork Landscaping Project",
    pattern: /\b(brick|brickwork)\b/i,
  },
  { tag: "steps", category: "landscaping", title: "Garden Steps Installation", pattern: /\b(steps?|stair)\b/i },
  { tag: "pathways", category: "paving", title: "Garden Pathway Installation", pattern: /\b(path|pathway|walkway)\b/i },
  {
    tag: "raised-beds",
    category: "landscaping",
    title: "Raised Garden Bed Installation",
    pattern: /\b(raised[-_ ]?bed|planter)\b/i,
  },
  { tag: "turf", category: "turfing", title: "Fresh Turf Lawn Installation", pattern: /\b(turf|lawn)\b/i },
  {
    tag: "artificial-grass",
    category: "artificial-grass",
    title: "Artificial Grass Installation",
    pattern: /\b(artificial[-_ ]?grass|fake[-_ ]?grass|astro)\b/i,
  },
  { tag: "planting", category: "landscaping", title: "Garden Planting Scheme", pattern: /\b(planting|plants?|border)\b/i },
  { tag: "lighting", category: "outdoor-living", title: "Garden Lighting Installation", pattern: /\b(lighting|lights?)\b/i },
  { tag: "pergola", category: "pergolas", title: "Garden Pergola Installation", pattern: /\b(pergola)\b/i },
  { tag: "gazebo", category: "outdoor-living", title: "Garden Gazebo Installation", pattern: /\b(gazebo)\b/i },
  {
    tag: "outdoor-kitchen",
    category: "outdoor-living",
    title: "Outdoor Kitchen Installation",
    pattern: /\b(outdoor[-_ ]?kitchen|bbq)\b/i,
  },
  {
    tag: "garden-room",
    category: "outdoor-living",
    title: "Garden Room Landscaping Project",
    pattern: /\b(garden[-_ ]?room|summerhouse)\b/i,
  },
  { tag: "drainage", category: "drainage", title: "Garden Drainage Installation", pattern: /\b(drain|drainage|soakaway)\b/i },
  { tag: "excavation", category: "landscaping", title: "Garden Excavation Works", pattern: /\b(excavat|dig[-_ ]?out|digger)\b/i },
  { tag: "groundworks", category: "landscaping", title: "Garden Groundworks Project", pattern: /\b(groundworks?|sub[-_ ]?base|type[-_ ]?1)\b/i },
];

const CATEGORY_LABELS = Object.fromEntries(PRIMARY_CATEGORIES.map((value) => [value, toTitle(value)]));
const SERVICE_LABELS = Object.fromEntries(SERVICE_TAGS.map((value) => [value, toTitle(value)]));

class IImageClassifier {
  async classifyImage() {
    throw new Error("IImageClassifier.classifyImage must be implemented.");
  }

  async classifyJob() {
    throw new Error("IImageClassifier.classifyJob must be implemented.");
  }
}

class MetadataImageClassifier extends IImageClassifier {
  async classifyImage(image, job) {
    const text = `${job.jobFolder} ${image.file}`.toLowerCase();
    const serviceMatches = SERVICE_RULES.filter((rule) => rule.pattern.test(text));
    const serviceTags = unique(serviceMatches.map((rule) => rule.tag)).filter((tag) => SERVICE_TAGS.includes(tag));
    const primaryCategory = choosePrimaryCategory(serviceMatches);
    const stage = classifyStage(text, image.index, job.images.length);
    const quality = classifyQuality(image, stage.value);
    const confidence = round(
      average([
        serviceMatches.length > 0 ? 0.76 : 0.24,
        stage.confidence,
        quality.confidence,
        image.width && image.height ? 0.72 : 0.3,
      ]),
    );

    return {
      file: image.file,
      primaryCategory,
      serviceTags,
      stage: stage.value,
      quality: quality.value,
      confidence,
      width: image.width,
      height: image.height,
      bytes: image.bytes,
      hash: image.hash,
      reasons: [
        ...serviceMatches.map((rule) => `Matched ${rule.tag} from filename or folder metadata.`),
        serviceMatches.length === 0 ? "No category keywords found in folder or filename metadata." : null,
        stage.reason,
        quality.reason,
      ].filter(Boolean),
    };
  }

  async classifyJob(job, imageClassifications) {
    const serviceTags = unique(imageClassifications.flatMap((image) => image.serviceTags));
    const categoryVotes = countValues(imageClassifications.map((image) => image.primaryCategory));
    const primaryCategory = chooseCategoryFromVotes(categoryVotes, serviceTags);
    const matchedRules = SERVICE_RULES.filter((rule) => serviceTags.includes(rule.tag));
    const title = chooseTitle(primaryCategory, matchedRules);
    const confidence = round(
      average([
        average(imageClassifications.map((image) => image.confidence)),
        primaryCategory === "unknown" ? 0.24 : 0.78,
        serviceTags.length > 0 ? 0.74 : 0.28,
      ]),
    );
    const datePrefix = job.jobFolder.match(/^\d{4}-\d{2}-\d{2}/)?.[0] ?? "undated";

    return {
      suggestedJobTitle: title,
      suggestedSlug: safeSlug(title),
      suggestedFolderName: safeSlug(`${datePrefix}-${title}`),
      primaryCategory,
      serviceTags,
      confidence,
      reviewRequired:
        confidence < job.config.ConfidenceThreshold ||
        primaryCategory === "unknown" ||
        serviceTags.length === 0 ||
        imageClassifications.some((image) => image.stage === "unknown" || image.quality === "poor"),
    };
  }
}

class OpenAIImageClassifier extends IImageClassifier {
  constructor(config) {
    super();
    this.config = config;
  }

  async classifyImage() {
    throw new Error(
      "OpenAIImageClassifier is present but disabled. Set ClassificationProvider to Metadata, or implement and explicitly enable OpenAI image calls.",
    );
  }

  async classifyJob() {
    throw new Error(
      "OpenAIImageClassifier is present but disabled. See README.md for the future provider notes.",
    );
  }
}

async function main() {
  const cli = parseArgs(process.argv.slice(2));
  const config = await loadConfig(cli);
  validateConfig(config);

  const jobsRoot = path.resolve(process.cwd(), config.JobsRoot);
  const classifier = createClassifier(config);
  const jobs = await scanReviewJobs(jobsRoot, config);
  const reports = [];

  for (const job of jobs) {
    const imageClassifications = [];
    for (const image of job.images) {
      imageClassifications.push(await classifier.classifyImage(image, job));
    }

    const jobClassification = await classifier.classifyJob(job, imageClassifications);
    const report = {
      jobFolder: job.jobFolder,
      reviewFolder: normalizePath(path.relative(process.cwd(), job.reviewFolder)),
      classificationProvider: config.ClassificationProvider,
      generatedAt: new Date().toISOString(),
      ...jobClassification,
      images: imageClassifications.map(({ reasons, ...image }) => image),
      imageDetails: imageClassifications,
    };

    const reportPath = path.join(job.jobFolderPath, "classification-report.json");
    await writeNewFile(reportPath, `${JSON.stringify(report, null, 2)}\n`);
    reports.push({ reportPath, ...report });
  }

  const summaryPath = path.join(jobsRoot, "classification-summary.md");
  await writeNewFile(summaryPath, renderSummary(reports));

  console.log(`Classified ${reports.length} job folders.`);
  console.log(`Summary: ${normalizePath(path.relative(process.cwd(), summaryPath))}`);
}

function parseArgs(args) {
  const parsed = {};

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (!arg.startsWith("--")) continue;

    const [rawKey, rawValue] = arg.slice(2).split("=");
    const key = normalizeConfigKey(rawKey);
    const next = args[index + 1];
    const value = rawValue ?? (next && !next.startsWith("--") ? next : true);
    if (rawValue === undefined && value === next) index += 1;
    parsed[key] = value;
  }

  return parsed;
}

function normalizeConfigKey(key) {
  const normalized = key.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
  if (normalized === "provider" || normalized === "classificationProvider") return "ClassificationProvider";
  if (normalized === "jobsRoot") return "JobsRoot";
  if (normalized === "reviewFolderName") return "ReviewFolderName";
  if (normalized === "confidenceThreshold") return "ConfidenceThreshold";
  return normalized;
}

async function loadConfig(cli) {
  const appsettings = await readJsonIfExists(path.resolve(process.cwd(), "appsettings.json"));
  const dotEnv = await readDotEnv(path.resolve(process.cwd(), ".env"));
  const env = { ...dotEnv, ...process.env };

  return {
    ...DEFAULT_CONFIG,
    ...pickConfig(appsettings),
    ...pickConfig({
      ClassificationProvider: env.ClassificationProvider ?? env.CLASSIFICATION_PROVIDER,
      JobsRoot: env.JobsRoot ?? env.JOBS_ROOT,
      ReviewFolderName: env.ReviewFolderName ?? env.REVIEW_FOLDER_NAME,
      ConfidenceThreshold: env.ConfidenceThreshold ?? env.CONFIDENCE_THRESHOLD,
    }),
    ...pickConfig(cli),
  };
}

async function readJsonIfExists(filePath) {
  try {
    return JSON.parse(await fs.readFile(filePath, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") return {};
    throw error;
  }
}

async function readDotEnv(filePath) {
  try {
    const text = await fs.readFile(filePath, "utf8");
    return Object.fromEntries(
      text
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => line && !line.startsWith("#") && line.includes("="))
        .map((line) => {
          const index = line.indexOf("=");
          const key = line.slice(0, index).trim();
          const value = line.slice(index + 1).trim().replace(/^['"]|['"]$/g, "");
          return [key, value];
        }),
    );
  } catch (error) {
    if (error.code === "ENOENT") return {};
    throw error;
  }
}

function pickConfig(input) {
  return Object.fromEntries(
    Object.entries(input)
      .filter(([, value]) => value !== undefined && value !== "")
      .map(([key, value]) => [key, key === "ConfidenceThreshold" ? Number(value) : value]),
  );
}

function validateConfig(config) {
  const provider = String(config.ClassificationProvider);
  if (!["Metadata", "OpenAI", "Ollama"].includes(provider)) {
    throw new Error("ClassificationProvider must be Metadata, OpenAI, or Ollama.");
  }

  if (!Number.isFinite(config.ConfidenceThreshold) || config.ConfidenceThreshold < 0 || config.ConfidenceThreshold > 1) {
    throw new Error("ConfidenceThreshold must be a number between 0 and 1.");
  }
}

function createClassifier(config) {
  if (config.ClassificationProvider === "OpenAI") return new OpenAIImageClassifier(config);
  if (config.ClassificationProvider === "Ollama") {
    throw new Error("Ollama classification is reserved as a future provider. Use ClassificationProvider: Metadata.");
  }
  return new MetadataImageClassifier();
}

async function scanReviewJobs(jobsRoot, config) {
  const entries = await fs.readdir(jobsRoot, { withFileTypes: true });
  const jobs = [];

  for (const entry of entries) {
    if (!entry.isDirectory() || entry.name.startsWith("_")) continue;

    const jobFolderPath = path.join(jobsRoot, entry.name);
    const reviewFolder = path.join(jobFolderPath, config.ReviewFolderName);
    if (!(await pathExists(reviewFolder))) continue;

    const files = (await fs.readdir(reviewFolder, { withFileTypes: true }))
      .filter((file) => file.isFile() && IMAGE_EXTENSIONS.has(path.extname(file.name).toLowerCase()))
      .map((file) => path.join(reviewFolder, file.name));

    const images = (await Promise.all(files.map((filePath) => buildImageRecord(filePath, reviewFolder))))
      .sort(compareImages)
      .map((image, index) => ({ ...image, index }));

    jobs.push({
      jobFolder: entry.name,
      jobFolderPath,
      reviewFolder,
      images,
      config,
    });
  }

  return jobs.sort((a, b) => a.jobFolder.localeCompare(b.jobFolder));
}

async function buildImageRecord(filePath, reviewFolder) {
  const stat = await fs.stat(filePath);
  const buffer = await fs.readFile(filePath);
  const extension = path.extname(filePath).toLowerCase();
  const metadata = readImageMetadata(buffer, extension);
  const file = path.basename(filePath);
  const filenameDate = dateFromFilename(file);

  return {
    file,
    relativePath: normalizePath(path.relative(reviewFolder, filePath)),
    extension,
    bytes: stat.size,
    width: metadata.width,
    height: metadata.height,
    filenameDate: filenameDate?.toISOString() ?? null,
    modifiedAt: stat.mtime.toISOString(),
    hash: createHash("sha1").update(buffer).digest("hex"),
  };
}

function compareImages(a, b) {
  const aTime = Date.parse(a.filenameDate ?? a.modifiedAt);
  const bTime = Date.parse(b.filenameDate ?? b.modifiedAt);
  if (aTime !== bTime) return aTime - bTime;
  return a.file.localeCompare(b.file);
}

function readImageMetadata(buffer, extension) {
  if (extension === ".jpg" || extension === ".jpeg") return readJpegDimensions(buffer);
  if (extension === ".png") return readPngDimensions(buffer);
  if (extension === ".webp") return readWebpDimensions(buffer);
  return { width: null, height: null };
}

function readJpegDimensions(buffer) {
  if (buffer.length < 4 || buffer[0] !== 0xff || buffer[1] !== 0xd8) return { width: null, height: null };

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

    if (isJpegSof(marker) && segmentStart + 5 < segmentEnd) {
      return {
        height: buffer.readUInt16BE(segmentStart + 1),
        width: buffer.readUInt16BE(segmentStart + 3),
      };
    }

    offset = segmentEnd;
  }

  return { width: null, height: null };
}

function isJpegSof(marker) {
  return [
    0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf,
  ].includes(marker);
}

function readPngDimensions(buffer) {
  const pngSignature = "89504e470d0a1a0a";
  if (buffer.subarray(0, 8).toString("hex") !== pngSignature || buffer.toString("ascii", 12, 16) !== "IHDR") {
    return { width: null, height: null };
  }

  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
  };
}

function readWebpDimensions(buffer) {
  if (buffer.toString("ascii", 0, 4) !== "RIFF" || buffer.toString("ascii", 8, 12) !== "WEBP") {
    return { width: null, height: null };
  }

  const chunkType = buffer.toString("ascii", 12, 16);
  if (chunkType === "VP8X" && buffer.length >= 30) {
    return { width: 1 + buffer.readUIntLE(24, 3), height: 1 + buffer.readUIntLE(27, 3) };
  }

  if (chunkType === "VP8 " && buffer.length >= 30) {
    return { width: buffer.readUInt16LE(26) & 0x3fff, height: buffer.readUInt16LE(28) & 0x3fff };
  }

  if (chunkType === "VP8L" && buffer.length >= 25) {
    const bits = buffer.readUInt32LE(21);
    return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
  }

  return { width: null, height: null };
}

function dateFromFilename(filename) {
  const matches = filename.match(/\b(\d{10})\b/g);
  if (!matches) return null;

  for (const value of matches.reverse()) {
    const seconds = Number(value);
    const date = new Date(seconds * 1000);
    if (date.getUTCFullYear() >= 2000 && date.getUTCFullYear() <= 2035) return date;
  }

  return null;
}

function classifyStage(text, index, total) {
  const keywordStages = [
    ["before", /\b(before|pre|old|start)\b/i],
    ["during", /\b(during|progress|prep|dig|base|install|build)\b/i],
    ["after", /\b(after|complete|finished|final)\b/i],
    ["detail", /\b(detail|close[-_ ]?up|joint|edge|finish)\b/i],
  ];

  for (const [stage, pattern] of keywordStages) {
    if (pattern.test(text)) return { value: stage, confidence: 0.82, reason: `Matched ${stage} stage keyword.` };
  }

  if (total <= 1) return { value: "unknown", confidence: 0.25, reason: "Only one image; sequence stage is unknown." };

  const ratio = index / Math.max(total - 1, 1);
  if (ratio <= 0.16) return { value: "before", confidence: 0.55, reason: "Early position in review sequence suggests before." };
  if (ratio >= 0.78) return { value: "after", confidence: 0.55, reason: "Late position in review sequence suggests after." };
  return { value: "during", confidence: 0.5, reason: "Middle position in review sequence suggests during." };
}

function classifyQuality(image, stage) {
  if (!image.width || !image.height) {
    return { value: "usable", confidence: 0.35, reason: "Dimensions unavailable; marked usable for manual review." };
  }

  const megapixels = (image.width * image.height) / 1_000_000;
  const landscape = image.width >= image.height;

  if (landscape && megapixels >= 1.4 && image.width >= 1400 && ["after", "detail"].includes(stage)) {
    return { value: "hero", confidence: 0.78, reason: "Large landscape image from a likely finished/detail stage." };
  }

  if (megapixels >= 1 && image.width >= 1000 && image.height >= 700) {
    return { value: "gallery", confidence: 0.76, reason: "Resolution is suitable for a gallery image." };
  }

  if (image.width >= 700 && image.height >= 500) {
    return { value: "usable", confidence: 0.68, reason: "Resolution is usable but not ideal for prominent placement." };
  }

  return { value: "poor", confidence: 0.8, reason: "Resolution is small for website use." };
}

function choosePrimaryCategory(rules) {
  if (rules.length === 0) return "unknown";

  const categories = unique(rules.map((rule) => rule.category));
  if (categories.length > 1) return "mixed-project";
  return PRIMARY_CATEGORIES.includes(categories[0]) ? categories[0] : "unknown";
}

function chooseCategoryFromVotes(votes, serviceTags) {
  const meaningfulVotes = Object.entries(votes).filter(([category]) => category !== "unknown");
  if (meaningfulVotes.length > 1) return "mixed-project";
  if (meaningfulVotes.length === 1) return meaningfulVotes[0][0];

  const matchedRules = SERVICE_RULES.filter((rule) => serviceTags.includes(rule.tag));
  return choosePrimaryCategory(matchedRules);
}

function chooseTitle(primaryCategory, matchedRules) {
  if (matchedRules.length === 1) return matchedRules[0].title;
  if (matchedRules.length > 1 || primaryCategory === "mixed-project") return "Complete Garden Transformation";
  if (primaryCategory !== "unknown") return `${CATEGORY_LABELS[primaryCategory]} Project`;
  return "Landscaping Project Review";
}

function renderSummary(reports) {
  const lines = ["# Job Summary", ""];

  for (const report of reports) {
    const heroImages = report.images.filter((image) => image.quality === "hero").map((image) => image.file);

    lines.push(`## ${report.jobFolder}`, "");
    lines.push("Suggested title:");
    lines.push(report.suggestedJobTitle, "");
    lines.push("Suggested folder naming:");
    lines.push(report.suggestedFolderName, "");
    lines.push("Primary category:");
    lines.push(CATEGORY_LABELS[report.primaryCategory] ?? toTitle(report.primaryCategory), "");
    lines.push("Services:");
    if (report.serviceTags.length === 0) {
      lines.push("- Unknown");
    } else {
      for (const service of report.serviceTags) lines.push(`- ${SERVICE_LABELS[service] ?? toTitle(service)}`);
    }
    lines.push("");
    lines.push("Confidence:");
    lines.push(`${Math.round(report.confidence * 100)}%`, "");
    lines.push("Hero images:");
    if (heroImages.length === 0) {
      lines.push("- None");
    } else {
      for (const image of heroImages) lines.push(`- ${image}`);
    }
    lines.push("");
    lines.push("Review required:");
    lines.push(report.reviewRequired ? "Yes" : "No", "");
  }

  return `${lines.join("\n")}\n`;
}

async function writeNewFile(filePath, contents) {
  try {
    await fs.writeFile(filePath, contents, { encoding: "utf8", flag: "wx" });
  } catch (error) {
    if (error.code === "EEXIST") {
      throw new Error(`Refusing to overwrite existing report: ${normalizePath(path.relative(process.cwd(), filePath))}`);
    }
    throw error;
  }
}

async function pathExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

function countValues(values) {
  const counts = {};
  for (const value of values) counts[value] = (counts[value] ?? 0) + 1;
  return counts;
}

function unique(values) {
  return [...new Set(values)];
}

function average(values) {
  const finite = values.filter((value) => Number.isFinite(value));
  if (finite.length === 0) return 0;
  return finite.reduce((sum, value) => sum + value, 0) / finite.length;
}

function round(value) {
  return Math.round(value * 100) / 100;
}

function safeSlug(value) {
  return String(value)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-")
    .slice(0, 90);
}

function toTitle(value) {
  return String(value)
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function normalizePath(value) {
  return value.split(path.sep).join("/");
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
