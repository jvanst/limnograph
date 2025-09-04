<template>
  <label for="location" class="sr-only">Location</label>
  <div class="grid grid-cols-1">
    <select
      id="location"
      v-model="selectedYear"
      name="location"
      class="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white py-1.5 pl-3 pr-8 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-indigo-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:*:bg-gray-800 dark:focus-visible:outline-indigo-500 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed dark:disabled:bg-gray-800 dark:disabled:text-gray-600"
      :disabled="years.length === disabledYears.length"
      @input="(e) => handleSelect(e)"
    >
      <option value="" disabled>Add year</option>
      <option
        v-for="year in years"
        :key="year"
        :value="year"
        :disabled="disabledYears.includes(year)"
      >
        {{ year }}
      </option>
    </select>
    <ChevronDownIcon
      class="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-500 sm:size-4 dark:text-gray-400"
      aria-hidden="true"
    />
  </div>
</template>

<script setup lang="ts">
import { ChevronDownIcon } from "@heroicons/vue/16/solid";
import { nextTick } from "vue";

defineProps<{
  years: number[];
  disabledYears: number[];
}>();

const emit = defineEmits<{
  (e: "select", year: number): void;
}>();

const selectedYear = ref<string | null>("");

function handleSelect(event: Event) {
  const value = (event.target as HTMLSelectElement).value;

  if (!value) return;
  else emit("select", Number(value));

  nextTick(() => {
    selectedYear.value = "";
  });
}
</script>
