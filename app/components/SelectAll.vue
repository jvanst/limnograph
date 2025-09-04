<template>
  <button
    type="button"
    :disabled="disabled"
    class="inline-flex items-center gap-x-0.5 rounded-md px-2 py-1 text-sm font-medium ring-1 ring-inset
      bg-gray-50 ring-gray-500/10 dark:bg-gray-400/10 dark:ring-gray-400/20 hover:bg-gray-100 dark:hover:bg-gray-500/20
      text-gray-900 dark:text-gray-100
      disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed dark:disabled:bg-gray-800 dark:disabled:text-gray-600"
  >
    <span class="mx-1">Add all</span>
    <PlusIcon
      class="pointer-events-none col-start-1 row-start-1 ml-1 size-5 self-center justify-self-end text-gray-500 sm:size-4 dark:text-gray-400"
      aria-hidden="true"
    />
  </button>
</template>

<script setup lang="ts">
import { PlusIcon } from "@heroicons/vue/16/solid";
defineProps<{ disabled?: boolean }>();
</script>
