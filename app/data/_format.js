#!/usr/bin/env node

import fs from "fs";
import path from "node:path";

import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.resolve(__dirname);
const formattedDir = path.join(dataDir, "formatted");
const files = [
  path.join(dataDir, "current_year.csv"),
  path.join(dataDir, "historical.csv"),
];

let allParsedLines = [];
const dateColNames = ["date", "date (est)"];
const valueColNames = ["value", "value (m)"];

for (const file of files) {
  const csv = fs.readFileSync(file, "utf8");
  const lines = csv.split("\n").filter(Boolean);
  let headerIdx = -1;
  let header = null;
  let dateIdx = -1;
  let valueIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    const cols = lines[i].split(",").map((c) => c.trim().toLowerCase());
    const hasDate = cols.some((c) => dateColNames.includes(c));
    const hasValue = cols.some((c) => valueColNames.includes(c));
    if (hasDate && hasValue) {
      headerIdx = i;
      header = lines[i].split(",");
      // Find column indices for this file
      for (let j = 0; j < header.length; j++) {
        const h = header[j].trim().toLowerCase();
        if (dateColNames.includes(h)) dateIdx = j;
        if (valueColNames.includes(h)) valueIdx = j;
      }
      break;
    }
  }
  if (headerIdx === -1 || dateIdx === -1 || valueIdx === -1) continue;
  for (const line of lines.slice(headerIdx + 1)) {
    const cols = line.split(",");
    allParsedLines.push({
      date: cols[dateIdx],
      value: cols[valueIdx]
    });
  }
}

// Bucket points by year
const pointsByYear = {};
let globalMin = Infinity;
let globalMax = -Infinity;

for (const row of allParsedLines) {
  const date = new Date(row.date);
  const value = parseFloat(row.value);
  if (isNaN(date.getTime()) || isNaN(value)) continue;

  const year = date.getUTCFullYear();
  const startOfYear = new Date(Date.UTC(year, 0, 1));
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
  const filePath = path.join(formattedDir, `${year}.ts`);
  const content =
    `// Auto-generated from current_year.csv and historical.csv\n` +
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
const indexPath = path.join(formattedDir, "index.ts");
const indexContent =
  `export const YEARS = [${years.join(", ")}];\n` +
  `export const GLOBAL_MIN = ${globalMin};\n` +
  `export const GLOBAL_MAX = ${globalMax};\n`;
fs.writeFileSync(indexPath, indexContent, "utf8");

console.log(
  `Wrote ${totalPoints} points in ${years.length} years to ${formattedDir}`
);
console.log(`Global min=${globalMin}, max=${globalMax}`);
