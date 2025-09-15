
<template>
  <span
    class="inline-flex items-center gap-x-1.5 rounded-md bg-gray-50 px-3 py-1.5 text-base font-semibold text-gray-600 ring-1 ring-inset ring-gray-300 dark:bg-gray-400/10 dark:text-gray-400 dark:ring-gray-400/20 hover:bg-gray-100 hover:ring-gray-500/20 dark:hover:bg-gray-400/20 dark:hover:ring-gray-400/40 cursor-pointer transition-colors"
  >
    <span
      class="inline-block mr-1.5 rounded-full"
      :style="{ width: '1.1em', height: '1.1em', background: color, display: 'inline-block' }"
    />
    {{ label }}
    <button
      type="button"
      class="group relative -mr-1 size-4 rounded-md hover:bg-gray-500/20 dark:hover:bg-gray-500/30"
      @click="$emit('remove')"
    >
      <span class="sr-only">Remove</span>
      <svg
        viewBox="0 0 14 14"
        class="size-4 stroke-gray-600/50 group-hover:stroke-gray-600/75 dark:stroke-gray-400 dark:group-hover:stroke-gray-300"
      >
        <path d="M4 4l6 6m0-6l-6 6" />
      </svg>
      <span class="absolute -inset-1" />
    </button>
  </span>
</template>

<script setup lang="ts">
defineProps<{
  label: string;
  color?: string;
}>();

defineEmits<{
  (e: 'remove'): void;
}>();
</script>