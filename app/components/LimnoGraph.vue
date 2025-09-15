<script setup lang="ts">
import * as d3 from "d3";
import { GLOBAL_MIN, GLOBAL_MAX } from "~/data/formatted";
import { useOperatingZones } from "../composables/useOperatingZones";

type OperatingZonesType = {
  normalOperating: {
    upper: { day: number; value: number }[];
    lower: { day: number; value: number }[];
  };
  upperOperating: {
    upper: { day: number; value: number }[];
    lower: { day: number; value: number }[];
  };
  lowerOperating: {
    upper: { day: number; value: number }[];
    lower: { day: number; value: number }[];
  };
};

const props = defineProps<{
  series: YearlyPoints[];
  colors: Record<string, string>;
  hoveredYear?: number | null;
  operatingZones?: OperatingZonesType;
}>();

const svg = ref<SVGSVGElement | null>(null);
const container = ref<HTMLElement | null>(null);
const width = ref(800);
const height = ref(400);
const currentYear = new Date().getFullYear();

const { getAreaData, getSingleAreaData } = useOperatingZones();

const tooltip = ref({
  show: false,
  x: 0,
  y: 0,
  year: null as number | null,
  value: null as number | null,
  day: null as number | null,
});

// Helper to convert day-of-year to month name and day of month
function getMonthDay(year: number | null, day: number | null): string {
  if (year == null || day == null) return "";
  const date = new Date(year, 0, 1);
  date.setDate(date.getDate() + day);
  const month = date.toLocaleString("default", { month: "short" });
  const dayOfMonth = date.getDate();
  return `${month} ${dayOfMonth}`;
}

let resizeObserver: ResizeObserver | null = null;

function updateChartWidth() {
  if (container.value) width.value = container.value.clientWidth;
}

function drawChart() {
  // Chart dimensions and margins
  const w = width.value;
  const h = height.value;
  const margin = { top: 20, right: 20, bottom: 30, left: 40 };

  // Select the SVG element and set its size and viewBox
  const svgEl = d3
    .select(svg.value)
    .attr("width", "100%")
    .attr("height", h)
    .attr("viewBox", `0 0 ${w} ${h}`)
    .attr("preserveAspectRatio", "xMinYMin meet");

  // X scale: maps day of year (0-365) to horizontal position
  const x = d3
    .scaleLinear()
    .domain([0, 365])
    .range([margin.left, w - margin.right]);

  // Y scale: maps value to vertical position
  const y = d3
    .scaleLinear()
    .domain([GLOBAL_MIN, GLOBAL_MAX])
    .nice()
    .range([h - margin.bottom, margin.top]);

  // Ensure overlay group exists (behind data lines)
  let gOverlay: d3.Selection<SVGGElement, unknown, null, undefined> =
    svgEl.select<SVGGElement>("g.overlay-zone");
  if (gOverlay.empty()) {
    gOverlay = svgEl.insert("g", ":first-child").attr("class", "overlay-zone");
  }

  // Only draw operating zones if provided
  let areaData,
    areaDataUpper,
    areaDataLower,
    areaDataLowWater,
    areaDataHighWater;
  if (props.operatingZones) {
    areaData = getAreaData(props.operatingZones.normalOperating);
    areaDataUpper = getAreaData(props.operatingZones.upperOperating);
    areaDataLower = getAreaData(props.operatingZones.lowerOperating);
    areaDataLowWater = getSingleAreaData(
      props.operatingZones.lowerOperating.lower
    );
    areaDataHighWater = getSingleAreaData(
      props.operatingZones.upperOperating.upper
    );
  }

  if (props.operatingZones) {
    const areaLower = d3
      .area<{ day: number; upper: number; lower: number }>()
      .x((d) => x(d.day))
      .y0((d) => y(d.lower))
      .y1((d) => y(d.upper))
      .curve(d3.curveLinear);

    const overlayPathLower = gOverlay
      .selectAll<SVGPathElement, typeof areaDataLower>("path.zone-lower")
      .data([areaDataLower]);

    overlayPathLower
      .enter()
      .append("path")
      .attr("class", "zone-lower")
      .merge(overlayPathLower)
      .attr("d", (d) => areaLower(d ?? []))
      .attr("fill", "#cddc39") // muted green-yellow
      .attr("opacity", 0.18);

    overlayPathLower.exit().remove();
  }

  // --- Add zone labels ---
  let gLabels = svgEl.select<SVGGElement>("g.zone-labels");
  if (gLabels.empty()) {
    gLabels = svgEl.append("g").attr("class", "zone-labels");
  }
  gLabels.selectAll("text").remove();

  if (props.operatingZones) {
    // Normal Operating
    if (areaData && areaData.length > 0) {
      const last = areaData[areaData.length - 1];
      const rightPadding = 4;
      gLabels
        .append("text")
        .attr("x", w - margin.right - rightPadding)
        .attr("y", last ? y(last.lower) - 8 : margin.top)
        .attr("text-anchor", "end")
        .attr("fill", "var(--zone-label-normal)")
        .attr("font-size", 12)
        .attr("font-weight", "600")
        .attr("style", "letter-spacing:0.5px;")
        .attr("opacity", 0.5)
        .text("Normal");
    }
    // Upper Operating
    if (areaDataUpper && areaDataUpper.length > 0) {
      const last = areaDataUpper[areaDataUpper.length - 1];
      const rightPadding = 4;
      gLabels
        .append("text")
        .attr("x", w - margin.right - rightPadding)
        .attr("y", last ? y(last.lower) - 8 : margin.top)
        .attr("text-anchor", "end")
        .attr("fill", "var(--zone-label-upper)")
        .attr("font-size", 12)
        .attr("font-weight", "600")
        .attr("style", "letter-spacing:0.5px;")
        .attr("opacity", 0.5)
        .text("Upper");
    }
    // Lower Operating
    if (areaDataLower && areaDataLower.length > 0) {
      const last = areaDataLower[areaDataLower.length - 1];
      const rightPadding = 4;
      gLabels
        .append("text")
        .attr("x", w - margin.right - rightPadding)
        .attr("y", last ? y(last.lower) - 8 : margin.top)
        .attr("text-anchor", "end")
        .attr("fill", "var(--zone-label-lower)")
        .attr("font-size", 12)
        .attr("font-weight", "600")
        .attr("style", "letter-spacing:0.5px;")
        .attr("opacity", 0.5)
        .text("Lower");
    }
  }

  // High Water
  if (areaDataHighWater && areaDataHighWater.length > 0) {
    const last = areaDataHighWater[areaDataHighWater.length - 1];
    gLabels
      .append("text")
      .attr("x", w - margin.right - 4)
      .attr("y", last ? y(last.value) - 8 : margin.top)
      .attr("text-anchor", "end")
      .attr("fill", "var(--zone-label-high)")
      .attr("font-size", 12)
      .attr("font-weight", "600")
      .attr("style", "letter-spacing:0.5px;")
      .attr("opacity", 0.5)
      .text("High");
  }
  // Low Water
  if (areaDataLowWater && areaDataLowWater.length > 0) {
    const last = areaDataLowWater[areaDataLowWater.length - 1];
    gLabels
      .append("text")
      .attr("x", w - margin.right - 4)
      .attr("y", last ? y(last.value) + 15 : margin.top + 15)
      .attr("text-anchor", "end")
      .attr("fill", "var(--zone-label-low)")
      .attr("font-size", 12)
      .attr("font-weight", "600")
      .attr("style", "letter-spacing:0.5px;")
      .attr("opacity", 0.5)
      .text("Low");
  }

  // --- High Water Area ---
  if (props.operatingZones) {
    const areaHighWater = d3
      .area<{ day: number; value: number }>()
      .x((d) => x(d.day))
      .y0((d) => y(d.value))
      .y1(() => y(GLOBAL_MAX))
      .curve(d3.curveLinear);

    const overlayPathHighWater = gOverlay
      .selectAll<SVGPathElement, typeof areaDataHighWater>(
        "path.zone-highwater"
      )
      .data([areaDataHighWater]);

    overlayPathHighWater
      .enter()
      .append("path")
      .attr("class", "zone-highwater")
      .merge(overlayPathHighWater)
      .attr("d", (d) => areaHighWater(d ?? []))
      .attr("fill", "#fff176") // muted yellow
      .attr("opacity", 0.18);

    overlayPathHighWater.exit().remove();
  }

  // --- Low Water Area ---
  if (props.operatingZones) {
    const areaLowWater = d3
      .area<{ day: number; value: number }>()
      .x((d) => x(d.day))
      .y0(() => y(GLOBAL_MIN))
      .y1((d) => y(d.value))
      .curve(d3.curveLinear);

    const overlayPathLowWater = gOverlay
      .selectAll<SVGPathElement, typeof areaDataLowWater>("path.zone-lowwater")
      .data([areaDataLowWater]);

    overlayPathLowWater
      .enter()
      .append("path")
      .attr("class", "zone-lowwater")
      .merge(overlayPathLowWater)
      .attr("d", (d) => areaLowWater(d ?? []))
      .attr("fill", "#fff176") // muted yellow
      .attr("opacity", 0.18);

    overlayPathLowWater.exit().remove();
  }
  if (props.operatingZones) {
    const areaUpper = d3
      .area<{ day: number; upper: number; lower: number }>()
      .x((d) => x(d.day))
      .y0((d) => y(d.lower))
      .y1((d) => y(d.upper))
      .curve(d3.curveLinear);

    const overlayPathUpper = gOverlay
      .selectAll<SVGPathElement, typeof areaDataUpper>("path.zone-upper")
      .data([areaDataUpper]);

    overlayPathUpper
      .enter()
      .append("path")
      .attr("class", "zone-upper")
      .merge(overlayPathUpper)
      .attr("d", (d) => areaUpper(d ?? []))
      .attr("fill", "#cddc39") // muted green-yellow
      .attr("opacity", 0.18);

    overlayPathUpper.exit().remove();
  }

  if (props.operatingZones) {
    const area = d3
      .area<{ day: number; upper: number; lower: number }>()
      .x((d) => x(d.day))
      .y0((d) => y(d.lower))
      .y1((d) => y(d.upper))
      .curve(d3.curveLinear);

    const overlayPath = gOverlay
      .selectAll<SVGPathElement, typeof areaData>("path.zone")
      .data([areaData]);

    overlayPath
      .enter()
      .append("path")
      .attr("class", "zone")
      .merge(overlayPath)
      .attr("d", (d) => area(d ?? []))
      .attr("fill", "#27ae60") // balanced pure green
      .attr("opacity", 0.18);

    overlayPath.exit().remove();
  }

  // Create ticks for each month for the x-axis
  const monthTicks = d3
    .range(0, 12)
    .map((m) => d3.timeMonth.offset(new Date(currentYear, 0, 1), m));
  // X axis: shows months
  const xAxis = d3
    .axisBottom(x)
    .tickValues(
      monthTicks.map((d) => d3.timeDay.count(new Date(currentYear, 0, 1), d))
    )
    .tickFormat((d, i) =>
      d3.timeFormat("%b")(monthTicks[i] ?? new Date(currentYear, i, 1))
    );
  // Y axis: shows values
  const yAxis = d3.axisLeft(y);

  // Draw x-axis (bottom)
  if (svgEl.select("g.x-axis").empty()) {
    svgEl
      .append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0,${h - margin.bottom})`)
      .call(xAxis);
  }
  // Draw y-axis (left) and add label
  if (svgEl.select("g.y-axis").empty()) {
    svgEl
      .append("g")
      .attr("class", "y-axis")
      .attr("transform", `translate(${margin.left},0)`)
      .call(yAxis)
      .append("text")
      .attr("x", 0)
      .attr("y", margin.top - 10)
      .attr("fill", "currentColor")
      .attr("text-anchor", "start")
      .attr("font-size", 13)
      .text("↑ Meters");
  }

  // Use colors prop for color mapping
  const color = (year: string) => props.colors[year] || "#888";

  /**
   * D3 Quadtree: a fast spatial index for 2D points.
   * https://d3js.org/d3-quadtree
   *
   * Why use it? When the user moves their mouse or finger over the chart,
   * we want to quickly find the closest data point to the pointer.
   */
  const quadtree = d3.quadtree(
    props.series.flatMap((s, seriesIdx) =>
      s.line.map(([day, value]) => {
        const px = x(day);
        const py = y(value);
        return { x: px, y: py, year: s.year, value, day, seriesIdx };
      })
    ),
    (d) => d.x,
    (d) => d.y
  );

  // Draw lines for each year with animation
  let gLines: d3.Selection<SVGGElement, unknown, null, undefined> =
    svgEl.select<SVGGElement>("g.lines");
  if (gLines.empty()) {
    gLines = svgEl.append("g").attr("class", "lines");
  }

  // Data join for lines, keyed by year
  const pathElements = gLines
    .selectAll<SVGPathElement, YearlyPoints>("path")
    .data(props.series, (d) => d.year);

  // EXIT: Animate removed lines out
  pathElements.exit().transition().duration(500).attr("opacity", 0).remove();

  // ENTER: Animate new lines in
  const pathEnter = pathElements
    .enter()
    .append("path")
    .attr("fill", "none")
    .attr("stroke", (d) => color(String(d.year)))
    .attr("stroke-width", 1.5)
    .attr("d", (d) =>
      d3
        .line<[number, number]>()
        .x(([day]) => x(day))
        .y(([_, value]) => y(value))(d.line)
    )
    .each(function () {
      const pathNode = d3.select(this).node() as SVGPathElement;
      const totalLength = pathNode.getTotalLength();
      d3.select(this)
        .attr("stroke-dasharray", `${totalLength},${totalLength}`)
        .attr("stroke-dashoffset", totalLength)
        .transition()
        .duration(1000)
        .ease(d3.easeCubic)
        .attr("stroke-dashoffset", 0);
    });

  pathEnter
    .transition()
    .duration(1000)
    .ease(d3.easeCubic)
    .attr("stroke-dashoffset", 0);

  // UPDATE: Update existing lines
  pathElements
    .attr("stroke", (d) => color(String(d.year)))
    .attr("stroke-width", (d) =>
      props.hoveredYear != null && String(d.year) === String(props.hoveredYear)
        ? 3
        : 1.5
    )
    .attr("opacity", (d) =>
      props.hoveredYear != null && String(d.year) !== String(props.hoveredYear)
        ? 0.2
        : 1
    )
    .attr("d", (d) =>
      d3
        .line<[number, number]>()
        .x(([day]) => x(day))
        .y(([_, value]) => y(value))(d.line)
    );

  // Dot for tooltip: highlights the nearest point
  const dot = svgEl.append("g").attr("display", "none");
  dot
    .append("circle")
    .attr("r", 5)
    .attr("stroke", "#fff")
    .attr("stroke-width", 2);

  // Pointer interactions for tooltips and highlighting
  svgEl
    .on("pointerenter", () => dot.attr("display", null)) // Show dot on hover
    .on("pointermove", (event) => {
      const [xm, ym] = d3.pointer(event);
      // Find closest data point within 50px
      const closest = quadtree.find(xm, ym, 50);
      if (!closest) return;

      tooltip.value = {
        show: true,
        x: closest.x,
        y: closest.y,
        year: closest.year,
        value: closest.value,
        day: closest.day,
      };

      // Highlight the selected line, fade others
      gLines
        .selectAll("path")
        .attr("stroke-width", (d) =>
          String((d as YearlyPoints).year) === String(closest.year) ? 3 : 1.5
        )
        .attr("opacity", (d) =>
          String((d as YearlyPoints).year) === String(closest.year) ? 1 : 0.2
        );

      // Move dot to closest point and color it
      dot.attr("transform", `translate(${closest.x},${closest.y})`);
      dot.select("circle").attr("fill", color(String(closest.year)));
    })
    .on("pointerleave", () => {
      // Reset all lines to default stroke-width and opacity
      gLines.selectAll("path").attr("stroke-width", 1.5).attr("opacity", 1);
      dot.attr("display", "none");
      tooltip.value.show = false;
    })
    .on("touchstart", (e) => e.preventDefault()); // Prevent scrolling on touch
}

onMounted(() => {
  updateChartWidth();
  drawChart();
  if (container.value) {
    // Watch for container size changes to redraw chart
    resizeObserver = new ResizeObserver(() => {
      updateChartWidth();
      drawChart();
    });
    resizeObserver.observe(container.value);
  }
});

// Clean up observer when component unmounts
onBeforeUnmount(() => {
  if (resizeObserver && container.value)
    resizeObserver.unobserve(container.value);
});

// Redraw chart whenever the data or hoveredYear changes
watch([() => props.series, () => props.hoveredYear], drawChart);
</script>

<template>
  <div
    ref="container"
    class="w-full relative -px-4"
    :style="{
      height: height + 'px',
      minHeight: height + 'px',
      maxHeight: height + 'px',
    }"
  >
    <svg ref="svg" class="block w-full h-auto" />

    <!-- Tooltip -->
    <div
      v-if="tooltip.show && tooltip.x && tooltip.y"
      class="absolute pointer-events-none z-10 px-3 py-2 rounded shadow bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-xs"
      :style="{
        left: Math.min(Math.max(tooltip.x + 10, 0), width - 120) + 'px',
        top: Math.max(tooltip.y - 40, 0) + 'px',
        minWidth: '90px',
      }"
    >
      <div>
        <b>{{ tooltip.year }}</b> — {{ getMonthDay(tooltip.year, tooltip.day) }}
      </div>
      <div>
        Value: <b>{{ tooltip.value?.toFixed(2) }}m</b>
      </div>
    </div>
  </div>
</template>

<style>
:root {
  --zone-label-normal: #6bbf7b;
  --zone-label-upper: #dbe7a0;
  --zone-label-lower: #dbe7a0;
  --zone-label-high: #f9f6d2;
  --zone-label-low: #f9f6d2;
}

@media (prefers-color-scheme: dark) {
  :root {
    --zone-label-normal: #6bbf7b;
    --zone-label-upper: #a2c94d;
    --zone-label-lower: #a2c94d;
    --zone-label-high: #ffe066;
    --zone-label-low: #ffe066;
  }
}
</style>
