<script setup lang="ts">
const props = defineProps({
  message: {
    type: String,
    required: false
  }
})
</script>

<template>
  <div class="pageloader">
    <div class="pageloader-circle-container"><div class="pageloader-circle"></div></div>
    <div v-if="props.message" class="pageloader-message">{{ props.message }}</div>
  </div>
</template>
