<script setup lang="ts">
import { ref } from 'vue'
const dice = [4, 6, 8, 10, 12, 20]
const number = ref<number>(1)
const dieResult = ref('')
const isInvalid = ref(false)

function rollDice(die: number) {
  const no = number.value
  if (isNaN(no) || no > 99) {
    isInvalid.value = true
    return
  }

  isInvalid.value = false
  const results: number[] = []
  for (let i = 1; i <= no; i++) {
    results.push(Math.floor(Math.random() * die) + 1)
  }
  const sum = results.reduce((accumulator, currentValue) => accumulator + currentValue, 0)

  if (no <= 1) {
    dieResult.value = '' + sum
    return
  }

  dieResult.value =
    results.reduce((accumulator, currentValue, index, array) => {
      return accumulator + currentValue + (index < array.length - 1 ? ' + ' : '')
    }, '') + ` = ${sum}`
}

function getImgUrl(die: number) {
  return new URL(`../assets/img/d${die}.png`, import.meta.url).href
}
</script>

<template>
  <div class="box mb-2">
    <div class="columns">
      <input
        v-model="number"
        class="column input has-text-centered is-flex"
        placeholder="1"
        :class="isInvalid ? 'is-danger' : ''"
      />
      <a v-for="die of dice" :key="die" class="column dice is-flex" @click="rollDice(die)">
        <img :src="getImgUrl(die)" />
      </a>
    </div>
    <div class="container notification">
      <div class="text subtitle">{{ dieResult }}</div>
    </div>
  </div>
</template>

<style scoped>
.column {
  margin: 0.5rem;
}

.dice {
  padding: 0;
  height: 2.5em;
  justify-content: center;
}

img {
  object-fit: contain;
  -webkit-user-drag: none;
  user-select: none;
}

.dice:hover {
  animation: spin 1.5s infinite linear;
}

.text {
  min-height: 1.5em;
}

.notification {
  padding: 0.75rem 1.5rem 0.5rem 0.5rem;
}

@-webkit-keyframes spin {
  100% {
    -webkit-transform: rotate(360deg);
  }
}

@keyframes spin {
  100% {
    -webkit-transform: rotate(360deg);
    transform: rotate(360deg);
  }
}
</style>
