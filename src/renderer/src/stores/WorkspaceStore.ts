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
    addRecentWorkspace(payload: string) {
      if (!this.recentWorkspaces.includes(payload)) {
        this.recentWorkspaces.unshift(payload)
      }
      if (this.recentWorkspaces.length > 5) {
        this.recentWorkspaces.splice(5)
      }
    }
  },
  persist: true
})
