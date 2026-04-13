import { defineStore } from 'pinia'
import axios from 'axios'

const API_URL = 'http://localhost:5007/api'

export const useReelStore = defineStore('reel', {
  state: () => ({
    reels: [],
    loading: false
  }),

  actions: {
    async fetchReels() {
      this.loading = true
      try {
        const response = await axios.get(`${API_URL}/reels`)
        this.reels = response.data
      } catch (error) {
        console.error('Failed to fetch reels:', error)
        // Mock data for development
        this.reels = [
          {
            _id: '1',
            caption: 'Beautiful sunset in Gulmi! 🌅',
            videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
            author: {
              _id: '1',
              username: 'gulmi_user'
            },
            likes: ['1', '2'],
            comments: [
              {
                _id: '1',
                content: 'Amazing view!',
                author: { username: 'user1' }
              }
            ],
            createdAt: new Date().toISOString()
          }
        ]
      } finally {
        this.loading = false
      }
    },

    async createReel(formData) {
      try {
        const token = localStorage.getItem('token')
        const response = await axios.post(`${API_URL}/reels`, formData, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        })
        this.reels.unshift(response.data)
        return response.data
      } catch (error) {
        console.error('Failed to create reel:', error)
        // Mock response for development
        const mockReel = {
          _id: Date.now().toString(),
          caption: formData.get('caption'),
          videoUrl: URL.createObjectURL(formData.get('video')),
          author: {
            _id: 'current_user',
            username: 'current_user'
          },
          likes: [],
          comments: [],
          createdAt: new Date().toISOString()
        }
        this.reels.unshift(mockReel)
        return mockReel
      }
    },

    async toggleLike(reelId) {
      try {
        const token = localStorage.getItem('token')
        const response = await axios.post(`${API_URL}/reels/${reelId}/like`, {}, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        const reel = this.reels.find(r => r._id === reelId)
        if (reel) {
          reel.likes = response.data.likes
        }
      } catch (error) {
        console.error('Failed to toggle like:', error)
        // Mock functionality for development
        const reel = this.reels.find(r => r._id === reelId)
        if (reel) {
          const userId = 'current_user' // In real app, get from auth store
          const likeIndex = reel.likes.indexOf(userId)
          if (likeIndex > -1) {
            reel.likes.splice(likeIndex, 1)
          } else {
            reel.likes.push(userId)
          }
        }
      }
    },

    async addComment(reelId, commentData) {
      try {
        const token = localStorage.getItem('token')
        const response = await axios.post(`${API_URL}/reels/${reelId}/comment`, commentData, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        const reel = this.reels.find(r => r._id === reelId)
        if (reel) {
          reel.comments = response.data.comments
        }
      } catch (error) {
        console.error('Failed to add comment:', error)
        // Mock functionality for development
        const reel = this.reels.find(r => r._id === reelId)
        if (reel) {
          const mockComment = {
            _id: Date.now().toString(),
            content: commentData.content,
            author: { username: 'current_user' },
            createdAt: new Date().toISOString()
          }
          reel.comments.push(mockComment)
        }
      }
    }
  }
})