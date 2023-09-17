<script setup lang="ts">
import TitleBar from '@renderer/components/TitleBar.vue'
import DiceRoller from '@renderer/components/DiceRoller.vue'
import PdfContainer from '@renderer/components/PdfContainer.vue'
import Notes from '@renderer/components/Notes.vue'
import NotesBrowser from '@renderer/components/NotesBrowser.vue'
</script>

<template>
  <TitleBar />
  <div class="columns main is-flex-grow-1">
    <div
      class="column is-flex is-flex-direction-column p-2 is-one-third"
      style="padding-right: 0.25rem !important"
    >
      <DiceRoller />
      <Notes />
      <NotesBrowser />
    </div>
    <div
      class="column is-two-thirds is-flex is-flex-direction-column p-2"
      style="padding-left: 0.25rem !important"
    >
      <PdfContainer />
    </div>
  </div>
</template>

<style scoped>
.columns {
  margin: unset !important;
}
</style>
