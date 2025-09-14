import { computed } from "vue";
import * as d3 from "d3";
import { getContrastColorPalette } from "~/util/color";
import { YEARS } from "~/data/formatted/index";

export function useColorPalette() {
  const colorMode = useColorMode();
  const backgroundColor = computed(() =>
    colorMode.value === "dark" ? "#091a28" : "#FFFFFF"
  );

  const colorPalette = computed(() =>
    getContrastColorPalette(
      [
        ...d3.schemeCategory10,
        ...(Array.isArray(d3.schemeSet3) ? d3.schemeSet3 : []),
        ...(Array.isArray(d3.schemePaired) ? d3.schemePaired : []),
        ...(Array.isArray(d3.schemeDark2) ? d3.schemeDark2 : []),
      ].filter((c) => typeof c === "string"),
      backgroundColor.value
    )
  );

  const colors = computed(() => {
    const map: Record<string, string> = {};
    YEARS.forEach((year, idx) => {
      const color = colorPalette.value[idx % colorPalette.value.length] ?? "#888";
      map[String(year)] = color;
    });
    return map;
  });

  return { colors, colorPalette, backgroundColor };
}
