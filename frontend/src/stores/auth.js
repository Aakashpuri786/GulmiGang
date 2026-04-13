import { defineStore } from 'pinia'
import api from '../api'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: localStorage.getItem('token') || null,
    isAuthenticated: !!localStorage.getItem('token')
  }),
  actions: {
    async register(userData) {
      console.log('Registration attempt with:', userData); // Debug log
      try {
        const res = await api.post('/auth/register', userData)
        console.log('Registration response:', res.data); // Debug log
        this.token = res.data.token
        localStorage.setItem('token', this.token)
        this.isAuthenticated = true
        await this.getUser()
        return res.data
      } catch (err) {
        console.error('Registration error:', err.response?.data || err.message); // Debug log
        throw err
      }
    },
    async login(credentials) {
      console.log('Login attempt with:', credentials); // Debug log
      try {
        const res = await api.post('/auth/login', credentials)
        console.log('Login response:', res.data); // Debug log
        this.token = res.data.token
        localStorage.setItem('token', this.token)
        this.isAuthenticated = true
        await this.getUser()
        return res.data
      } catch (err) {
        console.error('Login error:', err.response?.data || err.message); // Debug log
        throw err
      }
    },
    async getUser() {
      try {
        const res = await api.get('/auth/user')
        this.user = res.data
      } catch (err) {
        this.logout()
      }
    },
    logout() {
      this.user = null
      this.token = null
      this.isAuthenticated = false
      localStorage.removeItem('token')
    }
  }
})