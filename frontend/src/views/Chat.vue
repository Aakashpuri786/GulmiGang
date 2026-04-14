<template>
  <div class="chat-page">
    <aside class="chat-sidebar">
      <div class="sidebar-header">
        <div>
          <p class="eyebrow">Chat</p>
          <h2>{{ user?.username || 'Your chats' }}</h2>
        </div>
        <span class="live-pill" :class="{ connected: chatStore.connected }">
          {{ chatStore.connected ? 'Realtime' : 'Offline' }}
        </span>
      </div>

      <button
        type="button"
        class="conversation-card group-card"
        :class="{ active: activeConversation.type === 'group' }"
        @click="openGroup"
      >
        <div>
          <strong>GulmiGang Group</strong>
          <span>{{ groupSubtitle }}</span>
        </div>
        <small>{{ formatPreviewTime(chatStore.groupConversation?.lastMessage?.createdAt) }}</small>
      </button>

      <div class="sidebar-section">
        <div class="section-head">
          <h3>Direct messages</h3>
          <span>{{ directConversations.length }} users</span>
        </div>

        <div v-if="chatStore.loadingConversations" class="sidebar-empty">
          Loading conversations...
        </div>

        <button
          v-for="conversation in directConversations"
          :key="conversation._id"
          type="button"
          class="conversation-card"
          :class="{ active: activeConversation.type === 'direct' && activeConversation.id === conversation._id }"
          @click="openDirect(conversation._id)"
        >
          <div class="conversation-user">
            <div class="avatar">
              <span>{{ getInitial(conversation.username) }}</span>
              <i class="status-dot" :class="{ online: isOnline(conversation._id) }"></i>
            </div>
            <div class="conversation-copy">
              <strong>{{ conversation.username }}</strong>
              <span>{{ lastMessagePreview(conversation.lastMessage) }}</span>
            </div>
          </div>
          <small>{{ formatPreviewTime(conversation.lastMessage?.createdAt) }}</small>
        </button>
      </div>
    </aside>

    <section class="chat-panel">
      <div class="panel-header">
        <div>
          <p class="panel-title">{{ activeTitle }}</p>
          <p class="panel-subtitle">{{ activeSubtitle }}</p>
        </div>
      </div>

      <div ref="messageList" class="messages-shell">
        <div v-if="chatStore.loadingMessages && !messages.length" class="messages-empty">
          Loading conversation...
        </div>

        <div v-else-if="!messages.length" class="messages-empty">
          Start the conversation here.
        </div>

        <div
          v-for="message in messages"
          :key="message._id"
          class="message-row"
          :class="{ mine: message.sender?._id === user?._id }"
        >
          <div class="message-bubble">
            <strong v-if="activeConversation.type === 'group' && message.sender?._id !== user?._id">
              {{ message.sender?.username }}
            </strong>
            <p>{{ message.text }}</p>
            <span>{{ formatMessageTime(message.createdAt) }}</span>
          </div>
        </div>
      </div>

      <form class="composer" @submit.prevent="sendMessage">
        <textarea
          v-model="draft"
          class="composer-input"
          rows="2"
          maxlength="1000"
          placeholder="Write a message..."
        ></textarea>
        <button type="submit" class="btn btn-primary" :disabled="sending || !draft.trim()">
          {{ sending ? 'Sending...' : 'Send' }}
        </button>
      </form>
    </section>
  </div>
</template>

<script>
import { nextTick } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useChatStore } from '../stores/chat'

export default {
  setup() {
    const authStore = useAuthStore()
    const chatStore = useChatStore()
    return { authStore, chatStore }
  },
  data() {
    return {
      draft: '',
      sending: false
    }
  },
  computed: {
    user() {
      return this.authStore.user
    },
    activeConversation() {
      return this.chatStore.activeConversation
    },
    directConversations() {
      return this.chatStore.directConversations
    },
    messages() {
      return this.chatStore.activeMessages
    },
    activeMeta() {
      return this.chatStore.activeConversationMeta
    },
    activeTitle() {
      return this.activeConversation.type === 'group'
        ? 'GulmiGang Group'
        : this.activeMeta?.username || 'Direct chat'
    },
    activeSubtitle() {
      if (this.activeConversation.type === 'group') {
        const members = this.chatStore.groupConversation?.membersCount || this.directConversations.length + 1
        return `${members} members in the shared group chat`
      }

      return this.isOnline(this.activeMeta?._id)
        ? `${this.activeMeta?.username} is online`
        : `Chatting with ${this.activeMeta?.username || 'user'}`
    },
    groupSubtitle() {
      const lastMessage = this.chatStore.groupConversation?.lastMessage
      if (lastMessage) {
        return `${lastMessage.sender?.username || 'Someone'}: ${lastMessage.text}`
      }

      const members = this.chatStore.groupConversation?.membersCount || this.directConversations.length + 1
      return `${members} members can chat here`
    }
  },
  async mounted() {
    try {
      await this.chatStore.fetchConversations()
      await this.chatStore.setActiveConversation('group', 'group:all')
      this.scrollToBottom()
    } catch (error) {
      alert('Failed to load chat: ' + (error.response?.data?.msg || error.message))
    }
  },
  watch: {
    messages() {
      this.scrollToBottom()
    }
  },
  methods: {
    async openGroup() {
      await this.chatStore.setActiveConversation('group', 'group:all')
    },

    async openDirect(userId) {
      await this.chatStore.setActiveConversation('direct', userId)
    },

    async sendMessage() {
      if (!this.draft.trim()) {
        return
      }

      this.sending = true
      try {
        const payload = this.activeConversation.type === 'group'
          ? { chatType: 'group', text: this.draft.trim() }
          : { chatType: 'direct', recipientId: this.activeConversation.id, text: this.draft.trim() }

        await this.chatStore.sendMessage(payload)
        this.draft = ''
      } catch (error) {
        const message = error.response?.data?.errors?.[0]?.msg || error.response?.data?.msg || error.message
        alert('Failed to send message: ' + message)
      } finally {
        this.sending = false
      }
    },

    isOnline(userId) {
      return userId ? this.chatStore.isUserOnline(userId) : false
    },

    getInitial(username) {
      return String(username || '?').charAt(0).toUpperCase()
    },

    lastMessagePreview(message) {
      if (!message) {
        return 'Start chatting'
      }

      const prefix = message.sender?._id === this.user?._id ? 'You: ' : ''
      return `${prefix}${message.text}`
    },

    formatPreviewTime(dateString) {
      if (!dateString) {
        return ''
      }

      const date = new Date(dateString)
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    },

    formatMessageTime(dateString) {
      return new Date(dateString).toLocaleTimeString([], {
        hour: 'numeric',
        minute: '2-digit'
      })
    },

    async scrollToBottom() {
      await nextTick()
      const container = this.$refs.messageList
      if (container) {
        container.scrollTop = container.scrollHeight
      }
    }
  }
}
</script>

<style scoped>
.chat-page {
  display: grid;
  grid-template-columns: minmax(280px, 360px) minmax(0, 1fr);
  gap: 22px;
  min-height: calc(100vh - 260px);
}

.chat-sidebar,
.chat-panel {
  background: white;
  border: 1px solid #e8edf6;
  border-radius: 26px;
  box-shadow: 0 18px 44px rgba(31, 44, 72, 0.08);
}

.chat-sidebar {
  padding: 20px;
  display: grid;
  align-content: start;
  gap: 18px;
}

.sidebar-header,
.panel-header,
.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
}

.eyebrow {
  margin: 0 0 8px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 0.76rem;
  font-weight: 800;
  color: #7280da;
}

.sidebar-header h2,
.section-head h3,
.panel-title {
  margin: 0;
  color: #1f2c48;
}

.live-pill {
  padding: 8px 12px;
  border-radius: 999px;
  background: #eef2ff;
  color: #6372c7;
  font-size: 0.78rem;
  font-weight: 700;
}

.live-pill.connected {
  background: #e8fff2;
  color: #1f9d63;
}

.sidebar-section {
  display: grid;
  gap: 12px;
}

.section-head span,
.panel-subtitle,
.conversation-copy span,
.conversation-card small,
.message-bubble span,
.sidebar-empty {
  color: #71809c;
  font-size: 0.84rem;
}

.conversation-card {
  border: 1px solid #e8edf6;
  background: #fbfcff;
  border-radius: 20px;
  padding: 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  text-align: left;
  cursor: pointer;
  font: inherit;
}

.conversation-card.active {
  border-color: #9eacf4;
  background: #f1f4ff;
}

.group-card {
  background: linear-gradient(180deg, #f6f8ff 0%, #fbfdff 100%);
}

.conversation-user {
  display: flex;
  align-items: center;
  gap: 12px;
}

.conversation-copy {
  display: grid;
  gap: 4px;
}

.conversation-copy strong,
.message-bubble strong {
  color: #22314d;
}

.avatar {
  width: 42px;
  height: 42px;
  border-radius: 16px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  display: grid;
  place-items: center;
  font-weight: 800;
  position: relative;
}

.status-dot {
  position: absolute;
  right: -2px;
  bottom: -2px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #c7cedd;
  border: 2px solid white;
}

.status-dot.online {
  background: #22c55e;
}

.chat-panel {
  display: grid;
  grid-template-rows: auto minmax(0, 1fr) auto;
  overflow: hidden;
}

.panel-header {
  padding: 22px 24px;
  border-bottom: 1px solid #edf1f8;
}

.messages-shell {
  padding: 24px;
  overflow-y: auto;
  background:
    radial-gradient(circle at top right, rgba(102, 126, 234, 0.08), transparent 30%),
    #fbfcff;
}

.messages-empty {
  height: 100%;
  display: grid;
  place-items: center;
  color: #71809c;
  text-align: center;
}

.message-row {
  display: flex;
  margin-bottom: 14px;
}

.message-row.mine {
  justify-content: flex-end;
}

.message-bubble {
  max-width: min(520px, 84%);
  padding: 14px 16px;
  border-radius: 22px 22px 22px 8px;
  background: white;
  border: 1px solid #e7ecf5;
  box-shadow: 0 10px 24px rgba(33, 46, 78, 0.06);
}

.message-row.mine .message-bubble {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border-color: transparent;
  border-radius: 22px 22px 8px 22px;
}

.message-row.mine .message-bubble strong,
.message-row.mine .message-bubble span,
.message-row.mine .message-bubble p {
  color: white;
}

.message-bubble p {
  margin: 6px 0 8px;
  line-height: 1.6;
}

.composer {
  padding: 18px 24px 24px;
  border-top: 1px solid #edf1f8;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 12px;
}

.composer-input {
  width: 100%;
  border: 1px solid #d7deeb;
  border-radius: 18px;
  padding: 14px 16px;
  font: inherit;
  resize: none;
}

.composer-input:focus {
  outline: none;
  border-color: #7280da;
  box-shadow: 0 0 0 4px rgba(114, 128, 218, 0.12);
}

.btn {
  border: none;
  border-radius: 16px;
  padding: 14px 18px;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}

.btn-primary {
  color: white;
  background: linear-gradient(135deg, #667eea, #764ba2);
  box-shadow: 0 12px 24px rgba(102, 126, 234, 0.22);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  box-shadow: none;
}

@media (max-width: 900px) {
  .chat-page {
    grid-template-columns: 1fr;
  }

  .chat-sidebar {
    order: 2;
  }

  .chat-panel {
    min-height: 62vh;
  }
}

@media (max-width: 768px) {
  .chat-page {
    gap: 16px;
  }

  .sidebar-header,
  .panel-header,
  .section-head {
    flex-direction: column;
    align-items: flex-start;
  }

  .composer {
    grid-template-columns: 1fr;
  }

  .btn {
    width: 100%;
  }

  .message-bubble {
    max-width: 92%;
  }
}
</style>
