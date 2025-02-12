<script setup lang="ts">
defineProps({
  dashed: {
    default: false,
    required: false,
    type: Boolean,
  },
  text: {
    default: "",
    required: false,
    type: String,
  },
});
</script>

<template>
  <div class="my-4 flex items-center">
    <div class="h-px flex-grow bg-gray-200"></div>

    <span v-if="text" class="px-4 text-sm whitespace-nowrap text-gray-500">
      {{ text }}
    </span>

    <div class="h-px flex-grow bg-gray-200"></div>
  </div>
</template>
