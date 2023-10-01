import { defineStore } from 'pinia'

export const usePdfStore = defineStore('workspace', {
  state: () => {
    return {
      currentPage: 1,
      totalPages: 1
    }
  }
})
