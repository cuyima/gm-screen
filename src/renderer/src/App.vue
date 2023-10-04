<script setup lang="ts">
import { computed, ref } from 'vue'
import TitleBar from '@renderer/components/TitleBar.vue'
import DiceRoller from '@renderer/components/DiceRoller.vue'
import PdfContainer from '@renderer/components/PdfContainer.vue'
import NotesContainer from './components/NotesContainer.vue'
import ActivityBar from './components/ActivityBar.vue'
import { useWsStore } from './stores/WorkspaceStore'

const store = useWsStore()
const leftPane = ref<HTMLDivElement>()
const rightPane = ref<HTMLDivElement>()

const isLeftPaneVisible = computed(
  () => store.showCombat || store.showDice || store.showNotes || store.showTimer
)
</script>

<template>
  <TitleBar />
  <div class="is-flex is-flex-grow-1 app-panels">
    <div class="activity-bar is-flex app-panel is-flex-direction-column">
      <ActivityBar />
    </div>
    <div
      v-if="isLeftPaneVisible"
      ref="leftPane"
      class="app-panel is-flex is-flex-direction-column left-pane"
    >
      <DiceRoller v-if="store.showDice" />
      <DiceRoller v-if="store.showTimer" />
      <NotesContainer v-if="store.showNotes" />
      <NotesContainer v-if="store.showCombat" />
    </div>
    <div v-if="isLeftPaneVisible" class="app-panel divider px-1 mx-0" draggable="false"></div>
    <div ref="rightPane" class="app-panel is-flex is-flex-grow-1 right-pane"><PdfContainer /></div>
  </div>
</template>

<style scoped>
.app-panels {
  margin-top: 0.25rem;
  margin-right: 0.25rem;
  width: 100%;
}
.app-panel {
  padding-left: 0.25rem;
  padding-right: 0.25rem;
}

.app-panel:nth-child(2):not(:last-child) {
  padding-right: 0;
}
.app-panel:nth-child(4) {
  padding-left: 0;
}
.divider {
  cursor: col-resize;
}

.left-pane {
  /*   min-width: 25%;
  max-width: 40%; */
  width: 40%;
}

.right-pane {
  min-width: 15%;
}
</style>
