<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import SelectYear from "./components/SelectYear.vue";
import SelectAll from "./components/SelectAll.vue";
import LimnoGraph from "~/components/LimnoGraph.vue";
import AppBadge from "~/components/AppBadge.vue";
import { YEARS } from "~/data/years/index";

import "~/data/years/2024"; // preload the default year
const DEFAULT_YEAR = 2024;

const { query } = useRoute();
const router = useRouter();

const selectedYears = ref<number[]>([]);
const yearData = ref<Record<number, YearlyPoints[]>>({});

// On mount, parse years from query param
onMounted(() => {
  const queryYears = query.years;
  if (typeof queryYears === "string") {
    try {
      const years = queryYears
        .split(",")
        .map(Number)
        .filter((y) => YEARS.includes(y));
      selectedYears.value = years;
      selectedYears.value.forEach(loadYear);
    } catch {
      addYear(DEFAULT_YEAR);
    }
  } else {
    addYear(DEFAULT_YEAR);
  }
});

// Watch selectedYears and update the URL
watch(
  selectedYears,
  (val) => {
    const newQuery = { ...query };
    if (val.length) newQuery.years = val.join(",");
    else delete newQuery.years;
    router.replace({ query: newQuery });
  },
  { deep: true }
);

async function loadYear(year: number) {
  if (yearData.value[year]) return; // Already loaded
  const mod = await import(`~/data/years/${year}.ts`);
  yearData.value[year] = mod[`points${year}`]; // All points files export const points<year>
}

function addYear(year: number) {
  if (!selectedYears.value.includes(year)) {
    selectedYears.value.push(year);
    loadYear(year);
  }
}

function removeYear(year: number) {
  const index = selectedYears.value.indexOf(year);
  if (index !== -1) selectedYears.value.splice(index, 1);
}

// Directly map selected years to their precomputed objects
const selectedSeries = computed(() =>
  selectedYears.value
    .map((year) => yearData.value[year])
    .filter((series): series is YearlyPoints[] => !!series)
    .flat()
);
</script>

<template>
  <div class="container mx-auto">
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
        <LimnoGraph :series="selectedSeries" />
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
        <AppBadge
          v-for="year in selectedYears"
          :key="year"
          :label="year.toString()"
          @remove="removeYear(year)"
        />
      </div>
    </div>
  </div>
</template>
