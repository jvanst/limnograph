<script setup lang="ts">
import { SunIcon, MoonIcon } from "@heroicons/vue/24/solid";

const colorMode = useColorMode();

function togglePreference() {
  if (colorMode.preference === "system") {
    colorMode.preference = colorMode.value === "dark" ? "light" : "dark";
  } else {
    colorMode.preference = "system";
  }
}
</script>

<template>
  <button type="button" class="p-1" @click="togglePreference()">
    <MoonIcon class="size-5 block dark:hidden" aria-hidden="true" />
    <SunIcon class="size-5 hidden dark:block" aria-hidden="true" />
  </button>
</template>
