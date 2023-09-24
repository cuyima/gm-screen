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
    setWorkspace(payload: string) {
      this.currentWorkspace = payload
    },
    addRecentWorkspace(payload: string) {
      if (!this.recentWorkspaces.includes(payload)) {
        this.recentWorkspaces.unshift(payload)
      }
      if (this.recentWorkspaces.length > 5) {
        this.recentWorkspaces.splice(5)
      }
    },
    setCurrentFile(payload: string) {
      this.selectedFile = payload
    },
    setRecentFiles(payload: [string]) {
      this.currentFiles = payload
    },
    setCurrentNote(payload: string) {
      this.currentNote = payload
    }
  },
  persist: true
})
