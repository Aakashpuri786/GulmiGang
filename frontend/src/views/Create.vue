<template>
  <div class="create">
    <div class="create-container">
      <div class="create-header">
        <h2>Create</h2>
        <p>Share your thoughts and moments with the Gulmi community</p>
      </div>

      <div class="create-tabs">
        <button
          @click="setActiveTab('post')"
          :class="{ active: activeTab === 'post' }"
          class="tab-btn"
        >
          📝 Post
        </button>
        <button
          @click="setActiveTab('reel')"
          :class="{ active: activeTab === 'reel' }"
          class="tab-btn"
        >
          🎥 Reel
        </button>
      </div>

      <!-- Post Creation Form -->
      <div v-if="activeTab === 'post'" class="create-form">
        <div class="card">
          <div class="card-header">
            <h3>Create a Post</h3>
          </div>

          <Form ref="postFormRef" @submit.prevent="handleCreatePost" class="post-form">
            <div class="form-group">
              <label class="form-label">What's on your mind?</label>
              <Field name="content" rules="required|max:500" v-slot="{ field, errorMessage }">
                <textarea
                  v-bind="field"
                  class="form-textarea"
                  placeholder="Share your thoughts, experiences, or ask for help..."
                  rows="4"
                  :class="{ 'error': errorMessage }"
                ></textarea>
                <span v-if="errorMessage" class="error-message">{{ errorMessage }}</span>
              </Field>
            </div>

            <div class="form-group">
              <label class="form-label">Add Images (Optional)</label>
              <div class="image-upload">
                <input
                  ref="imageInput"
                  type="file"
                  accept="image/*"
                  multiple
                  @change="handleImageSelect"
                  class="file-input"
                />
                <div
                  @click="$refs.imageInput.click()"
                  class="upload-area"
                  :class="{ 'has-images': selectedImages.length > 0 }"
                >
                  <div v-if="selectedImages.length === 0" class="upload-placeholder">
                    <span class="upload-icon">📷</span>
                    <p>Click to add images</p>
                    <small>PNG, JPG up to 5MB each</small>
                  </div>
                  <div v-else class="image-preview">
                    <div
                      v-for="(image, index) in selectedImages"
                      :key="index"
                      class="preview-item"
                    >
                      <img :src="image.preview" alt="Preview" />
                      <button @click.stop="removeImage(index)" class="remove-btn">✕</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="form-actions">
              <button type="button" @click="clearForm" class="btn btn-secondary">Clear</button>
              <button type="submit" class="btn btn-primary" :disabled="postLoading">
                <span v-if="postLoading" class="loading-spinner"></span>
                {{ postLoading ? 'Posting...' : 'Share Post' }}
              </button>
            </div>
          </Form>
        </div>
      </div>

      <!-- Reel Creation Form -->
      <div v-if="activeTab === 'reel'" class="create-form">
        <div class="card">
          <div class="card-header">
            <h3>Create a Reel</h3>
          </div>

          <Form ref="reelFormRef" @submit.prevent="handleCreateReel" class="reel-form">
            <div class="form-group">
              <label class="form-label">Video</label>
              <div class="video-upload">
                <input
                  ref="videoInput"
                  type="file"
                  accept="video/*"
                  @change="handleVideoSelect"
                  class="file-input"
                />
                <div
                  @click="$refs.videoInput.click()"
                  class="upload-area"
                  :class="{ 'has-video': selectedVideo }"
                >
                  <div v-if="!selectedVideo" class="upload-placeholder">
                    <span class="upload-icon">🎥</span>
                    <p>Click to add a video</p>
                    <small>MP4, MOV up to 50MB</small>
                  </div>
                  <div v-else class="video-preview">
                    <video :src="selectedVideo.preview" controls class="preview-video"></video>
                    <button @click.stop="removeVideo" class="remove-btn">✕</button>
                  </div>
                </div>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Caption</label>
              <Field name="caption" rules="required|max:2200" v-slot="{ field, errorMessage }">
                <textarea
                  v-bind="field"
                  class="form-textarea"
                  placeholder="Add a caption to your reel..."
                  rows="3"
                  :class="{ 'error': errorMessage }"
                ></textarea>
                <span v-if="errorMessage" class="error-message">{{ errorMessage }}</span>
              </Field>
            </div>

            <div class="form-actions">
              <button type="button" @click="clearForm" class="btn btn-secondary">Clear</button>
              <button type="submit" class="btn btn-primary" :disabled="reelLoading">
                <span v-if="reelLoading" class="loading-spinner"></span>
                {{ reelLoading ? 'Creating...' : 'Share Reel' }}
              </button>
            </div>
          </Form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Form, Field } from 'vee-validate'
import { usePostStore } from '../stores/post'
import { useReelStore } from '../stores/reel'
import { useRoute, useRouter } from 'vue-router'

export default {
  components: { Form, Field },
  setup() {
    const postStore = usePostStore()
    const reelStore = useReelStore()
    const router = useRouter()
    const route = useRoute()
    return { postStore, reelStore, router, route }
  },
  data() {
    return {
      activeTab: 'post',
      postLoading: false,
      reelLoading: false,
      selectedImages: [],
      selectedVideo: null
    }
  },
  mounted() {
    this.syncTabFromRoute()
  },
  watch: {
    'route.query.tab'() {
      this.syncTabFromRoute()
    }
  },
  methods: {
    syncTabFromRoute() {
      const nextTab = this.route.query.tab === 'reel' ? 'reel' : 'post'
      if (this.activeTab !== nextTab) {
        this.activeTab = nextTab
      }
    },

    setActiveTab(tab) {
      this.activeTab = tab
      this.router.replace({ path: '/create', query: { tab } }).catch(() => {})
    },

    async handleCreatePost(values) {
      this.postLoading = true
      try {
        const formData = new FormData()
        formData.append('content', values.content)

        this.selectedImages.forEach((image, index) => {
          formData.append('images', image.file)
        })

        await this.postStore.createPost(formData)
        this.clearForm()
        this.$refs.postFormRef?.resetForm()
        this.router.push({ path: '/feed', query: { created: 'post' } })
      } catch (err) {
        alert('Failed to create post: ' + (err.response?.data?.msg || err.message))
      } finally {
        this.postLoading = false
      }
    },

    async handleCreateReel(values) {
      if (!this.selectedVideo) {
        alert('Please select a video first')
        return
      }

      this.reelLoading = true
      try {
        const formData = new FormData()
        formData.append('video', this.selectedVideo.file)
        formData.append('caption', values.caption)

        await this.reelStore.createReel(formData)
        this.clearForm()
        this.$refs.reelFormRef?.resetForm()
        this.router.push({ path: '/reels', query: { created: 'reel' } })
      } catch (err) {
        alert('Failed to create reel: ' + (err.response?.data?.msg || err.message))
      } finally {
        this.reelLoading = false
      }
    },

    handleImageSelect(event) {
      const files = Array.from(event.target.files)
      files.forEach(file => {
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
          alert(`${file.name} is too large. Please select images under 5MB.`)
          return
        }

        const reader = new FileReader()
        reader.onload = (e) => {
          this.selectedImages.push({
            file,
            preview: e.target.result
          })
        }
        reader.readAsDataURL(file)
      })
    },

    handleVideoSelect(event) {
      const file = event.target.files[0]
      if (file) {
        if (file.size > 50 * 1024 * 1024) { // 50MB limit
          alert('Video is too large. Please select a video under 50MB.')
          return
        }

        const reader = new FileReader()
        reader.onload = (e) => {
          this.selectedVideo = {
            file,
            preview: e.target.result
          }
        }
        reader.readAsDataURL(file)
      }
    },

    removeImage(index) {
      this.selectedImages.splice(index, 1)
    },

    removeVideo() {
      this.selectedVideo = null
      this.$refs.videoInput.value = ''
    },

    clearForm() {
      this.selectedImages = []
      this.selectedVideo = null
      if (this.$refs.imageInput) this.$refs.imageInput.value = ''
      if (this.$refs.videoInput) this.$refs.videoInput.value = ''
    }
  }
}
</script>

<style scoped>
.create {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.create-header {
  text-align: center;
  margin-bottom: 40px;
}

.create-header h2 {
  font-size: 2.5rem;
  margin-bottom: 10px;
  color: #2c3e50;
}

.create-header p {
  color: #6c757d;
  font-size: 1.1rem;
}

.create-tabs {
  display: flex;
  justify-content: center;
  margin-bottom: 30px;
  background: white;
  border-radius: 12px;
  padding: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.tab-btn {
  flex: 1;
  padding: 12px 24px;
  border: none;
  background: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.tab-btn.active {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.create-form {
  margin-top: 20px;
}

.card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.card-header {
  padding: 24px;
  border-bottom: 1px solid #e9ecef;
  background: linear-gradient(135deg, #f8f9ff, #ffffff);
}

.card-header h3 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.5rem;
}

.post-form, .reel-form {
  padding: 24px;
}

.form-group {
  margin-bottom: 24px;
}

.form-label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #2c3e50;
}

.form-textarea {
  width: 100%;
  padding: 16px;
  border: 2px solid #e1e5e9;
  border-radius: 12px;
  font-family: inherit;
  font-size: 16px;
  resize: vertical;
  transition: border-color 0.3s ease;
}

.form-textarea:focus {
  outline: none;
  border-color: #667eea;
}

.form-textarea.error {
  border-color: #dc3545;
}

.error-message {
  color: #dc3545;
  font-size: 14px;
  margin-top: 4px;
  display: block;
}

.image-upload, .video-upload {
  width: 100%;
}

.file-input {
  display: none;
}

.upload-area {
  border: 2px dashed #d1d5db;
  border-radius: 12px;
  padding: 40px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #fafbfc;
}

.upload-area:hover {
  border-color: #667eea;
  background: #f0f4ff;
}

.upload-placeholder {
  color: #6b7280;
}

.upload-icon {
  font-size: 48px;
  display: block;
  margin-bottom: 16px;
}

.upload-placeholder p {
  margin: 8px 0 4px;
  font-weight: 600;
}

.upload-placeholder small {
  color: #9ca3af;
}

.has-images .upload-area,
.has-video .upload-area {
  border-color: #10b981;
  background: #f0fdf4;
}

.image-preview {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 12px;
}

.preview-item {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  aspect-ratio: 1;
}

.preview-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.video-preview {
  position: relative;
  max-width: 100%;
  border-radius: 8px;
  overflow: hidden;
}

.preview-video {
  width: 100%;
  max-height: 300px;
  object-fit: contain;
}

.remove-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 32px;
}

.btn {
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.btn-secondary {
  background: #f8f9fa;
  color: #6c757d;
  border: 1px solid #e9ecef;
}

.btn-secondary:hover {
  background: #e9ecef;
}

.loading-spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s ease-in-out infinite;
  margin-right: 8px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .create {
    padding: 16px;
  }

  .create-tabs {
    margin-bottom: 20px;
  }

  .tab-btn {
    padding: 10px 16px;
    font-size: 14px;
  }

  .post-form, .reel-form {
    padding: 20px;
  }

  .upload-area {
    padding: 24px;
  }

  .image-preview {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  }

  .form-actions {
    flex-direction: column;
  }

  .btn {
    width: 100%;
  }
}
</style>
