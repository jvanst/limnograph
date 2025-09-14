#!/bin/bash

# Get dynamic dates

YEAR=$(date +%Y)
START_DATE="${YEAR}-01-01"

# Cross-platform yesterday calculation
if date --version >/dev/null 2>&1; then
  # GNU date (Linux)
  END_DATE=$(date -d "yesterday" +%Y-%m-%d)
else
  # BSD date (macOS)
  END_DATE=$(date -v-1d +%Y-%m-%d)
fi

# First request: get headers and extract PHPSESSID in memory
PHPSESSID=$(curl -i "https://wateroffice.ec.gc.ca/report/real_time_e.html?stn=02EB017&mode=Graph&startDate=${START_DATE}&endDate=${END_DATE}&prm1=46&y1Max=&y1Min=&prm2=6&y2Max=&y2Min=" \
  --compressed \
  -H 'Cookie: disclaimer=agree;' \
  | grep -i 'Set-Cookie:' | grep -o 'PHPSESSID=[^;]*' | head -n1 | cut -d= -f2)

# Second request: use PHPSESSID to download the zip file
curl 'https://wateroffice.ec.gc.ca/download/report_e.html?dt=3&df=csv&ext=zip' \
  --compressed \
  -H "Cookie: disclaimer=agree; PHPSESSID=$PHPSESSID" \
  -o report.zip

# Extract the CSV from the zip and rename it
unzip -j report.zip '*.csv' -d . && mv $(ls ./*.csv | head -n1) current_year.csv
rm report.zip