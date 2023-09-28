import { defineStore } from 'pinia'

export const useWsStore = defineStore('workspace', {
  state: () => {
    return {
      currentWorkspace: '',
      recentWorkspaces: [] as string[],
      selectedFile: '' as string,
      currentFiles: [] as string[],
      currentNote: '' as string
    }
  },
  actions: {
    addWorkspace(payload: string) {
      let ws = this.recentWorkspaces
      if (ws.includes(payload)) {
        ws = ws.filter((item) => item != payload)
      }
      ws.unshift(payload)
      if (ws.length > 5) {
        ws.splice(5)
      }
      this.currentWorkspace = payload
      this.recentWorkspaces = ws
      this.currentNote = ''
    }
  },
  persist: true
})
