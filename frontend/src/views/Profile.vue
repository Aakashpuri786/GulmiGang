<template>
  <div class="profile-page">
    <section class="profile-hero">
      <div class="profile-top">
        <div class="avatar-shell">
          <img
            v-if="profileImagePreview"
            :src="profileImagePreview"
            alt="Profile picture"
            class="profile-image"
          />
          <div v-else class="profile-avatar">
            {{ initials }}
          </div>
        </div>

        <div class="hero-copy">
          <p class="eyebrow">My Profile</p>
          <h2>{{ user?.fullName || user?.username || 'User' }}</h2>
          <p class="hero-subtitle">@{{ user?.username || 'username' }}</p>

          <p class="hero-bio">{{ user?.bio || 'No bio added yet.' }}</p>

          <div class="hero-stats">
            <div class="hero-stat">
              <strong>{{ userPosts.length }}</strong>
              <span>Posts</span>
            </div>
            <div class="hero-stat">
              <strong>{{ userReels.length }}</strong>
              <span>Reels</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section v-if="loading" class="state-card">
      <h3>Loading profile...</h3>
      <p>Fetching your account details.</p>
    </section>

    <section v-else-if="!user" class="state-card">
      <h3>Profile unavailable</h3>
      <p>Your account details could not be loaded right now.</p>
    </section>

    <template v-else>
      <section v-if="isEditing" ref="editorCard" class="panel-card">
        <div class="panel-head split">
          <div>
            <h3>Profile Settings</h3>
            <p class="panel-note">Update your profile photo, bio, and account details here.</p>
          </div>
          <div class="action-row">
            <button type="button" class="btn btn-secondary" @click="cancelEditing">
              Cancel
            </button>
            <button type="button" class="btn btn-primary" :disabled="saving" @click="saveProfile">
              {{ saving ? 'Saving...' : 'Save Changes' }}
            </button>
          </div>
        </div>

        <div class="editor-layout">
          <div class="photo-editor">
            <input
              ref="profileImageInput"
              type="file"
              accept="image/*"
              class="hidden-input"
              @change="handleProfileImageSelect"
            />

            <div class="photo-preview-shell">
              <img
                v-if="profileImagePreview"
                :src="profileImagePreview"
                alt="Profile preview"
                class="photo-preview"
              />
              <div v-else class="photo-placeholder">
                {{ initials }}
              </div>
            </div>

            <button type="button" class="btn btn-secondary" @click="triggerImageUpload">
              Upload Image
            </button>
            <small class="photo-help">PNG or JPG up to 5MB.</small>
          </div>

          <div class="form-grid">
            <label class="field">
              <span>Full Name</span>
              <input v-model="form.fullName" type="text" class="input" />
            </label>
            <label class="field">
              <span>Username</span>
              <input v-model="form.username" type="text" class="input" />
            </label>
            <label class="field">
              <span>Email</span>
              <input v-model="form.email" type="email" class="input" />
            </label>
            <label class="field">
              <span>Phone</span>
              <input v-model="form.phone" type="text" class="input" />
            </label>
            <label class="field">
              <span>Location</span>
              <input v-model="form.location" type="text" class="input" />
            </label>
            <label class="field">
              <span>Gender</span>
              <input v-model="form.gender" type="text" class="input" />
            </label>
            <label class="field">
              <span>Date of Birth</span>
              <input v-model="form.dateOfBirth" type="date" class="input" />
            </label>
            <label class="field wide">
              <span>Bio</span>
              <textarea v-model="form.bio" rows="4" class="input textarea"></textarea>
            </label>
            <label class="field wide">
              <span>Skills</span>
              <input v-model="form.skills" type="text" class="input" placeholder="comma,separated,skills" />
            </label>
            <label class="field wide">
              <span>Skills To Learn</span>
              <input v-model="form.skillsToLearn" type="text" class="input" placeholder="comma,separated,goals" />
            </label>
          </div>
        </div>
      </section>

      <section class="profile-content-grid">
        <article class="panel-card">
          <div class="panel-head">
            <h3>Your Posts</h3>
            <span class="count-pill">{{ userPosts.length }}</span>
          </div>

          <div v-if="contentLoading" class="empty-copy">Loading your posts...</div>
          <div v-else-if="!userPosts.length" class="empty-copy">You have not shared any posts yet.</div>
          <div v-else class="content-list">
            <article v-for="post in userPosts" :key="post._id" class="content-item">
              <div class="content-item-head">
                <strong>{{ formatDate(post.createdAt) }}</strong>
                <span>{{ post.likes?.length || 0 }} likes</span>
              </div>
              <p>{{ post.content || 'Image post' }}</p>
              <div v-if="post.images?.length" class="mini-image-grid">
                <img
                  v-for="(image, index) in post.images.slice(0, 4)"
                  :key="`${post._id}-image-${index}`"
                  :src="image"
                  :alt="`Post image ${index + 1}`"
                />
              </div>
              <div v-if="post.hashtags?.length" class="chip-row">
                <span v-for="tag in post.hashtags" :key="`${post._id}-${tag}`" class="chip">
                  {{ tag.startsWith('#') ? tag : `#${tag}` }}
                </span>
              </div>
            </article>
          </div>
        </article>

        <article class="panel-card">
          <div class="panel-head">
            <h3>Your Reels</h3>
            <span class="count-pill">{{ userReels.length }}</span>
          </div>

          <div v-if="contentLoading" class="empty-copy">Loading your reels...</div>
          <div v-else-if="!userReels.length" class="empty-copy">You have not shared any reels yet.</div>
          <div v-else class="content-list">
            <article v-for="reel in userReels" :key="reel._id" class="content-item">
              <video :src="reel.videoUrl" controls class="profile-reel-video"></video>
              <div class="content-item-head">
                <strong>{{ formatDate(reel.createdAt) }}</strong>
                <span>{{ reel.likes?.length || 0 }} likes</span>
              </div>
              <p>{{ reel.caption }}</p>
            </article>
          </div>
        </article>
      </section>
    </template>
  </div>
</template>

<script>
import api from '../api'
import { useAuthStore } from '../stores/auth'

const toCommaList = (items) => (items || []).join(', ')

export default {
  setup() {
    const authStore = useAuthStore()
    return { authStore }
  },
  data() {
    return {
      loading: false,
      saving: false,
      contentLoading: false,
      isEditing: false,
      profileImageFile: null,
      profileImagePreview: '',
      userPosts: [],
      userReels: [],
      form: {
        fullName: '',
        username: '',
        email: '',
        phone: '',
        location: '',
        gender: '',
        dateOfBirth: '',
        bio: '',
        skills: '',
        skillsToLearn: ''
      }
    }
  },
  computed: {
    user() {
      return this.authStore.user
    },
    initials() {
      const name = this.user?.fullName || this.user?.username || '?'
      return String(name)
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join('') || '?'
    }
  },
  watch: {
    '$route.query.edit'(value) {
      if (value === '1' && this.user) {
        this.openEditor()
      }
    }
  },
  async mounted() {
    await this.loadProfile()
    this.syncEditorStateFromRoute()
  },
  beforeUnmount() {
    this.revokePreviewIfNeeded()
  },
  methods: {
    syncEditorStateFromRoute() {
      if (this.$route.query.edit === '1' && this.user) {
        this.openEditor()
      }
    },

    clearEditQuery() {
      if (!('edit' in this.$route.query)) {
        return
      }

      const { edit, ...query } = this.$route.query
      this.$router.replace({ query }).catch(() => {})
    },

    hydrateForm() {
      if (!this.user) {
        return
      }

      this.form = {
        fullName: this.user.fullName || '',
        username: this.user.username || '',
        email: this.user.email || '',
        phone: this.user.phone || '',
        location: this.user.location || '',
        gender: this.user.gender || '',
        dateOfBirth: this.user.dateOfBirth ? new Date(this.user.dateOfBirth).toISOString().slice(0, 10) : '',
        bio: this.user.bio || '',
        skills: toCommaList(this.user.skills),
        skillsToLearn: toCommaList(this.user.skillsToLearn)
      }

      this.profileImageFile = null
      this.profileImagePreview = this.user.profilePicture || ''
      if (this.$refs.profileImageInput) {
        this.$refs.profileImageInput.value = ''
      }
    },

    async loadProfile() {
      this.loading = true
      try {
        if (!this.user) {
          await this.authStore.getUser()
        }

        this.hydrateForm()
        await this.loadContent()
      } catch (error) {
        alert('Failed to load profile: ' + (error.response?.data?.msg || error.message))
      } finally {
        this.loading = false
      }
    },

    async loadContent() {
      if (!this.user?._id) {
        return
      }

      this.contentLoading = true
      try {
        const [postsResponse, reelsResponse] = await Promise.all([
          api.get(`/posts/user/${this.user._id}`),
          api.get(`/reels/user/${this.user._id}`)
        ])

        this.userPosts = postsResponse.data
        this.userReels = reelsResponse.data
      } catch (error) {
        alert('Failed to load your posts or reels: ' + (error.response?.data?.msg || error.message))
      } finally {
        this.contentLoading = false
      }
    },

    openEditor() {
      this.isEditing = true
      this.$nextTick(() => {
        this.$refs.editorCard?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      })
    },

    cancelEditing() {
      this.isEditing = false
      this.hydrateForm()
      this.clearEditQuery()
    },

    triggerImageUpload() {
      this.$refs.profileImageInput?.click()
    },

    revokePreviewIfNeeded() {
      if (this.profileImagePreview?.startsWith('blob:')) {
        URL.revokeObjectURL(this.profileImagePreview)
      }
    },

    handleProfileImageSelect(event) {
      const file = event.target.files?.[0]
      if (!file) {
        return
      }

      if (!file.type.startsWith('image/')) {
        alert('Please choose an image file.')
        event.target.value = ''
        return
      }

      if (file.size > 5 * 1024 * 1024) {
        alert('Please choose an image smaller than 5MB.')
        event.target.value = ''
        return
      }

      this.profileImageFile = file
      this.revokePreviewIfNeeded()
      this.profileImagePreview = URL.createObjectURL(file)
    },

    async saveProfile() {
      this.saving = true
      try {
        const formData = new FormData()
        formData.append('fullName', this.form.fullName.trim())
        formData.append('username', this.form.username.trim())
        formData.append('email', this.form.email.trim())
        formData.append('phone', this.form.phone.trim())
        formData.append('location', this.form.location.trim())
        formData.append('gender', this.form.gender.trim())
        formData.append('dateOfBirth', this.form.dateOfBirth || '')
        formData.append('bio', this.form.bio.trim())
        formData.append('skills', this.form.skills)
        formData.append('skillsToLearn', this.form.skillsToLearn)

        if (this.profileImageFile) {
          formData.append('profilePicture', this.profileImageFile)
        }

        await this.authStore.updateUser(formData)
        this.hydrateForm()
        this.isEditing = false
        this.clearEditQuery()
      } catch (error) {
        const message = error.response?.data?.errors?.[0]?.msg || error.response?.data?.msg || error.message
        alert('Failed to save profile: ' + message)
      } finally {
        this.saving = false
      }
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
.profile-page {
  display: grid;
  gap: 22px;
}

.profile-hero,
.state-card,
.panel-card {
  background: white;
  border: 1px solid #e7ecf5;
  border-radius: 24px;
  box-shadow: 0 18px 40px rgba(38, 56, 96, 0.08);
}

.profile-hero,
.state-card,
.panel-card {
  padding: 24px;
}

.profile-top {
  display: flex;
  align-items: center;
  gap: 22px;
}

.avatar-shell {
  flex-shrink: 0;
}

.profile-image,
.profile-avatar {
  width: 108px;
  height: 108px;
  border-radius: 30px;
}

.profile-image {
  object-fit: cover;
}

.profile-avatar {
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  font-size: 2rem;
  font-weight: 800;
}

.eyebrow {
  margin: 0 0 10px;
  font-size: 0.8rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #6d7bd9;
}

.hero-copy h2,
.panel-head h3,
.state-card h3 {
  margin: 0;
  color: #1f2c48;
}

.hero-subtitle {
  margin: 8px 0 10px;
  color: #66758f;
  font-weight: 700;
}

.hero-bio,
.panel-copy,
.state-card p,
.panel-note,
.empty-copy,
.photo-help {
  margin: 0;
  color: #68758f;
  line-height: 1.6;
}

.hero-bio {
  margin-top: 8px;
}

.hero-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 18px;
}

.hero-stat {
  min-width: 110px;
  padding: 14px 16px;
  border-radius: 18px;
  background: #f6f8fd;
  border: 1px solid #e4eaf5;
}

.hero-stat strong,
.hero-stat span {
  display: block;
}

.hero-stat strong {
  color: #23314d;
  font-size: 1.1rem;
}

.hero-stat span {
  margin-top: 4px;
  color: #6e7b96;
  font-size: 0.85rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.panel-head {
  margin-bottom: 14px;
}

.panel-head.split {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.action-row {
  display: flex;
  gap: 12px;
}

.editor-layout,
.profile-content-grid {
  display: grid;
  gap: 18px;
}

.editor-layout {
  grid-template-columns: 220px minmax(0, 1fr);
}

.photo-editor {
  display: grid;
  gap: 12px;
  align-content: start;
}

.hidden-input {
  display: none;
}

.photo-preview-shell {
  width: 100%;
  aspect-ratio: 1 / 1;
  border-radius: 24px;
  overflow: hidden;
  background: #f5f7fc;
  border: 1px dashed #c6d0e4;
}

.photo-preview,
.photo-placeholder {
  width: 100%;
  height: 100%;
}

.photo-preview {
  object-fit: cover;
}

.photo-placeholder {
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  font-size: 2.2rem;
  font-weight: 800;
}

.form-grid {
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}

.field {
  display: grid;
  gap: 8px;
}

.field.wide {
  grid-column: 1 / -1;
}

.field span {
  font-size: 0.8rem;
  font-weight: 800;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: #7a86a0;
}

.input {
  width: 100%;
  border: 1px solid #d7deeb;
  border-radius: 16px;
  padding: 14px 16px;
  font: inherit;
}

.input:focus {
  outline: none;
  border-color: #7280da;
  box-shadow: 0 0 0 4px rgba(114, 128, 218, 0.12);
}

.textarea {
  resize: vertical;
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

.btn-secondary {
  color: #45546f;
  background: #f3f6fb;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  box-shadow: none;
}

.profile-content-grid {
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
}

.count-pill {
  padding: 8px 12px;
  border-radius: 999px;
  background: #eef2ff;
  color: #667eea;
  font-size: 0.8rem;
  font-weight: 800;
}

.content-list {
  display: grid;
  gap: 14px;
}

.content-item {
  border: 1px solid #e9eef6;
  border-radius: 20px;
  background: #fbfcff;
  padding: 16px;
}

.content-item-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;
}

.content-item-head strong,
.content-item-head span,
.content-item p {
  color: #22314d;
}

.content-item p {
  margin: 0 0 12px;
  line-height: 1.6;
}

.mini-image-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
  margin-bottom: 12px;
}

.mini-image-grid img {
  width: 100%;
  height: 120px;
  object-fit: cover;
  border-radius: 14px;
}

.profile-reel-video {
  width: 100%;
  max-height: 360px;
  border-radius: 18px;
  background: #0f1728;
  object-fit: contain;
  margin-bottom: 12px;
}

.chip-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.chip {
  padding: 9px 12px;
  border-radius: 999px;
  background: #eef2ff;
  color: #667eea;
  font-weight: 700;
  font-size: 0.85rem;
}

@media (max-width: 900px) {
  .editor-layout {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .profile-top,
  .panel-head.split {
    flex-direction: column;
    align-items: flex-start;
  }

  .action-row,
  .btn {
    width: 100%;
  }
}
</style>
