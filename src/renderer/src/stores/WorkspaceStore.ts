import { defineStore } from 'pinia'

export const useWsStore = defineStore('workspace', {
  state: () => {
    return {
      currentWorkspace: '',
      recentWorkspaces: [] as string[],
      selectedFile: '' as string,
      currentFiles: [] as string[],
      currentNote: '' as string,
      showNotes: true as boolean,
      showDice: true as boolean,
      showTimer: false as boolean,
      showCombat: false as boolean,
      lastWidth: 450 as number
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
