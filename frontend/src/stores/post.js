import { defineStore } from 'pinia'
import api from '../api'

export const usePostStore = defineStore('post', {
  state: () => ({
    posts: [],
    loading: false,
    error: null
  }),
  actions: {
    async fetchPosts() {
      this.loading = true
      try {
        const res = await api.get('/posts')
        this.posts = res.data
        this.error = null
      } catch (err) {
        this.error = err.response?.data?.msg || err.message
      } finally {
        this.loading = false
      }
    },
    async createPost(postData) {
      try {
        const res = await api.post('/posts', postData)
        this.posts.unshift(res.data)
        return res.data
      } catch (err) {
        throw err
      }
    },
    async likePost(postId) {
      try {
        const res = await api.put(`/posts/${postId}/like`)
        const index = this.posts.findIndex(p => p._id === postId)
        if (index !== -1) {
          this.posts[index] = res.data
        }
        return res.data
      } catch (err) {
        throw err
      }
    },
    async addComment(postId, text) {
      try {
        const res = await api.post(`/posts/${postId}/comment`, { text })
        const index = this.posts.findIndex(p => p._id === postId)
        if (index !== -1) {
          this.posts[index] = res.data
        }
        return res.data
      } catch (err) {
        throw err
      }
    }
  }
})