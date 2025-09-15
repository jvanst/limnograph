<script setup lang="ts">
import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/vue'
</script>

<template>
  <div class="w-full">
    <!-- Accordion Item 1 -->
    <Disclosure v-slot="{ open }">
      <DisclosureButton class="flex w-full justify-between px-4 py-2 bg-gray-100">
        <span>Display Options</span>
        <span>{{ open ? '−' : '+' }}</span>
      </DisclosureButton>
      <DisclosurePanel class="px-4 py-2">
        <label class="flex items-center space-x-2">
          <input type="checkbox" v-model="showYAxis" />
          <span>Show Y-Axis</span>
        </label>
        <label class="flex items-center space-x-2 mt-2">
          <input type="checkbox" v-model="showOverlay" />
          <span>Show Zone Overlay</span>
        </label>
      </DisclosurePanel>
    </Disclosure>

    <!-- You can add more Disclosure items below for other sections -->
  </div>
</template>

<script lang="ts">
export default {
  data() {
    return {
      showYAxis: true,
      showOverlay: true,
    }
  },
}
</script>