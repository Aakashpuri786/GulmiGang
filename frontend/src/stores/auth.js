import { defineStore } from 'pinia'
import axios from 'axios'
import apiConfig from '../config/api'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: localStorage.getItem('token') || null,
    isAuthenticated: !!localStorage.getItem('token')
  }),
  
  getters: {
    currentUser: (state) => state.user,
    isLoggedIn: (state) => state.isAuthenticated
  },
  
  actions: {
    async register(userData) {
      try {
        const res = await axios.post(apiConfig.endpoints.auth.register, userData)
        this.token = res.data.token
        this.user = res.data.user
        this.isAuthenticated = true
        localStorage.setItem('token', this.token)
        axios.defaults.headers.common['Authorization'] = `Bearer ${this.token}`
        return res.data
      } catch (error) {
        console.error('Registration error:', error.response?.data || error.message)
        throw error.response?.data || error
      }
    },
    
    async login(credentials) {
      try {
        const res = await axios.post(apiConfig.endpoints.auth.login, credentials)
        this.token = res.data.token
        this.user = res.data.user
        this.isAuthenticated = true
        localStorage.setItem('token', this.token)
        axios.defaults.headers.common['Authorization'] = `Bearer ${this.token}`
        return res.data
      } catch (error) {
        console.error('Login error:', error.response?.data || error.message)
        throw error.response?.data || error
      }
    },
    
    async getUser() {
      try {
        const res = await axios.get(apiConfig.endpoints.auth.user)
        this.user = res.data
        return res.data
      } catch (error) {
        console.error('Get user error:', error)
        this.logout()
      }
    },
    
    logout() {
      this.user = null
      this.token = null
      this.isAuthenticated = false
      localStorage.removeItem('token')
      delete axios.defaults.headers.common['Authorization']
    },
    
    initAuth() {
      if (this.token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${this.token}`
        axios.defaults.baseURL = apiConfig.API_URL
      }
    }
  }
})