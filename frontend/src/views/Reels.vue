<template>
  <div class="reels">
    <div class="reels-container">
      <div class="reels-header">
        <h2>Reels</h2>
        <p>Watch and share short videos from the Gulmi community</p>
      </div>

      <div v-if="reels.length === 0" class="empty-state">
        <div class="empty-icon">🎥</div>
        <h3>No reels yet</h3>
        <p>Be the first to share a reel with the community!</p>
        <router-link to="/create" class="btn btn-primary">Create a Reel</router-link>
      </div>

      <div v-else class="reels-grid">
        <div
          v-for="reel in reels"
          :key="reel._id"
          class="reel-card"
          @click="openReel(reel)"
        >
          <div class="reel-thumbnail">
            <video :src="reel.videoUrl" muted preload="metadata"></video>
            <div class="reel-overlay">
              <div class="reel-stats">
                <span class="stat-item">
                  <span class="stat-icon">❤️</span>
                  {{ reel.likes?.length || 0 }}
                </span>
                <span class="stat-item">
                  <span class="stat-icon">💬</span>
                  {{ reel.comments?.length || 0 }}
                </span>
              </div>
            </div>
          </div>
          <div class="reel-info">
            <div class="reel-author">
              <div class="avatar small">
                <span>{{ reel.author?.username?.charAt(0).toUpperCase() }}</span>
              </div>
              <div class="author-details">
                <span class="author-name">{{ reel.author?.username }}</span>
                <span class="reel-time">{{ formatDate(reel.createdAt) }}</span>
              </div>
            </div>
            <p class="reel-caption">{{ reel.caption }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Reel Modal -->
    <div v-if="selectedReel" class="reel-modal" @click="closeReel">
      <div class="reel-modal-content" @click.stop>
        <div class="reel-video-container">
          <video
            ref="reelVideo"
            :src="selectedReel.videoUrl"
            controls
            autoplay
            loop
            class="reel-video"
          ></video>
        </div>

        <div class="reel-details">
          <div class="reel-header">
            <div class="reel-author">
              <div class="avatar">
                <span>{{ selectedReel.author?.username?.charAt(0).toUpperCase() }}</span>
              </div>
              <div class="author-info">
                <span class="author-name">{{ selectedReel.author?.username }}</span>
                <span class="reel-time">{{ formatDate(selectedReel.createdAt) }}</span>
              </div>
            </div>
            <button @click="closeReel" class="close-btn">✕</button>
          </div>

          <div class="reel-caption">
            <p>{{ selectedReel.caption }}</p>
          </div>

          <div class="reel-actions">
            <button
              @click="toggleLike(selectedReel)"
              class="action-btn"
              :class="{ liked: selectedReel.likes?.includes(user?._id) }"
            >
              <span class="action-icon">{{ selectedReel.likes?.includes(user?._id) ? '❤️' : '🤍' }}</span>
              <span class="action-count">{{ selectedReel.likes?.length || 0 }}</span>
            </button>

            <button @click="toggleComments(selectedReel)" class="action-btn">
              <span class="action-icon">💬</span>
              <span class="action-count">{{ selectedReel.comments?.length || 0 }}</span>
            </button>

            <button @click="shareReel(selectedReel)" class="action-btn">
              <span class="action-icon">📤</span>
              <span class="action-count">Share</span>
            </button>
          </div>

          <div v-if="selectedReel.showComments" class="comments-section">
            <div v-for="comment in selectedReel.comments" :key="comment._id" class="comment">
              <div class="comment-author">
                <div class="avatar tiny">
                  <span>{{ comment.author?.username?.charAt(0).toUpperCase() }}</span>
                </div>
                <div class="comment-content">
                  <span class="comment-author-name">{{ comment.author?.username }}</span>
                  <p>{{ comment.content }}</p>
                </div>
              </div>
            </div>

            <form @submit.prevent="handleAddComment(selectedReel)" class="comment-form">
              <input
                v-model="newComment"
                type="text"
                class="comment-input"
                placeholder="Add a comment..."
                required
              />
              <button type="submit" class="btn btn-sm">Post</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useAuthStore } from '../stores/auth'
import { useReelStore } from '../stores/reel'
import { useRouter } from 'vue-router'

export default {
  setup() {
    const authStore = useAuthStore()
    const reelStore = useReelStore()
    const router = useRouter()
    return { authStore, reelStore, router }
  },
  data() {
    return {
      selectedReel: null,
      newComment: ''
    }
  },
  computed: {
    user() {
      return this.authStore.user
    },
    reels() {
      return this.reelStore.reels
    }
  },
  async mounted() {
    await this.reelStore.fetchReels()
  },
  methods: {
    openReel(reel) {
      this.selectedReel = { ...reel }
    },

    closeReel() {
      this.selectedReel = null
      if (this.$refs.reelVideo) {
        this.$refs.reelVideo.pause()
      }
    },

    async toggleLike(reel) {
      try {
        await this.reelStore.toggleLike(reel._id)
        if (this.selectedReel && this.selectedReel._id === reel._id) {
          this.selectedReel.likes = reel.likes
        }
      } catch (err) {
        alert('Failed to toggle like: ' + (err.response?.data?.msg || err.message))
      }
    },

    toggleComments(reel) {
      reel.showComments = !reel.showComments
    },

    async handleAddComment(reel) {
      if (!this.newComment.trim()) return

      try {
        await this.reelStore.addComment(reel._id, { content: this.newComment })
        this.newComment = ''
        if (this.selectedReel && this.selectedReel._id === reel._id) {
          this.selectedReel.comments = reel.comments
        }
      } catch (err) {
        alert('Failed to add comment: ' + (err.response?.data?.msg || err.message))
      }
    },

    shareReel(reel) {
      if (navigator.share) {
        navigator.share({
          title: 'Check out this reel on GulmiGang',
          text: reel.caption,
          url: window.location.href
        })
      } else {
        navigator.clipboard.writeText(window.location.href)
        alert('Link copied to clipboard!')
      }
    },

    formatDate(dateString) {
      const date = new Date(dateString)
      const now = new Date()
      const diff = now - date
      const minutes = Math.floor(diff / 60000)
      const hours = Math.floor(diff / 3600000)
      const days = Math.floor(diff / 86400000)

      if (minutes < 1) return 'Just now'
      if (minutes < 60) return `${minutes}m ago`
      if (hours < 24) return `${hours}h ago`
      if (days < 7) return `${days}d ago`
      return date.toLocaleDateString()
    }
  }
}
</script>

<style scoped>
.reels {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.reels-header {
  text-align: center;
  margin-bottom: 40px;
}

.reels-header h2 {
  font-size: 2.5rem;
  margin-bottom: 10px;
  color: #2c3e50;
}

.reels-header p {
  color: #6c757d;
  font-size: 1.1rem;
}

.empty-state {
  text-align: center;
  padding: 80px 20px;
  color: #6c757d;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 20px;
}

.empty-state h3 {
  font-size: 1.5rem;
  margin-bottom: 10px;
}

.reels-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.reel-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.reel-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.reel-thumbnail {
  position: relative;
  width: 100%;
  height: 400px;
  overflow: hidden;
}

.reel-thumbnail video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.reel-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
  padding: 20px;
}

.reel-stats {
  display: flex;
  gap: 16px;
  color: white;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 500;
}

.stat-icon {
  font-size: 16px;
}

.reel-info {
  padding: 16px;
}

.reel-author {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea, #764ba2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
}

.avatar.small {
  width: 24px;
  height: 24px;
  font-size: 12px;
}

.author-details {
  flex: 1;
}

.author-name {
  font-weight: 600;
  color: #2c3e50;
  display: block;
}

.reel-time {
  font-size: 12px;
  color: #6c757d;
}

.reel-caption {
  margin: 0;
  color: #495057;
  line-height: 1.4;
}

/* Modal Styles */
.reel-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 20px;
}

.reel-modal-content {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  max-width: 900px;
  width: 100%;
  max-height: 90vh;
  display: flex;
}

.reel-video-container {
  flex: 1;
  background: black;
}

.reel-video {
  width: 100%;
  height: 100%;
  max-height: 600px;
  object-fit: contain;
}

.reel-details {
  width: 350px;
  display: flex;
  flex-direction: column;
}

.reel-header {
  padding: 16px;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.reel-caption {
  padding: 16px;
  border-bottom: 1px solid #e9ecef;
}

.reel-actions {
  padding: 16px;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  gap: 16px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border: none;
  background: none;
  color: #6c757d;
  cursor: pointer;
  border-radius: 6px;
  transition: background-color 0.2s ease;
}

.action-btn:hover {
  background-color: #f8f9fa;
}

.action-btn.liked {
  color: #e74c3c;
}

.action-icon {
  font-size: 18px;
}

.action-count {
  font-size: 14px;
  font-weight: 500;
}

.comments-section {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.comment {
  margin-bottom: 12px;
}

.comment-author {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.avatar.tiny {
  width: 24px;
  height: 24px;
  font-size: 10px;
}

.comment-content {
  flex: 1;
}

.comment-author-name {
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 2px;
}

.comment p {
  margin: 0;
  color: #495057;
  line-height: 1.4;
}

.comment-form {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e9ecef;
}

.comment-input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #e1e5e9;
  border-radius: 20px;
  font-size: 14px;
}

.btn-sm {
  padding: 8px 16px;
  font-size: 14px;
  border-radius: 20px;
}

.close-btn {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #6c757d;
  padding: 4px;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background: #f8f9fa;
}

@media (max-width: 768px) {
  .reels-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 16px;
  }

  .reel-modal-content {
    flex-direction: column;
    max-height: 100vh;
  }

  .reel-details {
    width: 100%;
    max-height: 40vh;
  }

  .reel-video {
    max-height: 50vh;
  }
}
</style>