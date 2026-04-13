<template>
  <div class="feed">
    <div class="feed-header">
      <div class="user-info">
        <div class="avatar">
          <span>{{ user?.username?.charAt(0).toUpperCase() }}</span>
        </div>
        <div class="user-details">
          <h3>{{ user?.username }}</h3>
          <p>{{ user?.email }}</p>
        </div>
      </div>
      <button @click="logout" class="btn btn-outline">Logout</button>
    </div>

    <div class="create-post">
      <div class="card">
        <div class="card-header">
          <h4>Share something with the community</h4>
        </div>
        <Form @submit.prevent="handleCreatePost" class="post-form">
          <div class="form-group">
            <Field name="content" rules="required|max:500" v-slot="{ field, errorMessage }">
              <textarea
                v-bind="field"
                class="form-textarea"
                placeholder="What's on your mind?"
                rows="3"
                :class="{ 'error': errorMessage }"
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
                  <span>{{ comment.author?.username?.charAt(0).toUpperCase() }}</span>
                </div>
                <div class="comment-content">
                  <span class="comment-author-name">{{ comment.author?.username }}</span>
                  <p>{{ comment.content }}</p>
                </div>
              </div>
            </div>

            <Form @submit.prevent="handleAddComment(post)" class="comment-form">
              <div class="form-group">
                <Field name="comment" rules="required|max:200" v-slot="{ field, errorMessage }">
                  <input
                    v-bind="field"
                    type="text"
                    class="form-input comment-input"
                    placeholder="Write a comment..."
                    :class="{ 'error': errorMessage }"
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
  </div>
</template>

<script>
import { Form, Field } from 'vee-validate'
import { useAuthStore } from '../stores/auth'
import { usePostStore } from '../stores/post'
import { useRouter } from 'vue-router'

export default {
  components: { Form, Field },
  setup() {
    const authStore = useAuthStore()
    const postStore = usePostStore()
    const router = useRouter()
    return { authStore, postStore, router }
  },
  data() {
    return {
      postLoading: false,
      commentLoading: false
    }
  },
  computed: {
    user() {
      return this.authStore.user
    },
    posts() {
      return this.postStore.posts
    }
  },
  async mounted() {
    await this.postStore.fetchPosts()
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
        await this.postStore.toggleLike(post._id)
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
        await this.postStore.addComment(post._id, values)
        values.comment = ''
      } catch (err) {
        alert('Failed to add comment: ' + (err.response?.data?.msg || err.message))
      } finally {
        this.commentLoading = false
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
    },

    logout() {
      this.authStore.logout()
      this.router.push('/')
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

.feed-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  color: white;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
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

.user-details h3 {
  margin: 0;
  font-size: 18px;
}

.user-details p {
  margin: 5px 0 0 0;
  opacity: 0.8;
  font-size: 14px;
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

.form-textarea:focus {
  outline: none;
  border-color: #667eea;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 15px;
}

.posts-section {
  margin-top: 40px;
}

.section-title {
  font-size: 24px;
  margin-bottom: 20px;
  color: #2c3e50;
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

.btn-sm {
  padding: 8px 16px;
  font-size: 14px;
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

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .feed {
    padding: 10px;
  }

  .feed-header {
    flex-direction: column;
    gap: 15px;
    text-align: center;
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
}
</style>