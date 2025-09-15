<template>
  <button
    type="button"
    :disabled="disabled"
    class="appearance-none rounded-md bg-gray-50 py-1.5 pl-3 pr-3 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-indigo-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:*:bg-gray-800 dark:focus-visible:outline-indigo-500 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed dark:disabled:bg-gray-800 dark:disabled:text-gray-600 inline-flex items-center gap-x-0.5"
  >
    <span class="mx-1">All years</span>
    <ChartBarIcon
      class="pointer-events-none col-start-1 row-start-1 ml-1 size-5 self-center justify-self-end text-gray-500 sm:size-4 dark:text-gray-400"
      aria-hidden="true"
    />
  </button>
</template>

<script setup lang="ts">
import { ChartBarIcon } from "@heroicons/vue/24/outline";
defineProps<{ disabled?: boolean }>();
</script>
