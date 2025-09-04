#!/usr/bin/env node

import fs from "fs";
import path from "node:path";

if (process.argv.length < 3) {
  console.error("Usage: node csv_to_points.js <input.csv> [outputDir]");
  process.exit(1);
}

const inputPath = process.argv[2];
const outputDir = process.argv[3] || path.join(path.dirname(inputPath), "years");

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const csv = fs.readFileSync(inputPath, "utf8");
const lines = csv.split("\n").filter(Boolean);

const header = lines[0].split(",");
const dateIdx = header.findIndex((h) => h.trim().toLowerCase() === "date");
const valueIdx = header.findIndex((h) => h.trim().toLowerCase() === "value");

if (dateIdx === -1 || valueIdx === -1) {
  console.error('CSV must have "Date" and "Value" columns.');
  process.exit(1);
}

// Bucket points by year
const pointsByYear = {};
let globalMin = Infinity;
let globalMax = -Infinity;

for (const line of lines.slice(1)) {
  const cols = line.split(",");
  const date = new Date(cols[dateIdx]);
  const value = parseFloat(cols[valueIdx]);
  if (isNaN(date.getTime()) || isNaN(value)) continue;

  const year = date.getFullYear();
  const startOfYear = new Date(year, 0, 1);
  const dayOfYear = Math.floor(
    (date.getTime() - startOfYear.getTime()) / 86400000
  );

  if (!pointsByYear[year]) {
    pointsByYear[year] = {
      line: [],
      min: Infinity,
      max: -Infinity,
    };
  }

  pointsByYear[year].line.push([dayOfYear, value]);

  // update yearly min/max
  if (value < pointsByYear[year].min) pointsByYear[year].min = value;
  if (value > pointsByYear[year].max) pointsByYear[year].max = value;

  // update global min/max
  if (value < globalMin) globalMin = value;
  if (value > globalMax) globalMax = value;
}

// Write per-year files
let totalPoints = 0;
const years = Object.keys(pointsByYear)
  .map((y) => parseInt(y))
  .sort((a, b) => b - a);

for (const year of years) {
  const { line, min, max } = pointsByYear[year];
  const filePath = path.join(outputDir, `${year}.ts`);
  const content =
    `// Auto-generated from ${path.basename(inputPath)}\n` +
    `export const points${year} = {\n` +
    `  year: ${year},\n` +
    `  min: ${min},\n` +
    `  max: ${max},\n` +
    `  line: [\n${line
      .map(([d, v]) => `    [${d}, ${v}]`)
      .join(",\n")}\n  ]\n` +
    `};\n`;
  fs.writeFileSync(filePath, content, "utf8");
  totalPoints += line.length;
  console.log(
    `Wrote ${line.length} points for year ${year} to ${filePath}`
  );
}

// Write index.ts
const indexPath = path.join(outputDir, "index.ts");
const indexContent =
  `export const YEARS = [${years.join(", ")}];\n` +
  `export const GLOBAL_MIN = ${globalMin};\n` +
  `export const GLOBAL_MAX = ${globalMax};\n`;
fs.writeFileSync(indexPath, indexContent, "utf8");

console.log(
  `Wrote ${totalPoints} points in ${years.length} years to ${outputDir}`
);
console.log(`Global min=${globalMin}, max=${globalMax}`);
