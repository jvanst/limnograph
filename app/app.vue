<script setup lang="ts">
import SelectYear from "./components/SelectYear.vue";
import SelectAll from "./components/SelectAll.vue";
import LimnoGraph from "~/components/LimnoGraph.vue";
import YearBadge from "./components/YearBadge.vue";
import ThemeToggle from "./components/ThemeToggle.vue";
import { useColorPalette } from "~/composables/useColorPalette";
import { useYearSelection } from "~/composables/useYearSelection";
import { YEARS } from "~/data/formatted/index";
import {
  normalOperating,
  upperOperating,
  lowerOperating,
} from "~/data/formatted/operatingZones";

const { selectedYears, hoveredYear, selectedSeries, addYear, removeYear } =
  useYearSelection();
const { colors } = useColorPalette();
</script>

<template>
  <div class="container mx-auto max-w-6xl px-4">
    <header class="mt-10 mb-2">
      <h1 class="text-4xl font-bold mb-2">Kawagama Water Levels</h1>
      <h2 class="text-lg text-gray-600 max-w-2xl">
        Daily water levels for Lake Kawagama from 2003 to present.
      </h2>
    </header>
    <div class="grid grid-cols-1 gap-4">
      <div class="-mx-4 md:-mx-0">
        <LimnoGraph
          :series="selectedSeries"
          :colors="colors"
          :hovered-year="hoveredYear"
          :operating-zones="{
            normalOperating,
            upperOperating,
            lowerOperating,
          }"
          :show-y-axis="false"
        />
      </div>
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
        <button class="text-sm px-2 py-1" @click="selectedYears.splice(0)">
          Clear
        </button>
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
      <!-- Q/A Section -->
    <section class="mt-8 p-6 bg-gray-50 rounded-lg shadow dark:bg-gray-800 dark:shadow-lg">
        <h3 class="text-xl font-semibold mb-4">Questions & Answers</h3>
        <div class="mb-4">
      <p class="font-medium text-gray-900 dark:text-gray-100">Where does the data come from?</p>
      <p class="ml-4 text-gray-700 dark:text-gray-300">
            The data is collected from the
            <a
              href="https://wateroffice.ec.gc.ca/report/real_time_e.html?stn=02EB017"
              target="_blank"
              class="text-blue-600 underline"
            >
              Government of Canada Water Office</a>
            , which provides both historical and real-time water level information for Kawagama Lake.
          </p>
        </div>
        <div class="mb-4">
      <p class="font-medium text-gray-900 dark:text-gray-100">Is any data missing?</p>
      <p class="ml-4 text-gray-700 dark:text-gray-300">
            Yes. Data for 2002 is not shown because it was incomplete and only covered part of the year.
          </p>
        </div>
        <div class="mb-4">
      <p class="font-medium text-gray-900 dark:text-gray-100">How often is the data updated?</p>
      <p class="ml-4 text-gray-700 dark:text-gray-300">
            New data is added daily, typically at midnight for the previous day.
          </p>
        </div>
        <div>
      <p class="font-medium text-gray-900 dark:text-gray-100">What do the shaded areas on the graph mean?</p>
      <p class="ml-4 text-gray-700 dark:text-gray-300">
            The shaded regions show the Ministry of Natural Resources' operational bounds for Kawagama Lake. These bounds are set out in the Kawagama Lake Operation Plan (the "Rule Curve"), which guides dam operation and lake level management.
          </p>
        </div>
      </section>
    </div>
    <ThemeToggle class="fixed bottom-4 right-4" />
  </div>
</template>
