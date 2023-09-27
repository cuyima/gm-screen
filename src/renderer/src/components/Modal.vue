<script setup lang="ts">
import { defineProps } from 'vue'

const props = defineProps({
  title: String,
  message: {
    type: String,
    required: false
  }
})
defineEmits(['confirm', 'cancel'])
</script>

<template>
  <div class="modal is-active">
    <div class="modal-background"></div>
    <div class="modal-card">
      <header class="modal-card-head">
        <span class="modal-card-title">{{ props.title }}</span>
        <button class="delete ml-3" aria-label="close" @click="$emit('cancel')"></button>
      </header>
      <section v-if="message && message != ''" class="modal-card-body">
        {{ props.message }}
      </section>
      <footer class="modal-card-foot">
        <button class="button is-family-secondary" @click="$emit('confirm')">Confirm</button>
        <button class="button is-family-secondary" @click="$emit('cancel')">Cancel</button>
      </footer>
    </div>
  </div>
</template>

<style scoped></style>
