import { defineStore } from 'pinia'
import axios from 'axios'
import apiConfig from '../config/api'

const setAuthHeader = (token) => {
  if (token) {
    axios.defaults.headers.common['x-auth-token'] = token
  } else {
    delete axios.defaults.headers.common['x-auth-token']
  }
}

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
        this.isAuthenticated = true
        localStorage.setItem('token', this.token)
        setAuthHeader(this.token)
        await this.getUser()
        return res.data
      } catch (error) {
        console.error('Registration error:', error.response?.data || error.message)
        throw error
      }
    },
    
    async login(credentials) {
      try {
        const res = await axios.post(apiConfig.endpoints.auth.login, credentials)
        this.token = res.data.token
        this.isAuthenticated = true
        localStorage.setItem('token', this.token)
        setAuthHeader(this.token)
        await this.getUser()
        return res.data
      } catch (error) {
        console.error('Login error:', error.response?.data || error.message)
        throw error
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
        throw error
      }
    },
    
    logout() {
      this.user = null
      this.token = null
      this.isAuthenticated = false
      localStorage.removeItem('token')
      setAuthHeader(null)
    },
    
    async initAuth() {
      axios.defaults.baseURL = apiConfig.API_URL

      if (this.token) {
        setAuthHeader(this.token)
        try {
          await this.getUser()
        } catch {
          return false
        }
      }

      return !!this.token
    }
  }
})
