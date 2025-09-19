<script setup lang="ts">
import { ref } from "vue";
import SelectYear from "./components/SelectYear.vue";
import SelectAll from "./components/SelectAll.vue";
import LimnoGraph from "~/components/LimnoGraph.vue";
import YearBadge from "./components/YearBadge.vue";
import ThemeToggle from "./components/ThemeToggle.vue";
import { useColorPalette } from "~/composables/useColorPalette";
import { useYearSelection } from "~/composables/useYearSelection";
import {
  YEARS,
  PERCENT_DIFFERENCE_TO_AVERAGE,
  MIN_WATER_LEVEL_PERCENTAGE,
  MAX_WATER_LEVEL_PERCENTAGE,
  MIN_WATER_LEVEL_DATE,
  MAX_WATER_LEVEL_DATE,
  LAST_UPDATED_DATE,
  CURRENT_WATER_LEVEL,
} from "~/data/formatted/index";
import * as operatingZones from "~/data/formatted/operatingZones";

const { selectedYears, hoveredYear, selectedSeries, addYear, removeYear } =
  useYearSelection();
const { colors } = useColorPalette();
const showYAxis = ref(false);
const showOverlay = ref(true);

function formatDeviation(val: number, reference: string) {
  if (val === null || val === undefined) return "--";
  const absVal = Math.abs(val);
  if (val > 0) return `+${absVal}% above ${reference}`;
  if (val < 0) return `-${absVal}% below ${reference}`;
  return "No deviation";
}

function deviationColor(val: number) {
  if (val > 0) return "text-indigo-700 dark:text-indigo-400";
  if (val < 0) return "text-indigo-500 dark:text-indigo-300";
  return "text-indigo-400 dark:text-indigo-200";
}

function yearOnly(dateStr: string) {
  if (!dateStr) return "--";
  return dateStr.split("-")[0];
}

function prettyDate(dateStr: string) {
  if (!dateStr) return "--";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
</script>

<template>
  <!-- Full-width Image Banner with Title Overlay -->
  <div class="w-full mb-6 relative">
    <img
      src="/kawagama.webp"
      alt="Kawagama Lake Banner"
      class="block w-full h-48 md:h-64 object-cover object-center"
    />
  </div>
  <div class="container mx-auto max-w-6xl px-4">
    <header class="mt-10 mb-2">
      <h1
        class="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100 mb-2"
      >
        Kawagama Water Data
      </h1>
      <h2 class="text-lg text-gray-600 dark:text-gray-400 max-w-2xl">
        Visualizing daily water levels for Lake Kawagama, Ontario.
      </h2>
    </header>

    <header class="mt-10 mb-2">
      <h2
        class="text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-100 mb-2"
      >
        Current Level
      </h2>
      <h3 class="text-lg text-gray-600 dark:text-gray-400 max-w-2xl">
        Water level statistics for {{ prettyDate(LAST_UPDATED_DATE) }}.
      </h3>
    </header>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <!-- Current vs Average -->
      <div class="rounded-lg p-4 flex flex-col items-center">
        <span
          class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1"
          title="How today's water level compares to the historical average for this day."
        >
          Current Level vs. Historical Average
        </span>
        <span
          :class="`text-2xl font-bold ${deviationColor(
            PERCENT_DIFFERENCE_TO_AVERAGE
          )}`"
        >
          {{ formatDeviation(PERCENT_DIFFERENCE_TO_AVERAGE, "average") }}
        </span>
        <span
          class="text-xs text-gray-400 mt-1"
          title="Today's measured water level"
        >
          {{ CURRENT_WATER_LEVEL }} m
        </span>
      </div>
      <!-- Current vs Historical Minimum -->
      <div class="rounded-lg p-4 flex flex-col items-center">
        <span
          class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1"
          title="How today's water level compares to the lowest ever recorded for this day."
        >
          Current Level vs. Historical Minimum
        </span>
        <span
          :class="`text-2xl font-bold ${deviationColor(
            MIN_WATER_LEVEL_PERCENTAGE
          )}`"
        >
          {{ formatDeviation(MIN_WATER_LEVEL_PERCENTAGE, "minimum") }}
        </span>
        <span
          class="text-xs text-gray-400 mt-1"
          title="Lowest level ever recorded for this day"
        >
          All time daily low in {{ yearOnly(MIN_WATER_LEVEL_DATE) }}
        </span>
      </div>
      <!-- Current vs Historical Maximum -->
      <div class="rounded-lg p-4 flex flex-col items-center">
        <span
          class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1"
          title="How today's water level compares to the highest ever recorded for this day."
        >
          Current Level vs. Historical Maximum
        </span>
        <span
          :class="`text-2xl font-bold ${deviationColor(
            MAX_WATER_LEVEL_PERCENTAGE
          )}`"
        >
          {{ formatDeviation(MAX_WATER_LEVEL_PERCENTAGE, "maximum") }}
        </span>
        <span
          class="text-xs text-gray-400 mt-1"
          title="Highest level ever recorded for this day"
        >
          All time daily high in {{ yearOnly(MAX_WATER_LEVEL_DATE) }}
        </span>
      </div>
    </div>

    <header class="mt-10 mb-2">
      <h2
        class="text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-100 mb-2"
      >
        Historical Data
      </h2>
      <h3 class="text-lg text-gray-600 dark:text-gray-400 max-w-2xl">
        Daily water levels for Lake Kawagama from 2003 to present.
      </h3>
    </header>
    <div class="grid grid-cols-1 gap-4">
      <div class="relative -mx-4 md:-mx-0">
        <LimnoGraph
          :series="selectedSeries"
          :colors="colors"
          :hovered-year="hoveredYear"
          :operating-zones="showOverlay ? operatingZones : undefined"
          :show-y-axis="showYAxis"
        />
      </div>
      <div class="flex justify-between">
        <div class="flex flex-wrap gap-2">
          <SelectYear
            :years="YEARS"
            :disabled-years="selectedYears"
            @select="addYear"
          />
          <SelectAll
            :disabled="selectedYears.length === YEARS.length"
            @click="() => YEARS.forEach(addYear)"
          />
          <button
            class="appearance-none rounded-md bg-white py-1.5 pl-3 pr-3 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-indigo-600 sm:text-sm/6 dark:bg-gray-900 dark:text-white dark:outline-white/10 dark:*:bg-gray-800 dark:focus-visible:outline-indigo-500 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed dark:disabled:bg-gray-800 dark:disabled:text-gray-600 inline-flex items-center gap-x-0.5"
            @click="selectedYears.splice(0)"
          >
            Clear
          </button>
        </div>
      </div>
      <div class="flex flex-wrap gap-2">
        <YearBadge
          v-for="year in selectedYears"
          :key="year"
          :label="year.toString()"
          :color="colors[year]"
          @remove="removeYear(year)"
          @mouseenter="hoveredYear = year"
          @mouseleave="hoveredYear = null"
        />
      </div>
      <!-- Settings Section -->
      <div class="w-ful mt-4">
        <div>
          <div class="rounded-lg shadow bg-gray-50 dark:bg-gray-800 mb-4">
            <div
              class="flex w-full justify-between items-center px-4 py-2 rounded-t-lg bg-white dark:bg-gray-900 text-base font-medium text-gray-900 dark:text-white outline outline-1 -outline-offset-1 outline-gray-200 dark:outline-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-indigo-600 dark:focus-visible:outline-indigo-500"
            >
              <span>Display options</span>
            </div>
            <div class="px-4 py-4 bg-gray-50 dark:bg-gray-800 rounded-b-lg">
              <label class="flex items-center space-x-2">
                <input
                  v-model="showOverlay"
                  type="checkbox"
                  class="accent-indigo-600 h-4 w-4 rounded border-gray-300 focus:ring-indigo-500 dark:bg-gray-900 dark:border-gray-700"
                />
                <span class="text-gray-900 dark:text-gray-100"
                  >Show operating zones</span
                >
              </label>
              <label class="flex items-center space-x-2 mt-3">
                <input
                  v-model="showYAxis"
                  type="checkbox"
                  class="accent-indigo-600 h-4 w-4 rounded border-gray-300 focus:ring-indigo-500 dark:bg-gray-900 dark:border-gray-700"
                />
                <span class="text-gray-900 dark:text-gray-100"
                  >Show y-axis</span
                >
              </label>
            </div>
          </div>
        </div>
      </div>

      <!-- Q/A Section -->
      <section class="px-8 py-10 rounded-lg space-y-8">
        <h3 class="text-xl font-semibold mb-4">Questions & Answers</h3>
        <div
          class="space-y-2 pb-4 border-b border-gray-200 dark:border-gray-800"
        >
          <p class="font-medium text-gray-900 dark:text-gray-100">
            Where does the data come from?
          </p>
          <p class="ml-4 text-gray-700 dark:text-gray-300">
            The data is collected from the
            <a
              href="https://wateroffice.ec.gc.ca/report/real_time_e.html?stn=02EB017"
              target="_blank"
              class="text-blue-600 dark:text-blue-400 underline"
            >
              Government of Canada Water Office</a
            >
            , which provides both historical and real-time water level
            information for Kawagama Lake.
          </p>
        </div>
        <div
          class="space-y-2 pb-4 border-b border-gray-200 dark:border-gray-800"
        >
          <p class="font-medium text-gray-900 dark:text-gray-100">
            Is any data missing?
          </p>
          <p class="ml-4 text-gray-700 dark:text-gray-300">
            Yes. Data for 2002 is not shown because it was incomplete and only
            covered part of the year.
          </p>
        </div>
        <div
          class="space-y-2 pb-4 border-b border-gray-200 dark:border-gray-800"
        >
          <p class="font-medium text-gray-900 dark:text-gray-100">
            How often is the data updated?
          </p>
          <p class="ml-4 text-gray-700 dark:text-gray-300">
            New data is added daily, typically at midnight for the previous day.
          </p>
        </div>
        <div class="space-y-2">
          <p class="font-medium text-gray-900 dark:text-gray-100">
            What do the shaded areas (upper, normal, lower) on the graph mean?
          </p>
          <p class="ml-4 text-gray-700 dark:text-gray-300">
            The shaded regions show the Ministry of Natural Resources'
            operational bounds for Kawagama Lake. These bounds are set out in
            the Kawagama Lake Operation Plan (the "Rule Curve"), which guides
            dam operation and lake level management.
          </p>
        </div>
      </section>
    </div>
  </div>

  <hr class="border-t border-gray-200 dark:border-gray-800 my-10" />

  <div
    class="flex flex-col items-center my-18"
    aria-label="Personal introduction"
  >
    <img
      class="size-20 block rounded-full object-cover object-center"
      src="https://jvan.ca/avatar.png"
      alt="James avatar"
      width="96"
      height="96"
    />
    <h1
      class="mt-2 text-xl leading-8 tracking-tight text-gray-900 dark:text-gray-100 sm:text-2xl"
    >
      Hi I'm James 👋🏻
    </h1>

    <p
      class="mt-3 mr-2 sm:mt-4 max-w-xl px-2 prose dark:prose-invert text-center"
    >
      A Staff Software Engineer with over eight years of experience building
      scalable web applications and leading high-impact technical initiatives.
      <br /><br />
      I love creating tools that make data more accessible and understandable.
      This project is a personal initiative to visualize water level data for
      Lake Kawagama, helping residents and cottage owners stay informed about
      lake conditions.
      <br /><br />
      If you have any questions or feedback, feel free to reach out at
      <a
        href="mailto:jamesvansteenkiste@gmail.com"
        class="text-blue-600 dark:text-blue-400 underline"
        >jamesvansteenkiste@gmail.com</a
      >.
    </p>
  </div>

  <div class="flex justify-center my-4">
    <a
      href="https://jvan.ca"
      rel="noopener noreferrer"
      class="text-blue-500 dark:text-blue-500 text-base font-medium"
    >
      jvan.ca
    </a>
  </div>

  <ThemeToggle class="fixed bottom-4 right-4" />
</template>
