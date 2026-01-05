import { ref, computed, watch } from "vue";
import { useRoute, useRouter } from "nuxt/app";
import { YEARS } from "~/data/formatted/index";
import { points2026 } from "~/data/formatted/2026";

const DEFAULT_YEAR = 2026;

export function useYearSelection() {
  const route = useRoute();
  const router = useRouter();
  const selectedYears = ref<number[]>([DEFAULT_YEAR]);
  const yearData = ref<Record<number, YearlyPoints[]>>({
    2026: [points2026 as YearlyPoints],
  });
  const hoveredYear = ref<number | null>(null);

  onMounted(() => {
    const queryYears = route.query.years;
    if (typeof queryYears === "string") {
      try {
        const years = queryYears
          .split(",")
          .map(Number)
          .filter((y) => YEARS.includes(y));
        selectedYears.value = years;
        selectedYears.value.forEach(loadYear);
      } catch {
        // ignore invalid query
      }
    }
  })

  // Watch selectedYears and update the URL
  watch(
    selectedYears,
    (val) => {
      const newQuery = { ...route.query };
      if (val.length) newQuery.years = val.join(",");
      else delete newQuery.years;
      router.replace({ query: newQuery });
    },
    { deep: true }
  );

  async function loadYear(year: number) {
    if (yearData.value[year]) return; // Already loaded
    const mod = await import(`~/data/formatted/${year}.ts`);
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

  return {
    selectedYears,
    yearData,
    hoveredYear,
    selectedSeries,
    addYear,
    removeYear,
    loadYear,
  };
}
