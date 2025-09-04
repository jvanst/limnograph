<script setup lang="ts">
import * as d3 from "d3";
import { YEARS, GLOBAL_MIN, GLOBAL_MAX } from "~/data/years";

const props = defineProps<{
  series: YearlyPoints[];
}>();

const svg = ref<SVGSVGElement | null>(null);
const container = ref<HTMLElement | null>(null);
const width = ref(800);
const height = ref(400);

const tooltip = ref({
  show: false,
  x: 0,
  y: 0,
  year: null as number | null,
  value: null as number | null,
  day: null as number | null,
});

let resizeObserver: ResizeObserver | null = null;

function updateChartWidth() {
  if (container.value) width.value = container.value.clientWidth;
}

function drawChart() {
  // If no SVG or no data, do nothing
  if (!svg.value || !props.series.length) return;

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

  // Create ticks for each month for the x-axis
  const monthTicks = d3
    .range(0, 12)
    .map((m) => d3.timeMonth.offset(new Date(2000, 0, 1), m));
  // X axis: shows months
  const xAxis = d3
    .axisBottom(x)
    .tickValues(
      monthTicks.map((d) => d3.timeDay.count(new Date(2000, 0, 1), d))
    )
    .tickFormat((d, i) =>
      d3.timeFormat("%b")(monthTicks[i] ?? new Date(2000, i, 1))
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

  // Color scale: assigns a unique color to each year
  // Ensure consistent color mapping across years and browsing sessions
  const colorPalette = [
    ...d3.schemeCategory10,
    ...(Array.isArray(d3.schemeSet3) ? d3.schemeSet3 : []),
    ...(Array.isArray(d3.schemePaired) ? d3.schemePaired : []),
    ...(Array.isArray(d3.schemeDark2) ? d3.schemeDark2 : []),
  ].filter((c) => typeof c === "string");
  const color = d3
    .scaleOrdinal<string, string>()
    .domain(YEARS.map(String))
    .range(colorPalette.slice(0, YEARS.length));

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
    .attr("stroke-width", 1.5)
    .attr("d", (d) =>
      d3
        .line<[number, number]>()
        .x(([day]) => x(day))
        .y(([_, value]) => y(value))(d.line)
    )
    .attr("opacity", 1);

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
      // Reset lines and hide dot/tooltip
      pathElements.attr("stroke-width", 1.5).attr("opacity", 1);
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

// Redraw chart whenever the data changes
watch(() => props.series, drawChart);
</script>

<template>
  <div ref="container" class="w-full relative">
    <svg v-if="props.series.length" ref="svg" class="block w-full h-auto"></svg>
    <div
      v-else
      class="flex items-center justify-center w-full text-gray-400 dark:text-gray-300 text-lg bg-white dark:bg-[#182c3a] border border-dashed border-gray-200 dark:border-gray-700 rounded-lg"
      :style="{ height: height + 'px', minHeight: '200px' }"
    >
      No data to display.
    </div>

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
        <b>{{ tooltip.year }}</b> — Day {{ tooltip.day }}
      </div>
      <div>
        Value: <b>{{ tooltip.value?.toFixed(2) }}m</b>
      </div>
    </div>
  </div>
</template>
