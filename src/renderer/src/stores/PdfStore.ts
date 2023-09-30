import { defineStore } from 'pinia'

export const usePdfStore = defineStore('workspace', {
  state: () => {
    return {
      currentPage: 1
    }
  }
})
