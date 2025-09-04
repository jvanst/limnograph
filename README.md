

# Limnograph

[View the deployed app](https://limnograph.jvan.ca/)

## What is a Limnograph?

A limnograph is a chart or graph that records water level (stage) variations in a body of water, such as a river or lake, over time. It is commonly used in hydrology to visualize daily, seasonal, or historical changes in water levels, helping researchers and resource managers understand patterns and trends.

## Data Source

The original data for this project is sourced from:
- [Water Office Historical Data for Station 02EB017](https://wateroffice.ec.gc.ca/report/historical_e.html?stn=02EB017)
- [General Download Portal](https://wateroffice.ec.gc.ca/download/statistics/index_e.html)

## Prerequisites

- [Node.js](https://nodejs.org/) v22.x
- [npm](https://www.npmjs.com/) (comes with Node.js)

## Setup

Install dependencies:

```bash
npm install
```

## Setup

Make sure to install dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```


## Development Server

Start the development server on `http://localhost:3000`:

```bash
npm run dev
```


## Production

Build the application for production:

```bash
npm run build
```

Locally preview production build:

```bash
npm run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.

## Using csv_to_points.js

To convert the raw CSV data to point data for visualization, run the following command from the `app/data` directory:

```bash
cd app/data
node csv_to_points.js ./daily_historical.csv
```

This will process `daily_historical.csv` and output into an optimized format for displays daily averages.
