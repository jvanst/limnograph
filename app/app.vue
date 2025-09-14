<script setup lang="ts">
import SelectYear from "./components/SelectYear.vue";
import SelectAll from "./components/SelectAll.vue";
import LimnoGraph from "~/components/LimnoGraph.vue";
import YearBadge from "./components/YearBadge.vue";
import ThemeToggle from "./components/ThemeToggle.vue";
import { useColorPalette } from "~/composables/useColorPalette";
import { YEARS } from "~/data/formatted/index";
import { useYearSelection } from "~/composables/useYearSelection";

import "~/data/formatted/2025"; // preload the default year

const { selectedYears, hoveredYear, selectedSeries, addYear, removeYear } = useYearSelection();
const { colors } = useColorPalette();
</script>

<template>
  <div class="container mx-auto max-w-6xl px-4">
    <header class="my-8 text-center">
      <h1 class="text-4xl font-bold mb-2">Kawagama <i>Limnograph</i></h1>
      <h2 class="text-lg text-gray-600 max-w-2xl mx-auto">
        A limnograph is a chart or graph that records and displays measurements
        of water levels, temperature, or other limnological data over time,
        typically for lakes or rivers.
      </h2>
    </header>
    <div class="grid grid-cols-1 gap-4">
      <div>
        <LimnoGraph
          :series="selectedSeries"
          :colors="colors"
          :hovered-year="hoveredYear"
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
    </div>
    <ThemeToggle class="fixed bottom-4 right-4" />
  </div>
</template>
