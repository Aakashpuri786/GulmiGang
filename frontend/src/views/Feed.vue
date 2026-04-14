<template>
  <div class="feed">
    <section class="stories-section">
      <div class="stories-heading">
        <div>
          <h3 class="section-title">Stories</h3>
          <p class="section-subtitle">
            Live story updates from logged-in members across GulmiGang.
          </p>
        </div>
        <span class="stories-live-indicator" :class="{ connected: storyStore.connected }">
          {{ storyStore.connected ? 'Live' : 'Connecting' }}
        </span>
      </div>

      <div class="stories-row">
        <button type="button" class="story-card story-card-add" @click="openStoryComposer">
          <div class="story-visual story-visual-add">
            <span class="story-add-icon">+</span>
          </div>
          <div class="story-meta">
            <strong>Add Story</strong>
            <span>Post something for everyone online</span>
          </div>
        </button>

        <button
          v-for="tile in storyTiles"
          :key="tile._id"
          type="button"
          class="story-card"
          @click="openStoryViewer(tile)"
        >
          <div class="story-visual" :style="{ background: tile.latestStory?.background || storyFallback(tile._id) }">
            <span class="story-status" :class="{ offline: !tile.isOnline }"></span>
            <span v-if="tile.stories.length > 1" class="story-count">{{ tile.stories.length }}</span>
            <span class="story-initial">{{ getInitials(tile.fullName || tile.username) }}</span>
          </div>
          <div class="story-meta">
            <strong>{{ tile.username }}</strong>
            <span>{{ tile.hasStory ? trimStory(tile.latestStory?.content) : 'Online, no story yet' }}</span>
          </div>
        </button>
      </div>
    </section>

    <div class="create-post">
      <div class="card">
        <div class="card-header">
          <h4>Share something with the community</h4>
        </div>
        <Form @submit="handleCreatePost" class="post-form">
          <div class="form-group">
            <Field name="content" rules="required|max:500" v-slot="{ field, errorMessage }">
              <textarea
                v-bind="field"
                class="form-textarea"
                placeholder="What's on your mind?"
                rows="3"
                :class="{ error: errorMessage }"
              ></textarea>
              <span v-if="errorMessage" class="error-message">{{ errorMessage }}</span>
            </Field>
          </div>
          <div class="form-actions">
            <button type="submit" class="btn btn-primary" :disabled="postLoading">
              <span v-if="postLoading" class="loading-spinner"></span>
              {{ postLoading ? 'Posting...' : 'Post' }}
            </button>
          </div>
        </Form>
      </div>
    </div>

    <div class="posts-section">
      <h3 class="section-title">Recent Posts</h3>

      <div v-if="posts.length === 0" class="empty-state">
        <div class="empty-icon">📝</div>
        <h4>No posts yet</h4>
        <p>Be the first to share something with the community!</p>
      </div>

      <div v-else class="posts-list">
        <div v-for="post in posts" :key="post._id" class="post-card">
          <div class="post-header">
            <div class="post-author">
              <div class="avatar small">
                <span>{{ post.author?.username?.charAt(0).toUpperCase() }}</span>
              </div>
              <div class="author-info">
                <span class="author-name">{{ post.author?.username }}</span>
                <span class="post-time">{{ formatDate(post.createdAt) }}</span>
              </div>
            </div>
          </div>

          <div class="post-content">
            <p>{{ post.content }}</p>
          </div>

          <div class="post-actions">
            <button
              @click="toggleLike(post)"
              class="action-btn"
              :class="{ liked: post.likes?.includes(user?._id) }"
            >
              <span class="action-icon">{{ post.likes?.includes(user?._id) ? '❤️' : '🤍' }}</span>
              <span class="action-count">{{ post.likes?.length || 0 }}</span>
            </button>

            <button @click="toggleComments(post)" class="action-btn">
              <span class="action-icon">💬</span>
              <span class="action-count">{{ post.comments?.length || 0 }}</span>
            </button>
          </div>

          <div v-if="post.showComments" class="comments-section">
            <div v-for="comment in post.comments" :key="comment._id" class="comment">
              <div class="comment-author">
                <div class="avatar tiny">
                  <span>{{ comment.user?.username?.charAt(0).toUpperCase() }}</span>
                </div>
                <div class="comment-content">
                  <span class="comment-author-name">{{ comment.user?.username }}</span>
                  <p>{{ comment.text }}</p>
                </div>
              </div>
            </div>

            <Form @submit="(values) => handleAddComment(post, values)" class="comment-form">
              <div class="form-group">
                <Field name="comment" rules="required|max:200" v-slot="{ field, errorMessage }">
                  <input
                    v-bind="field"
                    type="text"
                    class="form-input comment-input"
                    placeholder="Write a comment..."
                    :class="{ error: errorMessage }"
                  />
                  <span v-if="errorMessage" class="error-message">{{ errorMessage }}</span>
                </Field>
              </div>
              <button type="submit" class="btn btn-sm" :disabled="commentLoading">
                {{ commentLoading ? 'Posting...' : 'Comment' }}
              </button>
            </Form>
          </div>
        </div>
      </div>
    </div>

    <div v-if="isStoryComposerOpen" class="story-modal-backdrop" @click.self="closeStoryComposer">
      <div class="story-modal">
        <div class="story-modal-header">
          <div>
            <h3>Create Story</h3>
            <p>Everyone currently logged in will see this update live.</p>
          </div>
          <button type="button" class="modal-close" @click="closeStoryComposer">×</button>
        </div>

        <div class="story-background-grid">
          <button
            v-for="background in storyBackgrounds"
            :key="background"
            type="button"
            class="background-chip"
            :class="{ active: storyForm.background === background }"
            :style="{ background }"
            @click="storyForm.background = background"
          ></button>
        </div>

        <textarea
          v-model="storyForm.content"
          class="story-textarea"
          maxlength="180"
          placeholder="Share a quick story with the community..."
        ></textarea>

        <div class="story-modal-actions">
          <span class="story-counter">{{ storyForm.content.length }}/180</span>
          <button type="button" class="btn btn-primary" :disabled="storySubmitting" @click="submitStory">
            {{ storySubmitting ? 'Sharing...' : 'Share Story' }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="isStoryViewerOpen && activeStory" class="story-modal-backdrop" @click.self="closeStoryViewer">
      <div class="story-modal story-viewer" :style="{ background: activeStory.background }">
        <div class="story-viewer-header">
          <div>
            <h3>{{ activeStoryGroup?.username }}</h3>
            <p>{{ formatDate(activeStory.createdAt) }}</p>
          </div>
          <button type="button" class="modal-close light" @click="closeStoryViewer">×</button>
        </div>

        <div class="story-viewer-body">
          <p>{{ activeStory.content }}</p>
        </div>

        <div v-if="activeStoryGroup?.stories?.length > 1" class="story-viewer-actions">
          <button type="button" class="btn btn-outline-light" :disabled="activeStoryIndex === 0" @click="previousStory">
            Previous
          </button>
          <button
            type="button"
            class="btn btn-outline-light"
            :disabled="activeStoryIndex >= activeStoryGroup.stories.length - 1"
            @click="nextStory"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Form, Field } from 'vee-validate'
import { useAuthStore } from '../stores/auth'
import { usePostStore } from '../stores/post'
import { useStoryStore } from '../stores/story'

const storyBackgrounds = [
  'linear-gradient(135deg, #667eea, #764ba2)',
  'linear-gradient(135deg, #f59f00, #f76707)',
  'linear-gradient(135deg, #12b886, #2f9e44)',
  'linear-gradient(135deg, #e64980, #c2255c)',
  'linear-gradient(135deg, #228be6, #364fc7)'
]

export default {
  components: { Form, Field },
  setup() {
    const authStore = useAuthStore()
    const postStore = usePostStore()
    const storyStore = useStoryStore()
    return { authStore, postStore, storyStore }
  },
  data() {
    return {
      postLoading: false,
      commentLoading: false,
      storySubmitting: false,
      isStoryComposerOpen: false,
      isStoryViewerOpen: false,
      activeStoryGroup: null,
      activeStoryIndex: 0,
      storyForm: {
        content: '',
        background: storyBackgrounds[0]
      },
      storyBackgrounds
    }
  },
  computed: {
    user() {
      return this.authStore.user
    },
    posts() {
      return this.postStore.posts
    },
    storyTiles() {
      const currentUserId = this.user?._id
      return [...this.storyStore.storyTiles].sort((left, right) => {
        if (left._id === currentUserId) return -1
        if (right._id === currentUserId) return 1
        return 0
      })
    },
    activeStory() {
      return this.activeStoryGroup?.stories?.[this.activeStoryIndex] || null
    }
  },
  async mounted() {
    await Promise.all([
      this.postStore.fetchPosts(),
      this.storyStore.fetchStories()
    ])
  },
  methods: {
    async handleCreatePost(values) {
      this.postLoading = true
      try {
        await this.postStore.createPost(values)
        values.content = ''
      } catch (err) {
        alert('Failed to create post: ' + (err.response?.data?.msg || err.message))
      } finally {
        this.postLoading = false
      }
    },

    async toggleLike(post) {
      try {
        await this.postStore.likePost(post._id)
      } catch (err) {
        alert('Failed to toggle like: ' + (err.response?.data?.msg || err.message))
      }
    },

    toggleComments(post) {
      post.showComments = !post.showComments
    },

    async handleAddComment(post, values) {
      this.commentLoading = true
      try {
        await this.postStore.addComment(post._id, values.comment)
        values.comment = ''
      } catch (err) {
        alert('Failed to add comment: ' + (err.response?.data?.msg || err.message))
      } finally {
        this.commentLoading = false
      }
    },

    openStoryComposer() {
      this.isStoryComposerOpen = true
    },

    closeStoryComposer() {
      this.isStoryComposerOpen = false
      this.storyForm.content = ''
      this.storyForm.background = this.storyBackgrounds[0]
    },

    async submitStory() {
      if (!this.storyForm.content.trim()) {
        alert('Please write something for your story.')
        return
      }

      this.storySubmitting = true
      try {
        await this.storyStore.createStory({
          content: this.storyForm.content.trim(),
          background: this.storyForm.background
        })
        this.closeStoryComposer()
      } catch (error) {
        const message = error.response?.data?.errors?.[0]?.msg || error.response?.data?.msg || error.message
        alert('Failed to share story: ' + message)
      } finally {
        this.storySubmitting = false
      }
    },

    openStoryViewer(tile) {
      if (!tile.hasStory) {
        alert(`${tile.username} is online, but they have not posted a story yet.`)
        return
      }

      this.activeStoryGroup = tile
      this.activeStoryIndex = 0
      this.isStoryViewerOpen = true
    },

    closeStoryViewer() {
      this.isStoryViewerOpen = false
      this.activeStoryGroup = null
      this.activeStoryIndex = 0
    },

    nextStory() {
      if (this.activeStoryIndex < this.activeStoryGroup.stories.length - 1) {
        this.activeStoryIndex += 1
      }
    },

    previousStory() {
      if (this.activeStoryIndex > 0) {
        this.activeStoryIndex -= 1
      }
    },

    getInitials(name) {
      return String(name || '')
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join('') || '?'
    },

    trimStory(content) {
      if (!content) {
        return 'Tap to view story'
      }

      return content.length > 36 ? `${content.slice(0, 36)}...` : content
    },

    storyFallback(userId) {
      const index = this.storyTiles.findIndex((tile) => tile._id === userId)
      return this.storyBackgrounds[index % this.storyBackgrounds.length]
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
.feed {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.stories-section {
  margin-bottom: 32px;
}

.stories-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
}

.section-title {
  font-size: 24px;
  margin-bottom: 20px;
  color: #2c3e50;
}

.section-subtitle {
  margin: 6px 0 0;
  color: #6c7a95;
  font-size: 0.95rem;
}

.stories-live-indicator {
  padding: 8px 12px;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 700;
  background: #eef2ff;
  color: #6372c7;
}

.stories-live-indicator.connected {
  background: #e8fff2;
  color: #1f9d63;
}

.stories-row {
  display: flex;
  gap: 14px;
  overflow-x: auto;
  padding-bottom: 6px;
  scrollbar-width: thin;
}

.story-card {
  flex: 0 0 132px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 0;
  border: none;
  background: transparent;
  text-align: left;
  cursor: pointer;
}

.story-visual {
  position: relative;
  aspect-ratio: 1 / 1;
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 12px 28px rgba(84, 102, 161, 0.18);
}

.story-visual-add {
  border: 2px dashed #b7c4ef;
  background: linear-gradient(135deg, #eef2ff, #f8faff);
  box-shadow: none;
}

.story-add-icon {
  width: 42px;
  height: 42px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  font-size: 1.8rem;
  color: white;
  background: linear-gradient(135deg, #667eea, #764ba2);
  box-shadow: 0 10px 20px rgba(102, 126, 234, 0.28);
}

.story-status,
.story-count {
  position: absolute;
  border-radius: 999px;
  border: 2px solid rgba(255, 255, 255, 0.95);
}

.story-status {
  top: 12px;
  right: 12px;
  width: 12px;
  height: 12px;
  background: #22c55e;
}

.story-status.offline {
  background: #c7cedd;
}

.story-count {
  top: 12px;
  left: 12px;
  min-width: 24px;
  height: 24px;
  padding: 0 7px;
  display: grid;
  place-items: center;
  background: rgba(255, 255, 255, 0.92);
  color: #2c3e50;
  font-size: 0.72rem;
  font-weight: 700;
}

.story-initial {
  width: 52px;
  height: 52px;
  border-radius: 18px;
  display: grid;
  place-items: center;
  background: rgba(255, 255, 255, 0.16);
  color: white;
  font-weight: 800;
  font-size: 1.2rem;
  letter-spacing: 0.04em;
  backdrop-filter: blur(6px);
}

.story-meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 0 2px;
}

.story-meta strong {
  color: #22314d;
  font-size: 0.95rem;
}

.story-meta span {
  color: #6c7a95;
  font-size: 0.8rem;
  line-height: 1.3;
}

.create-post {
  margin-bottom: 40px;
}

.post-form {
  padding: 20px;
}

.form-textarea {
  width: 100%;
  padding: 12px;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-family: inherit;
  font-size: 16px;
  resize: vertical;
  transition: border-color 0.3s ease;
}

.form-textarea:focus,
.story-textarea:focus {
  outline: none;
  border-color: #667eea;
}

.form-textarea.error,
.comment-input.error {
  border-color: #dc3545;
}

.error-message {
  color: #dc3545;
  font-size: 14px;
  margin-top: 4px;
  display: block;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 15px;
}

.posts-section {
  margin-top: 40px;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #6c757d;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 20px;
}

.posts-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.post-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.post-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.post-header {
  padding: 20px;
  border-bottom: 1px solid #f8f9fa;
}

.post-author {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: rgba(102, 126, 234, 0.18);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 18px;
}

.avatar.small {
  width: 40px;
  height: 40px;
  font-size: 16px;
}

.avatar.tiny {
  width: 30px;
  height: 30px;
  font-size: 14px;
}

.author-info {
  display: flex;
  flex-direction: column;
}

.author-name {
  font-weight: 600;
  color: #2c3e50;
}

.post-time {
  font-size: 12px;
  color: #6c757d;
}

.post-content {
  padding: 20px;
  font-size: 16px;
  line-height: 1.6;
  color: #495057;
}

.post-actions {
  padding: 15px 20px;
  border-top: 1px solid #f8f9fa;
  display: flex;
  gap: 20px;
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
  font-size: 16px;
}

.action-count {
  font-size: 14px;
  font-weight: 500;
}

.comments-section {
  border-top: 1px solid #f8f9fa;
  padding: 20px;
  background-color: #f8f9fa;
}

.comment {
  margin-bottom: 15px;
}

.comment-author {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.comment-content {
  flex: 1;
}

.comment-author-name {
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 4px;
}

.comment p {
  margin: 0;
  color: #495057;
  line-height: 1.4;
}

.comment-form {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  margin-top: 15px;
}

.comment-input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #e1e5e9;
  border-radius: 6px;
  font-size: 14px;
}

.btn {
  padding: 12px 24px;
  border-radius: 10px;
  font-weight: 700;
  border: none;
  cursor: pointer;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
}

.btn-sm {
  padding: 8px 16px;
  font-size: 14px;
}

.btn-outline-light {
  background: rgba(255, 255, 255, 0.18);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.35);
}

.loading-spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s ease-in-out infinite;
}

.story-modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1500;
  display: grid;
  place-items: center;
  padding: 24px;
  background: rgba(16, 24, 40, 0.48);
  backdrop-filter: blur(10px);
}

.story-modal {
  width: min(520px, 100%);
  border-radius: 28px;
  background: white;
  padding: 24px;
  box-shadow: 0 24px 60px rgba(22, 31, 61, 0.24);
}

.story-modal-header,
.story-viewer-header,
.story-modal-actions,
.story-viewer-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.story-modal-header p,
.story-viewer-header p {
  margin: 6px 0 0;
  color: #6c7a95;
}

.modal-close {
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 14px;
  background: #edf1fb;
  color: #22314d;
  font-size: 1.4rem;
  cursor: pointer;
}

.modal-close.light {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.story-background-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 10px;
  margin: 22px 0 18px;
}

.background-chip {
  aspect-ratio: 1 / 1;
  border-radius: 18px;
  border: 3px solid transparent;
  cursor: pointer;
}

.background-chip.active {
  border-color: #1f2c48;
}

.story-textarea {
  width: 100%;
  min-height: 160px;
  padding: 18px;
  border: 2px solid #e1e5e9;
  border-radius: 20px;
  resize: vertical;
  font: inherit;
  font-size: 1rem;
}

.story-counter {
  color: #6c7a95;
  font-size: 0.85rem;
}

.story-viewer {
  color: white;
}

.story-viewer-body {
  min-height: 220px;
  margin: 28px 0;
  border-radius: 24px;
  padding: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(12px);
}

.story-viewer-body p {
  margin: 0;
  font-size: 1.2rem;
  line-height: 1.7;
  text-align: center;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .feed {
    padding: 10px;
  }

  .stories-heading {
    flex-direction: column;
    align-items: flex-start;
  }

  .story-card {
    flex-basis: 112px;
  }

  .story-visual {
    border-radius: 20px;
  }

  .story-initial {
    width: 46px;
    height: 46px;
    border-radius: 16px;
  }

  .post-actions {
    flex-wrap: wrap;
  }

  .comment-form {
    flex-direction: column;
  }

  .comment-input {
    margin-bottom: 10px;
  }

  .story-background-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .story-modal {
    padding: 20px;
  }
}
</style>
