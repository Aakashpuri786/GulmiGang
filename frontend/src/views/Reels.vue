<template>
  <div class="reels-page">
    <section class="reels-hero">
      <div>
        <p class="eyebrow">Reels</p>
        <h2>Watch the latest community reels and post your own here.</h2>
        <p class="hero-copy">
          Reels shared from the create button also land here, so users can always find them in one place.
        </p>
      </div>

      <button type="button" class="btn btn-primary hero-action" @click="focusComposer">
        Post a Reel
      </button>
    </section>

    <section ref="composerSection" class="composer-card">
      <div class="composer-header">
        <div>
          <h3>Share a reel</h3>
          <p>Upload a short video and caption for everyone in GulmiGang.</p>
        </div>
        <span class="composer-badge">Visible in Reels</span>
      </div>

      <div class="composer-body">
        <label class="form-label" for="reel-caption">Caption</label>
        <textarea
          id="reel-caption"
          ref="composerCaption"
          v-model="composer.caption"
          class="form-textarea"
          maxlength="2200"
          rows="3"
          placeholder="Tell people what this reel is about..."
        ></textarea>

        <input
          ref="composerVideoInput"
          type="file"
          accept="video/*"
          class="file-input"
          @change="handleVideoSelect"
        />

        <div class="upload-shell">
          <div
            class="upload-panel"
            :class="{ ready: !!selectedVideo }"
            role="button"
            tabindex="0"
            @click="triggerVideoPicker"
            @keydown.enter.prevent="triggerVideoPicker"
            @keydown.space.prevent="triggerVideoPicker"
          >
            <template v-if="selectedVideo">
              <video :src="selectedVideo.preview" class="preview-video" controls></video>
              <div class="upload-copy">
                <strong>{{ selectedVideo.file.name }}</strong>
                <span>{{ formatFileSize(selectedVideo.file.size) }}</span>
              </div>
            </template>

            <template v-else>
              <div class="upload-copy">
                <strong>Select a video</strong>
                <span>MP4, MOV and other video formats up to 50MB.</span>
              </div>
            </template>
          </div>

          <button
            v-if="selectedVideo"
            type="button"
            class="btn btn-secondary"
            @click="removeVideo"
          >
            Remove Video
          </button>
        </div>
      </div>

      <div class="composer-actions">
        <button type="button" class="btn btn-secondary" @click="clearComposer">
          Clear
        </button>
        <button
          type="button"
          class="btn btn-primary"
          :disabled="submitting || !canSubmitReel"
          @click="publishReel"
        >
          {{ submitting ? 'Posting Reel...' : 'Share Reel' }}
        </button>
      </div>
    </section>

    <section class="reels-feed">
      <div class="section-header">
        <div>
          <h3>Community reels</h3>
          <p>Watch reels shared by members across Gulmi.</p>
        </div>
        <span class="section-stat">{{ reels.length }} total</span>
      </div>

      <div v-if="reelStore.loading" class="empty-state">
        <h4>Loading reels...</h4>
        <p>Your reel feed is being prepared.</p>
      </div>

      <div v-else-if="reels.length === 0" class="empty-state">
        <h4>No reels yet</h4>
        <p>Share the first reel from the composer above and it will appear here immediately.</p>
      </div>

      <div v-else class="reels-grid">
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
      composer: {
        caption: ''
      },
      selectedVideo: null,
      submitting: false,
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
    },
    canSubmitReel() {
      return Boolean(this.composer.caption.trim() && this.selectedVideo)
    }
  },
  async mounted() {
    try {
      await this.reelStore.fetchReels()
    } catch (error) {
      alert('Failed to load reels: ' + (error.response?.data?.msg || error.message))
    }
  },
  beforeUnmount() {
    this.revokeVideoPreview()
  },
  methods: {
    focusComposer() {
      this.$refs.composerSection?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      this.$refs.composerCaption?.focus()
    },

    triggerVideoPicker() {
      this.$refs.composerVideoInput?.click()
    },

    handleVideoSelect(event) {
      const file = event.target.files?.[0]
      if (!file) return

      if (file.size > 50 * 1024 * 1024) {
        alert('Please choose a video smaller than 50MB.')
        event.target.value = ''
        return
      }

      this.revokeVideoPreview()
      this.selectedVideo = {
        file,
        preview: URL.createObjectURL(file)
      }
    },

    revokeVideoPreview() {
      if (this.selectedVideo?.preview) {
        URL.revokeObjectURL(this.selectedVideo.preview)
      }
    },

    removeVideo() {
      this.revokeVideoPreview()
      this.selectedVideo = null
      if (this.$refs.composerVideoInput) {
        this.$refs.composerVideoInput.value = ''
      }
    },

    clearComposer() {
      this.composer.caption = ''
      this.removeVideo()
    },

    async publishReel() {
      if (!this.canSubmitReel) {
        alert('Please add a caption and choose a video before posting.')
        return
      }

      this.submitting = true
      try {
        const formData = new FormData()
        formData.append('caption', this.composer.caption.trim())
        formData.append('video', this.selectedVideo.file)

        const createdReel = await this.reelStore.createReel(formData)
        this.clearComposer()
        this.openReel(createdReel._id)
      } catch (error) {
        const message = error.response?.data?.errors?.[0]?.msg || error.response?.data?.msg || error.message
        alert('Failed to post reel: ' + message)
      } finally {
        this.submitting = false
      }
    },

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

    formatFileSize(size) {
      if (size < 1024 * 1024) {
        return `${Math.round(size / 1024)} KB`
      }

      return `${(size / (1024 * 1024)).toFixed(1)} MB`
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
  display: grid;
  gap: 28px;
}

.reels-hero,
.composer-card,
.reels-feed {
  background: white;
  border: 1px solid #e7ecf5;
  border-radius: 24px;
  box-shadow: 0 18px 40px rgba(38, 56, 96, 0.08);
}

.reels-hero {
  padding: 28px;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 18px;
  background:
    radial-gradient(circle at top right, rgba(102, 126, 234, 0.12), transparent 35%),
    linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
}

.eyebrow {
  margin: 0 0 10px;
  font-size: 0.82rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #6d7bd9;
}

.reels-hero h2,
.composer-header h3,
.section-header h3 {
  margin: 0;
  color: #1f2c48;
}

.hero-copy,
.composer-header p,
.section-header p {
  margin: 10px 0 0;
  color: #68758f;
  line-height: 1.6;
}

.hero-action {
  flex-shrink: 0;
}

.composer-card,
.reels-feed {
  padding: 24px;
}

.composer-header,
.section-header,
.composer-actions,
.modal-header,
.modal-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
}

.composer-header {
  margin-bottom: 18px;
}

.composer-badge,
.section-stat {
  padding: 9px 14px;
  border-radius: 999px;
  background: #eef3ff;
  color: #5b69c5;
  font-size: 0.82rem;
  font-weight: 700;
}

.composer-body {
  display: grid;
  gap: 14px;
}

.form-label {
  font-weight: 700;
  color: #24314f;
}

.form-textarea,
.comment-input {
  width: 100%;
  border: 1px solid #d7deeb;
  border-radius: 16px;
  padding: 16px;
  font: inherit;
  resize: vertical;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.form-textarea:focus,
.comment-input:focus {
  outline: none;
  border-color: #7280da;
  box-shadow: 0 0 0 4px rgba(114, 128, 218, 0.12);
}

.file-input {
  display: none;
}

.upload-shell {
  display: grid;
  gap: 12px;
}

.upload-panel {
  width: 100%;
  border: 1px dashed #b9c5e3;
  border-radius: 20px;
  background: #f8fbff;
  padding: 18px;
  display: grid;
  gap: 16px;
  text-align: left;
  cursor: pointer;
  transition: border-color 0.2s ease, transform 0.2s ease, background-color 0.2s ease;
}

.upload-panel:hover {
  border-color: #7280da;
  background: #f1f5ff;
}

.upload-panel.ready {
  border-style: solid;
  background: #fbfcff;
}

.upload-copy {
  display: grid;
  gap: 4px;
}

.upload-copy strong {
  color: #23314d;
}

.upload-copy span {
  color: #6f7d99;
}

.preview-video {
  width: 100%;
  max-height: 340px;
  border-radius: 16px;
  object-fit: contain;
  background: #0f1728;
}

.composer-actions {
  margin-top: 18px;
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

.empty-state {
  margin-top: 22px;
  padding: 34px 18px;
  border: 1px dashed #d4ddec;
  border-radius: 20px;
  text-align: center;
  color: #66758f;
  background: #fbfcff;
}

.empty-state h4 {
  margin: 0 0 8px;
  color: #23314d;
}

.empty-state p {
  margin: 0;
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

@media (max-width: 900px) {
  .reel-modal-card {
    grid-template-columns: 1fr;
  }

  .modal-details {
    max-height: 46vh;
  }
}

@media (max-width: 768px) {
  .reels-hero,
  .composer-header,
  .section-header,
  .composer-actions {
    flex-direction: column;
    align-items: flex-start;
  }

  .hero-action,
  .composer-actions .btn,
  .comment-form .btn {
    width: 100%;
  }

  .reels-hero,
  .composer-card,
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
