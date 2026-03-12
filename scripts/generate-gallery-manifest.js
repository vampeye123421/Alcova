#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

const ROOT_DIR = path.resolve(__dirname, "..");
const IMAGES_DIR = path.join(ROOT_DIR, "images");
const OUTPUT_DIR = path.join(ROOT_DIR, "data");
const OUTPUT_FILE = path.join(OUTPUT_DIR, "gallery-manifest.json");

const ALLOWED_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif"]);
const EXCLUDED_FILES = new Set(["logo.png", "qr-menu.svg"]);
const CAPTION_OVERRIDES = {
    "2024-09-11.jpg": "Atmosfera serale",
    "buono.jpeg": "Sapori mediterranei",
    "caption.jpg": "Bancone Alcova",
    "donuts.jpeg": "Angolo dolce",
    "drink.jpg": "Cocktail signature",
    "food1.jpg": "Colazione salata",
    "img-20250530-wa0014.jpg": "Team Alcova",
    "insalata.jpeg": "Piatti freschi",
    "lounge.jpg": "Sala interna",
    "menu.jpg": "Piatti della casa",
    "tania_cornetto.jpeg": "Colazione con stile",
    "tania.jpg": "Accoglienza",
    "team.jpg": "Tania e Francesco"
};

function isGalleryImage(fileName) {
    const lowerName = fileName.toLowerCase();
    if (EXCLUDED_FILES.has(lowerName)) {
        return false;
    }

    return ALLOWED_EXTENSIONS.has(path.extname(lowerName));
}

function toTitleCase(value) {
    return value
        .split(" ")
        .filter(Boolean)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}

function getCaptionFromFileName(fileName) {
    const lowerName = fileName.toLowerCase();
    if (CAPTION_OVERRIDES[lowerName]) {
        return CAPTION_OVERRIDES[lowerName];
    }

    const baseName = path.basename(fileName, path.extname(fileName));
    const normalized = baseName
        .replace(/[_-]+/g, " ")
        .replace(/\s+/g, " ")
        .trim();

    const cleaned = normalized
        .replace(/^img\s*/i, "")
        .replace(/\bwa\d+\b/gi, "")
        .trim();

    if (!cleaned || /^\d+(\s+\d+)*$/.test(cleaned)) {
        return "Atmosfera Alcova";
    }

    return toTitleCase(cleaned);
}

function buildManifest() {
    if (!fs.existsSync(IMAGES_DIR)) {
        throw new Error(`Images directory not found: ${IMAGES_DIR}`);
    }

    const files = fs
        .readdirSync(IMAGES_DIR, { withFileTypes: true })
        .filter((entry) => entry.isFile())
        .map((entry) => entry.name)
        .filter(isGalleryImage)
        .sort((a, b) => a.localeCompare(b, "it"));

    const images = files.map((fileName) => {
        const caption = getCaptionFromFileName(fileName);
        return {
            src: `images/${fileName}`,
            filename: fileName,
            caption,
            alt: caption
        };
    });

    return {
        version: 1,
        generatedAt: new Date().toISOString(),
        total: images.length,
        images
    };
}

function writeManifest(manifest) {
    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    fs.writeFileSync(OUTPUT_FILE, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
}

function main() {
    const manifest = buildManifest();
    writeManifest(manifest);
    process.stdout.write(`Generated ${manifest.total} gallery items in ${path.relative(ROOT_DIR, OUTPUT_FILE)}\n`);
}

main();
