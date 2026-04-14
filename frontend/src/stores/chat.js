import { defineStore } from 'pinia'
import { io } from 'socket.io-client'
import api from '../api'
import apiConfig from '../config/api'
import { useAuthStore } from './auth'

const groupKey = 'group'

const sortByNewestMessage = (left, right) => {
  const leftTime = left.lastMessage?.createdAt ? new Date(left.lastMessage.createdAt).getTime() : 0
  const rightTime = right.lastMessage?.createdAt ? new Date(right.lastMessage.createdAt).getTime() : 0
  return rightTime - leftTime
}

export const useChatStore = defineStore('chat', {
  state: () => ({
    groupConversation: null,
    directConversations: [],
    activeConversation: { type: 'group', id: 'group:all' },
    messagesByKey: {},
    onlineUsers: [],
    socket: null,
    loadingConversations: false,
    loadingMessages: false,
    connected: false
  }),

  getters: {
    activeConversationMeta(state) {
      if (state.activeConversation.type === 'group') {
        return state.groupConversation
      }

      return state.directConversations.find((user) => user._id === state.activeConversation.id) || null
    },
    activeMessages(state) {
      const key = state.activeConversation.type === 'group' ? groupKey : state.activeConversation.id
      return state.messagesByKey[key] || []
    }
  },

  actions: {
    setPresence(users) {
      this.onlineUsers = users || []
    },

    isUserOnline(userId) {
      return this.onlineUsers.some((user) => user._id === userId)
    },

    conversationKey(type, id) {
      return type === 'group' ? groupKey : id
    },

    setMessages(type, id, messages) {
      const key = this.conversationKey(type, id)
      this.messagesByKey[key] = [...(messages || [])].sort(
        (left, right) => new Date(left.createdAt) - new Date(right.createdAt)
      )
    },

    upsertIncomingMessage(message) {
      if (!message?._id) {
        return
      }

      const authStore = useAuthStore()
      const myId = authStore.user?._id
      const type = message.chatType === 'group' ? 'group' : 'direct'
      const directPartnerId = type === 'direct'
        ? (message.sender?._id === myId ? message.recipient?._id : message.sender?._id)
        : null
      const key = this.conversationKey(type, type === 'group' ? 'group:all' : directPartnerId)

      const currentMessages = this.messagesByKey[key] || []
      const existingIndex = currentMessages.findIndex((item) => item._id === message._id)

      if (existingIndex === -1) {
        this.messagesByKey[key] = [...currentMessages, message].sort(
          (left, right) => new Date(left.createdAt) - new Date(right.createdAt)
        )
      } else {
        const nextMessages = [...currentMessages]
        nextMessages[existingIndex] = message
        this.messagesByKey[key] = nextMessages
      }

      if (type === 'group') {
        this.groupConversation = {
          ...(this.groupConversation || {
            id: 'group:all',
            name: 'GulmiGang Group',
            membersCount: this.onlineUsers.length || 0
          }),
          lastMessage: message
        }
        return
      }

      const directIndex = this.directConversations.findIndex((user) => user._id === directPartnerId)
      if (directIndex !== -1) {
        this.directConversations[directIndex] = {
          ...this.directConversations[directIndex],
          lastMessage: message
        }
        this.directConversations = [...this.directConversations].sort(sortByNewestMessage)
      }
    },

    async fetchConversations() {
      this.loadingConversations = true
      try {
        const response = await api.get('/messages/conversations')
        this.groupConversation = response.data.group
        this.directConversations = [...response.data.direct].sort(sortByNewestMessage)

        if (
          this.activeConversation.type === 'direct' &&
          !this.directConversations.some((user) => user._id === this.activeConversation.id)
        ) {
          this.activeConversation = { type: 'group', id: 'group:all' }
        }
      } finally {
        this.loadingConversations = false
      }
    },

    async setActiveConversation(type, id) {
      this.activeConversation = { type, id }
      await this.fetchMessages(type, id)
    },

    async fetchMessages(type, id) {
      const key = this.conversationKey(type, id)
      if (this.messagesByKey[key]) {
        return this.messagesByKey[key]
      }

      this.loadingMessages = true
      try {
        if (type === 'group') {
          const response = await api.get('/messages/group')
          this.setMessages(type, id, response.data)
        } else {
          const response = await api.get(`/messages/${id}`)
          this.setMessages(type, id, response.data.messages)

          const directIndex = this.directConversations.findIndex((user) => user._id === id)
          if (directIndex !== -1) {
            this.directConversations[directIndex] = {
              ...this.directConversations[directIndex],
              ...response.data.user
            }
          }
        }

        return this.messagesByKey[key]
      } finally {
        this.loadingMessages = false
      }
    },

    async sendMessage(payload) {
      const response = await api.post('/messages', payload)
      this.upsertIncomingMessage(response.data)
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
        console.error('Chat socket connection failed:', error.message)
      })

      this.socket.on('presence:update', (users) => {
        this.setPresence(users)
      })

      this.socket.on('messages:created', (message) => {
        this.upsertIncomingMessage(message)
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
