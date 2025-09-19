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

// Compute average for each day-of-year across all years

// Collect values for each day-of-year
const dayValues = {};
for (const year of years) {
  for (const [dayOfYear, value] of pointsByYear[year].line) {
    if (!dayValues[dayOfYear]) dayValues[dayOfYear] = [];
    dayValues[dayOfYear].push(value);
  }
}

// Compute average, min, and max for each day-of-year
const averageLine = [];
const minPerDayLine = [];
const maxPerDayLine = [];
for (const dayOfYear of Object.keys(dayValues).map((d) => parseInt(d)).sort((a, b) => a - b)) {
  const values = dayValues[dayOfYear];
  const avg = values.reduce((sum, v) => sum + v, 0) / values.length;
  const min = Math.min(...values);
  const max = Math.max(...values);
  averageLine.push([dayOfYear, Number(avg.toFixed(2))]);
  minPerDayLine.push([dayOfYear, Number(min.toFixed(2))]);
  maxPerDayLine.push([dayOfYear, Number(max.toFixed(2))]);
}

// Write average file
const avgMin = averageLine.length > 0 ? Math.min(...averageLine.map(([, v]) => v)) : null;
const avgMax = averageLine.length > 0 ? Math.max(...averageLine.map(([, v]) => v)) : null;
const avgFilePath = path.join(formattedDir, "average.ts");
const avgContent =
  `// Auto-generated daily average across all years\n` +
  `export const pointsAverage = {\n` +
  `  min: ${avgMin},\n` +
  `  max: ${avgMax},\n` +
  `  line: [\n${averageLine
    .map(([d, v]) => `    [${d}, ${v}]`)
    .join(",\n")}\n  ]\n` +
  `};\n`;
fs.writeFileSync(avgFilePath, avgContent, "utf8");
console.log(`Wrote daily average points to ${avgFilePath}`);

// Write index.ts
const indexPath = path.join(formattedDir, "index.ts");
const indexContent =
  `export const YEARS = [${years.join(", ")}];\n` +
  `export const GLOBAL_MIN = ${globalMin};\n` +
  `export const GLOBAL_MAX = ${globalMax};\n`;
fs.writeFileSync(indexPath, indexContent, "utf8");


// --- Additional Data Points ---
// Find most recent date and value
let lastUpdatedDate = null;
let currentWaterLevel = null;
let mostRecentDayOfYear = null;
let mostRecentYear = null;
if (allParsedLines.length > 0) {
  // Find the row with the latest date
  let latestRow = allParsedLines.reduce((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return dateA > dateB ? a : b;
  });
  lastUpdatedDate = latestRow.date;
  currentWaterLevel = parseFloat(latestRow.value);
  const dateObj = new Date(latestRow.date);
  mostRecentDayOfYear = Math.floor((dateObj.getTime() - new Date(Date.UTC(dateObj.getUTCFullYear(), 0, 1)).getTime()) / 86400000);
  mostRecentYear = dateObj.getUTCFullYear();
}

// Find min/max for this day-of-year in history (exclude current year)
let minWaterLevelOnDay = null;
let maxWaterLevelOnDay = null;
let averageWaterLevelOnDay = null;
if (mostRecentDayOfYear !== null) {
  let historicalValues = [];
  for (const year of years) {
    if (year === mostRecentYear) continue; // skip current year
    const line = pointsByYear[year]?.line || [];
    for (const [day, value] of line) {
      if (day === mostRecentDayOfYear) {
        historicalValues.push(value);
      }
    }
  }
  if (historicalValues.length > 0) {
    minWaterLevelOnDay = Math.min(...historicalValues);
    maxWaterLevelOnDay = Math.max(...historicalValues);
  }
  // Get average for this day from averageLine
  for (const [day, avg] of averageLine) {
    if (day === mostRecentDayOfYear) {
      averageWaterLevelOnDay = avg;
      break;
    }
  }
}

// Calculate percent difference to average
let percentDifferenceToAverage = null;
if (currentWaterLevel !== null && averageWaterLevelOnDay !== null && averageWaterLevelOnDay !== 0) {
  percentDifferenceToAverage = Number((((currentWaterLevel - averageWaterLevelOnDay) / averageWaterLevelOnDay) * 100).toFixed(2));
}


// Calculate percent difference to min/max historical value for this day
let percentDifferenceToMin = null;
let percentDifferenceToMax = null;
if (currentWaterLevel !== null && minWaterLevelOnDay !== null && minWaterLevelOnDay !== 0) {
  percentDifferenceToMin = Number((((currentWaterLevel - minWaterLevelOnDay) / minWaterLevelOnDay) * 100).toFixed(2));
}
if (currentWaterLevel !== null && maxWaterLevelOnDay !== null && maxWaterLevelOnDay !== 0) {
  percentDifferenceToMax = Number((((currentWaterLevel - maxWaterLevelOnDay) / maxWaterLevelOnDay) * 100).toFixed(2));
}

// Write these values to index.ts
// Find the dates when min/max were recorded for this day-of-year
let minWaterLevelDate = null;
let maxWaterLevelDate = null;
if (mostRecentDayOfYear !== null) {
  let minDate = null;
  let maxDate = null;
  let minValue = Infinity;
  let maxValue = -Infinity;
  for (const year of years) {
    if (year === mostRecentYear) continue; // skip current year
    const line = pointsByYear[year]?.line || [];
    for (const [day, value] of line) {
      if (day === mostRecentDayOfYear) {
        const dateObj = new Date(Date.UTC(year, 0, 1) + day * 86400000);
        const dateStr = `${year}-${String(dateObj.getUTCMonth() + 1).padStart(2, '0')}-${String(dateObj.getUTCDate()).padStart(2, '0')}`;
        if (value < minValue) {
          minValue = value;
          minDate = dateStr;
        }
        if (value > maxValue) {
          maxValue = value;
          maxDate = dateStr;
        }
      }
    }
  }
  minWaterLevelDate = minDate;
  maxWaterLevelDate = maxDate;
}

const extraContent =
  `export const LAST_UPDATED_DATE = ${JSON.stringify(lastUpdatedDate)};\n` +
  `export const CURRENT_WATER_LEVEL = ${JSON.stringify(currentWaterLevel)};\n` +
  `export const MIN_WATER_LEVEL_PERCENTAGE = ${JSON.stringify(percentDifferenceToMin)};\n` +
  `export const MAX_WATER_LEVEL_PERCENTAGE = ${JSON.stringify(percentDifferenceToMax)};\n` +
  `export const MIN_WATER_LEVEL_DATE = ${JSON.stringify(minWaterLevelDate)};\n` +
  `export const MAX_WATER_LEVEL_DATE = ${JSON.stringify(maxWaterLevelDate)};\n` +
  `export const PERCENT_DIFFERENCE_TO_AVERAGE = ${JSON.stringify(percentDifferenceToAverage)};\n`;
fs.appendFileSync(indexPath, extraContent, "utf8");

console.log(
  `Wrote ${totalPoints} points in ${years.length} years to ${formattedDir}`
);
console.log(`Global min=${globalMin}, max=${globalMax}`);
console.log(`Last updated date: ${lastUpdatedDate}`);
console.log(`Current water level: ${currentWaterLevel}`);
console.log(`Min water level on this day in history: ${minWaterLevelOnDay}`);
console.log(`Max water level on this day in history: ${maxWaterLevelOnDay}`);
console.log(`Percent difference to average: ${percentDifferenceToAverage}`);
