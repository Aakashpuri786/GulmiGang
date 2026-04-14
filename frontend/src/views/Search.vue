<template>
  <div class="search-page">
    <section class="search-hero">
      <div>
        <p class="eyebrow">Search</p>
        <h2>Find people, reels, and posts from one place.</h2>
        <p class="hero-copy">
          Search by user ID, username, full name, hashtags like <strong>#gulmi</strong>, reel captions, and post text.
        </p>
      </div>
    </section>

    <section class="search-panel">
      <div class="search-bar">
        <input
          v-model="query"
          type="text"
          class="search-input"
          placeholder="Search ID, username, #hashtags, reel captions, posts..."
          @input="handleQueryInput"
          @keydown.enter.prevent="runSearch"
        />
        <button type="button" class="btn btn-primary" :disabled="loading" @click="runSearch">
          {{ loading ? 'Searching...' : 'Search' }}
        </button>
      </div>

      <div class="filter-row">
        <button
          v-for="option in filters"
          :key="option.value"
          type="button"
          class="filter-chip"
          :class="{ active: activeFilter === option.value }"
          @click="setFilter(option.value)"
        >
          {{ option.label }}
        </button>
      </div>
    </section>

    <section v-if="!query.trim()" class="empty-panel">
      <h3>Start searching</h3>
      <p>Try a username, a unique user ID, a place name, or a hashtag such as <strong>#gulmi</strong>.</p>
    </section>

    <section v-else-if="loading" class="empty-panel">
      <h3>Searching...</h3>
      <p>Looking through users, reels, and posts.</p>
    </section>

    <section v-else-if="!hasResults" class="empty-panel">
      <h3>No results found</h3>
      <p>Try a different username, ID, hashtag, caption, or post keyword.</p>
    </section>

    <template v-else>
      <section v-if="showUsers" class="result-section">
        <div class="section-head">
          <h3>Users</h3>
          <span>{{ results.users.length }}</span>
        </div>

        <div class="user-grid">
          <article v-for="userItem in results.users" :key="userItem._id" class="user-card">
            <div class="avatar">
              <span>{{ getInitial(userItem.username) }}</span>
            </div>
            <div class="user-copy">
              <strong>{{ userItem.username }}</strong>
              <span>ID: {{ userItem.uniqueId }}</span>
              <span>{{ userItem.fullName }}</span>
              <span>{{ userItem.location }}</span>
            </div>
          </article>
        </div>
      </section>

      <section v-if="showReels" class="result-section">
        <div class="section-head">
          <h3>Reels</h3>
          <span>{{ results.reels.length }}</span>
        </div>

        <div class="reel-grid">
          <article v-for="reel in results.reels" :key="reel._id" class="result-card">
            <video :src="reel.videoUrl" controls preload="metadata" class="result-video"></video>
            <div class="result-copy">
              <strong>{{ reel.author?.username || 'User' }}</strong>
              <p>{{ reel.caption }}</p>
              <span>{{ formatDate(reel.createdAt) }}</span>
            </div>
          </article>
        </div>
      </section>

      <section v-if="showPosts" class="result-section">
        <div class="section-head">
          <h3>Posts</h3>
          <span>{{ results.posts.length }}</span>
        </div>

        <div class="post-list">
          <article v-for="post in results.posts" :key="post._id" class="result-card post-card">
            <div class="result-copy">
              <strong>{{ post.author?.username || 'User' }}</strong>
              <p>{{ post.content }}</p>
              <div v-if="post.hashtags?.length" class="tag-row">
                <span v-for="tag in post.hashtags" :key="`${post._id}-${tag}`" class="tag-chip">
                  {{ tag.startsWith('#') ? tag : `#${tag}` }}
                </span>
              </div>
              <span>{{ formatDate(post.createdAt) }}</span>
            </div>

            <div v-if="post.images?.length" class="post-image-grid">
              <img
                v-for="(image, index) in post.images.slice(0, 4)"
                :key="`${post._id}-image-${index}`"
                :src="image"
                :alt="`Search result image ${index + 1}`"
              />
            </div>
          </article>
        </div>
      </section>
    </template>
  </div>
</template>

<script>
import api from '../api'

const filters = [
  { label: 'All', value: 'all' },
  { label: 'Users', value: 'users' },
  { label: 'Reels', value: 'reels' },
  { label: 'Posts', value: 'posts' }
]

export default {
  data() {
    return {
      query: '',
      activeFilter: 'all',
      loading: false,
      debounceTimer: null,
      results: {
        users: [],
        reels: [],
        posts: []
      },
      filters
    }
  },
  computed: {
    hasResults() {
      return this.results.users.length > 0 || this.results.reels.length > 0 || this.results.posts.length > 0
    },
    showUsers() {
      return (this.activeFilter === 'all' || this.activeFilter === 'users') && this.results.users.length > 0
    },
    showReels() {
      return (this.activeFilter === 'all' || this.activeFilter === 'reels') && this.results.reels.length > 0
    },
    showPosts() {
      return (this.activeFilter === 'all' || this.activeFilter === 'posts') && this.results.posts.length > 0
    }
  },
  beforeUnmount() {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer)
    }
  },
  methods: {
    handleQueryInput() {
      if (this.debounceTimer) {
        clearTimeout(this.debounceTimer)
      }

      if (!this.query.trim()) {
        this.results = { users: [], reels: [], posts: [] }
        return
      }

      this.debounceTimer = setTimeout(() => {
        this.runSearch()
      }, 350)
    },

    async setFilter(filterValue) {
      this.activeFilter = filterValue
      if (this.query.trim()) {
        await this.runSearch()
      }
    },

    async runSearch() {
      if (!this.query.trim()) {
        this.results = { users: [], reels: [], posts: [] }
        return
      }

      this.loading = true
      try {
        const response = await api.get('/search', {
          params: {
            q: this.query.trim(),
            type: this.activeFilter
          }
        })

        this.results = {
          users: response.data.users || [],
          reels: response.data.reels || [],
          posts: response.data.posts || []
        }
      } catch (error) {
        alert('Failed to search: ' + (error.response?.data?.msg || error.message))
      } finally {
        this.loading = false
      }
    },

    getInitial(username) {
      return String(username || '?').charAt(0).toUpperCase()
    },

    formatDate(dateString) {
      return new Date(dateString).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    }
  }
}
</script>

<style scoped>
.search-page {
  display: grid;
  gap: 22px;
}

.search-hero,
.search-panel,
.empty-panel,
.result-section {
  background: white;
  border: 1px solid #e7ecf5;
  border-radius: 24px;
  box-shadow: 0 18px 40px rgba(38, 56, 96, 0.08);
}

.search-hero,
.search-panel,
.result-section {
  padding: 24px;
}

.empty-panel {
  padding: 42px 24px;
  text-align: center;
  color: #6e7c96;
}

.eyebrow {
  margin: 0 0 10px;
  font-size: 0.8rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #6d7bd9;
}

.search-hero h2,
.section-head h3,
.empty-panel h3 {
  margin: 0;
  color: #1f2c48;
}

.hero-copy,
.empty-panel p {
  margin: 10px 0 0;
  color: #6b7891;
  line-height: 1.6;
}

.search-bar,
.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.search-bar {
  margin-bottom: 16px;
}

.search-input {
  flex: 1;
  border: 1px solid #d7deeb;
  border-radius: 18px;
  padding: 15px 16px;
  font: inherit;
}

.search-input:focus {
  outline: none;
  border-color: #7280da;
  box-shadow: 0 0 0 4px rgba(114, 128, 218, 0.12);
}

.filter-row,
.tag-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.filter-chip,
.tag-chip,
.btn {
  border: none;
  border-radius: 999px;
  padding: 10px 14px;
  font: inherit;
  cursor: pointer;
}

.filter-chip {
  background: #f3f6fb;
  color: #4b5872;
  font-weight: 700;
}

.filter-chip.active {
  background: #eef2ff;
  color: #667eea;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  font-weight: 700;
  box-shadow: 0 10px 18px rgba(102, 126, 234, 0.24);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  box-shadow: none;
}

.user-grid,
.reel-grid,
.post-list {
  display: grid;
  gap: 16px;
  margin-top: 18px;
}

.user-grid {
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
}

.reel-grid {
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
}

.user-card,
.result-card {
  border: 1px solid #e9eef6;
  border-radius: 20px;
  background: #fbfcff;
  overflow: hidden;
}

.user-card {
  padding: 18px;
  display: flex;
  align-items: flex-start;
  gap: 14px;
}

.avatar {
  width: 46px;
  height: 46px;
  border-radius: 16px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  display: grid;
  place-items: center;
  font-weight: 800;
}

.user-copy,
.result-copy {
  display: grid;
  gap: 6px;
}

.user-copy strong,
.result-copy strong {
  color: #1f2c48;
}

.user-copy span,
.result-copy span,
.result-copy p {
  color: #6a7891;
  line-height: 1.5;
  margin: 0;
}

.result-video {
  width: 100%;
  aspect-ratio: 9 / 16;
  object-fit: cover;
  background: #0f1728;
}

.result-card .result-copy {
  padding: 16px;
}

.post-card {
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) minmax(180px, 0.8fr);
}

.post-image-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 6px;
  padding: 16px 16px 16px 0;
}

.post-image-grid img {
  width: 100%;
  height: 100%;
  min-height: 90px;
  object-fit: cover;
  border-radius: 14px;
}

.tag-chip {
  background: #eef2ff;
  color: #667eea;
  font-size: 0.8rem;
  font-weight: 700;
  padding: 8px 12px;
}

@media (max-width: 768px) {
  .search-bar,
  .section-head {
    flex-direction: column;
    align-items: stretch;
  }

  .btn {
    width: 100%;
  }

  .post-card {
    grid-template-columns: 1fr;
  }

  .post-image-grid {
    padding: 0 16px 16px;
  }
}
</style>
