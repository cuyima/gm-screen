<script setup lang="ts">
import { useWsStore } from '../stores/WorkspaceStore'

const store = useWsStore()

function toggleNotes() {
  store.showNotes = !store.showNotes
  store.showCombat = false
}

function toggleCombat() {
  store.showCombat = !store.showCombat
  store.showNotes = false
}

function toggleDice() {
  store.showDice = !store.showDice
  store.showTimer = false
}
function toggleTimer() {
  store.showTimer = !store.showTimer
  store.showDice = false
}
</script>

<template>
  <div
    class="box is-flex-grow-1 is-flex is-flex-direction-column is-align-items-center is-justify-content-space-between py-1 p-0 m-0"
  >
    <div class="is-flex is-flex-direction-column">
      <button class="button is-activity" @click="toggleDice">
        <span class="icon fa-2x"> <i class="fas fa-dice-d20"></i></span>
      </button>
      <button class="button is-activity" @click="toggleTimer">
        <span class="icon fa-2x"><i class="far fa-hourglass"></i></span>
      </button>
      <hr class="my-1" />
      <button class="button is-activity" @click="toggleNotes">
        <span class="icon fa-2x"> <i class="fas fa-pen-nib"></i></span>
      </button>
      <button class="button is-activity" @click="toggleCombat">
        <span class="icon fa-2x"> <i class="fas fa-khanda"></i></span>
      </button>
    </div>
    <div class="spacer is-flex-grow-1"></div>
    <div class="is-flex is-flex-direction-column">
      <button class="button is-activity">
        <span class="icon fa-2x"> <i class="fas fa-cog"></i></span>
      </button>
    </div>
  </div>
</template>

<style lang="scss">
@import '../assets/css/variables.scss';

.box {
  width: 2.5em;
}
</style>
