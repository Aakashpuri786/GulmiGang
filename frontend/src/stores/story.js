import { defineStore } from 'pinia'
import { io } from 'socket.io-client'
import api from '../api'
import apiConfig from '../config/api'

const normalizeGroup = (group) => {
  const items = [...(group.items || [])].sort(
    (left, right) => new Date(right.createdAt) - new Date(left.createdAt)
  )
  const author = group.author || items[0]?.author || null

  return {
    author,
    items
  }
}

export const useStoryStore = defineStore('story', {
  state: () => ({
    storyGroups: [],
    onlineUsers: [],
    socket: null,
    loading: false,
    connected: false
  }),

  getters: {
    storyTiles: (state) => {
      const merged = new Map()

      state.storyGroups.forEach((group) => {
        const normalizedGroup = normalizeGroup(group)
        const author = normalizedGroup.author

        if (!author?._id) {
          return
        }

        merged.set(author._id, {
          ...author,
          hasStory: normalizedGroup.items.length > 0,
          isOnline: state.onlineUsers.some((user) => user._id === author._id),
          latestStory: normalizedGroup.items[0] || null,
          stories: normalizedGroup.items
        })
      })

      state.onlineUsers.forEach((user) => {
        if (!merged.has(user._id)) {
          merged.set(user._id, {
            ...user,
            hasStory: false,
            isOnline: true,
            latestStory: null,
            stories: []
          })
        } else {
          merged.set(user._id, {
            ...merged.get(user._id),
            ...user,
            isOnline: true
          })
        }
      })

      return Array.from(merged.values()).sort((left, right) => {
        if (left.isOnline !== right.isOnline) {
          return left.isOnline ? -1 : 1
        }

        if (left.hasStory !== right.hasStory) {
          return left.hasStory ? -1 : 1
        }

        const leftTime = left.latestStory?.createdAt ? new Date(left.latestStory.createdAt).getTime() : 0
        const rightTime = right.latestStory?.createdAt ? new Date(right.latestStory.createdAt).getTime() : 0
        return rightTime - leftTime
      })
    }
  },

  actions: {
    setStoryGroups(groups) {
      this.storyGroups = (groups || []).map(normalizeGroup)
    },

    setOnlineUsers(users) {
      this.onlineUsers = users || []
    },

    upsertStory(story) {
      const authorId = story?.author?._id
      if (!authorId) {
        return
      }

      const index = this.storyGroups.findIndex((group) => group.author?._id === authorId)

      if (index === -1) {
        this.storyGroups.unshift(normalizeGroup({
          author: story.author,
          items: [story]
        }))
        return
      }

      const nextItems = [
        story,
        ...this.storyGroups[index].items.filter((item) => item._id !== story._id)
      ].sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt))

      this.storyGroups[index] = normalizeGroup({
        author: story.author,
        items: nextItems
      })
    },

    async fetchStories() {
      this.loading = true
      try {
        const response = await api.get('/stories')
        this.setStoryGroups(response.data.stories)
        this.setOnlineUsers(response.data.onlineUsers)
      } finally {
        this.loading = false
      }
    },

    async createStory(payload) {
      const response = await api.post('/stories', payload)
      this.upsertStory(response.data)
      return response.data
    },

    initRealtime(token) {
      if (!token) {
        return
      }

      const currentToken = this.socket?.auth?.token
      if (this.socket && currentToken === token) {
        if (!this.socket.connected) {
          this.socket.connect()
        }
        return
      }

      this.disconnectSocket()

      this.socket = io(apiConfig.WS_URL, {
        transports: ['websocket'],
        auth: { token }
      })

      this.socket.on('connect', () => {
        this.connected = true
      })

      this.socket.on('disconnect', () => {
        this.connected = false
      })

      this.socket.on('connect_error', (error) => {
        this.connected = false
        console.error('Story socket connection failed:', error.message)
      })

      this.socket.on('presence:update', (users) => {
        this.setOnlineUsers(users)
      })

      this.socket.on('stories:created', (story) => {
        this.upsertStory(story)
      })
    },

    disconnectSocket() {
      if (this.socket) {
        this.socket.off()
        this.socket.disconnect()
        this.socket = null
      }

      this.connected = false
      this.onlineUsers = []
    }
  }
})
