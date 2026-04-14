<template>
  <div class="reels-page">
    <section class="reels-feed">
      <div class="reels-grid">
        <article
          v-for="reel in reels"
          :key="reel._id"
          class="reel-card"
          @click="openReel(reel._id)"
        >
          <div class="reel-media">
            <video :src="reel.videoUrl" muted preload="metadata"></video>
            <div class="reel-overlay">
              <div class="reel-metrics">
                <span>{{ reel.likes?.length || 0 }} likes</span>
                <span>{{ reel.comments?.length || 0 }} comments</span>
              </div>
            </div>
          </div>

          <div class="reel-info">
            <div class="reel-author">
              <div class="avatar small">
                <span>{{ getInitial(reel.author?.username) }}</span>
              </div>
              <div>
                <strong>{{ reel.author?.username || 'User' }}</strong>
                <span>{{ formatDate(reel.createdAt) }}</span>
              </div>
            </div>
            <p>{{ reel.caption }}</p>
          </div>
        </article>
      </div>
    </section>

    <div v-if="selectedReel" class="reel-modal" @click="closeReel">
      <div class="reel-modal-card" @click.stop>
        <div class="modal-video-panel">
          <video
            ref="reelVideo"
            :key="selectedReel._id"
            :src="selectedReel.videoUrl"
            class="modal-video"
            controls
            autoplay
            loop
          ></video>
        </div>

        <div class="modal-details">
          <div class="modal-header">
            <div class="reel-author">
              <div class="avatar">
                <span>{{ getInitial(selectedReel.author?.username) }}</span>
              </div>
              <div>
                <strong>{{ selectedReel.author?.username || 'User' }}</strong>
                <span>{{ formatDate(selectedReel.createdAt) }}</span>
              </div>
            </div>

            <button type="button" class="close-btn" @click="closeReel">
              Close
            </button>
          </div>

          <div class="modal-caption">
            <p>{{ selectedReel.caption }}</p>
          </div>

          <div class="modal-actions">
            <button
              type="button"
              class="action-btn"
              :class="{ liked: isLiked(selectedReel) }"
              @click="toggleLike(selectedReel)"
            >
              {{ isLiked(selectedReel) ? 'Unlike' : 'Like' }} ({{ selectedReel.likes?.length || 0 }})
            </button>
            <button type="button" class="action-btn" @click="showComments = !showComments">
              Comments ({{ selectedReel.comments?.length || 0 }})
            </button>
            <button type="button" class="action-btn" @click="shareReel(selectedReel)">
              Share
            </button>
          </div>

          <div v-if="showComments" class="comments-panel">
            <div v-if="!selectedReel.comments?.length" class="comment-empty">
              No comments yet.
            </div>

            <div
              v-for="comment in selectedReel.comments"
              :key="comment._id || `${comment.author?._id}-${comment.createdAt}`"
              class="comment-row"
            >
              <div class="avatar tiny">
                <span>{{ getInitial(comment.author?.username) }}</span>
              </div>
              <div class="comment-copy">
                <strong>{{ comment.author?.username || 'User' }}</strong>
                <p>{{ comment.content }}</p>
              </div>
            </div>

            <form class="comment-form" @submit.prevent="handleAddComment">
              <input
                v-model="newComment"
                type="text"
                class="comment-input"
                maxlength="300"
                placeholder="Add a comment..."
              />
              <button type="submit" class="btn btn-primary btn-compact">
                Post
              </button>
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

export default {
  setup() {
    const authStore = useAuthStore()
    const reelStore = useReelStore()
    return { authStore, reelStore }
  },
  data() {
    return {
      selectedReelId: null,
      showComments: false,
      newComment: ''
    }
  },
  computed: {
    user() {
      return this.authStore.user
    },
    reels() {
      return this.reelStore.reels
    },
    selectedReel() {
      return this.reels.find((reel) => reel._id === this.selectedReelId) || null
    }
  },
  async mounted() {
    try {
      await this.reelStore.fetchReels()
    } catch (error) {
      alert('Failed to load reels: ' + (error.response?.data?.msg || error.message))
    }
  },
  methods: {
    openReel(reelId) {
      this.selectedReelId = reelId
      this.showComments = false
      this.newComment = ''
    },

    closeReel() {
      if (this.$refs.reelVideo) {
        this.$refs.reelVideo.pause()
      }

      this.selectedReelId = null
      this.showComments = false
      this.newComment = ''
    },

    async toggleLike(reel) {
      try {
        await this.reelStore.toggleLike(reel._id)
      } catch (error) {
        alert('Failed to update like: ' + (error.response?.data?.msg || error.message))
      }
    },

    async handleAddComment() {
      if (!this.selectedReel || !this.newComment.trim()) return

      try {
        await this.reelStore.addComment(this.selectedReel._id, {
          content: this.newComment.trim()
        })
        this.newComment = ''
        this.showComments = true
      } catch (error) {
        const message = error.response?.data?.errors?.[0]?.msg || error.response?.data?.msg || error.message
        alert('Failed to add comment: ' + message)
      }
    },

    async shareReel(reel) {
      const shareUrl = `${window.location.origin}/reels`

      try {
        if (navigator.share) {
          await navigator.share({
            title: 'Watch this reel on GulmiGang',
            text: reel.caption,
            url: shareUrl
          })
          return
        }

        await navigator.clipboard.writeText(shareUrl)
        alert('Reel link copied to clipboard.')
      } catch (error) {
        alert('Sharing is not available right now.')
      }
    },

    isLiked(reel) {
      return reel.likes?.includes(this.user?._id)
    },

    getInitial(username) {
      return String(username || '?').charAt(0).toUpperCase()
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
.reels-page {
  padding: 0;
}

.reels-feed {
  background: white;
  border: 1px solid #e7ecf5;
  border-radius: 24px;
  box-shadow: 0 18px 40px rgba(38, 56, 96, 0.08);
  padding: 24px;
}

.comment-input {
  width: 100%;
  border: 1px solid #d7deeb;
  border-radius: 16px;
  padding: 16px;
  font: inherit;
  resize: vertical;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.comment-input:focus {
  outline: none;
  border-color: #7280da;
  box-shadow: 0 0 0 4px rgba(114, 128, 218, 0.12);
}

.reels-grid {
  margin-top: 22px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 20px;
}

.reel-card {
  border: 1px solid #e7ecf5;
  border-radius: 22px;
  overflow: hidden;
  background: #fff;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.reel-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 18px 30px rgba(40, 60, 102, 0.12);
}

.reel-media {
  position: relative;
  aspect-ratio: 9 / 16;
  background: #0f1728;
}

.reel-media video,
.modal-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.reel-overlay {
  position: absolute;
  inset: auto 0 0;
  padding: 18px 16px 14px;
  background: linear-gradient(180deg, transparent, rgba(15, 23, 40, 0.88));
}

.reel-metrics {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  color: white;
  font-size: 0.82rem;
  font-weight: 700;
}

.reel-info {
  padding: 16px;
}

.reel-info p,
.modal-caption p,
.comment-copy p {
  margin: 0;
  color: #42506b;
  line-height: 1.6;
}

.reel-author {
  display: flex;
  align-items: center;
  gap: 12px;
}

.reel-author strong,
.comment-copy strong {
  display: block;
  color: #1f2c48;
}

.reel-author span {
  color: #7b879f;
  font-size: 0.84rem;
}

.avatar {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  font-weight: 700;
}

.avatar.small {
  width: 34px;
  height: 34px;
  font-size: 0.85rem;
}

.avatar.tiny {
  width: 30px;
  height: 30px;
  font-size: 0.78rem;
}

.reel-modal {
  position: fixed;
  inset: 0;
  z-index: 2000;
  padding: 24px;
  display: grid;
  place-items: center;
  background: rgba(10, 15, 27, 0.82);
}

.reel-modal-card {
  width: min(980px, 100%);
  max-height: 92vh;
  overflow: hidden;
  border-radius: 26px;
  background: white;
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(320px, 0.85fr);
}

.modal-video-panel {
  background: #0f1728;
  min-height: 420px;
}

.modal-video {
  object-fit: contain;
}

.modal-details {
  display: grid;
  grid-template-rows: auto auto auto 1fr;
}

.modal-header,
.modal-caption,
.modal-actions,
.comments-panel {
  padding: 18px 20px;
}

.modal-caption,
.modal-actions,
.comments-panel {
  border-top: 1px solid #edf1f7;
}

.close-btn,
.action-btn,
.btn {
  border: none;
  border-radius: 14px;
  font: inherit;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease;
}

.btn {
  padding: 12px 18px;
  font-weight: 700;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  box-shadow: 0 10px 18px rgba(102, 126, 234, 0.24);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.btn-secondary {
  background: #f3f6fb;
  color: #4f5b74;
}

.btn-compact {
  padding: 12px 16px;
}

.close-btn,
.action-btn {
  background: #f3f6fb;
  color: #31415f;
  padding: 10px 14px;
  font-weight: 700;
}

.action-btn.liked {
  background: #ffe8ec;
  color: #d04b63;
}

.comments-panel {
  overflow-y: auto;
}

.comment-empty {
  color: #7b879f;
}

.comment-row {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 14px;
}

.comment-form {
  margin-top: 16px;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 10px;
}

.modal-header,
.modal-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
}

@media (max-width: 900px) {
  .reel-modal-card {
    grid-template-columns: 1fr;
  }

  .modal-details {
    max-height: 46vh;
  }
}

@media (max-width: 768px) {
  .modal-header,
  .modal-actions {
    flex-direction: column;
    align-items: flex-start;
  }

  .comment-form .btn {
    width: 100%;
  }

  .reels-feed {
    padding: 18px;
  }

  .reels-grid {
    grid-template-columns: 1fr;
  }

  .reel-modal {
    padding: 12px;
  }

  .comment-form {
    grid-template-columns: 1fr;
  }
}
</style>
