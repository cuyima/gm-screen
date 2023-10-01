<script setup lang="ts">
import { computed, watch, ref } from 'vue'
import { usePdfStore } from '@renderer/stores/PdfStore'

const pdfStore = usePdfStore()
const currentPage = computed(() => pdfStore.currentPage)
const pageInput = ref<number>(pdfStore.currentPage)

watch(currentPage, () => {
  pageInput.value = currentPage.value
})

function updatePage() {
  if (pageInput.value < 1) {
    pdfStore.currentPage
  } else if (pageInput.value > pdfStore.totalPages) {
    pdfStore.currentPage = pdfStore.totalPages
  } else {
    pdfStore.currentPage = pageInput.value
  }
}
</script>

<template>
  <div class="toolbar-container is-flex is-justify-content-center is-align-items-center">
    <div class="page-control buttons has-addons">
      <button
        class="button down is-small"
        :class="pdfStore.currentPage == 1 ? 'is-static' : ''"
        @click="pdfStore.currentPage = Math.max(pdfStore.currentPage - 1, 1)"
      >
        <span class="icon is-small"> <i class="fas fa-chevron-left"></i> </span>
      </button>
      <input v-model="pageInput" class="current-page button is-small" @keydown.enter="updatePage" />
      <button class="button up is-small" @click="pdfStore.currentPage++">
        <span class="icon is-small"> <i class="fas fa-chevron-right"></i> </span>
      </button>
    </div>
    <div class="mx-2"></div>
    <!--
    <div class="zoom-control buttons has-addons">
      <button class="button down is-small" @click="pdfStore.currentPage--">
        <span class="icon is-small"> <i class="fas fa-chevron-left"></i> </span>
      </button>
      <input v-model="pageInput" class="current-page button is-small" @keydown.enter="updatePage" />
      <button class="button up is-small" @click="pdfStore.currentPage++">
        <span class="icon is-small"> <i class="fas fa-chevron-right"></i> </span>
      </button>
    </div>-->
  </div>
</template>

<style scoped>
.current-page {
  width: 4em;
  text-align: center;
}
</style>
