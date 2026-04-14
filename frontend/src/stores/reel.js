import { defineStore } from 'pinia'
import api from '../api'

export const useReelStore = defineStore('reel', {
  state: () => ({
    reels: [],
    loading: false,
    error: null
  }),

  actions: {
    async fetchReels() {
      this.loading = true
      try {
        const response = await api.get('/reels')
        this.reels = response.data
        this.error = null
      } catch (error) {
        this.error = error.response?.data?.msg || error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    async createReel(formData) {
      const response = await api.post('/reels', formData)
      this.reels.unshift(response.data)
      return response.data
    },

    async toggleLike(reelId) {
      const response = await api.post(`/reels/${reelId}/like`)
      const reel = this.reels.find((item) => item._id === reelId)

      if (reel) {
        reel.likes = response.data.likes
      }

      return response.data
    },

    async addComment(reelId, commentData) {
      const response = await api.post(`/reels/${reelId}/comment`, commentData)
      const reel = this.reels.find((item) => item._id === reelId)

      if (reel) {
        reel.comments = response.data.comments
      }

      return response.data
    }
  }
})
