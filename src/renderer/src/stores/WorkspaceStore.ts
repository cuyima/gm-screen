import { defineStore } from 'pinia'

export const useWsStore = defineStore('workspace', {
  state: () => {
    return {
      workspace: '',
      currentNotePath: ''
    }
  },
  actions: {
    setWorkspace(payload: string) {
      this.workspace = payload
    },
    setCurrentNotePath(payload: string) {
      this.currentNotePath = payload
    }
  }
})
