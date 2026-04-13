<template>
  <div class="login">
    <div class="card">
      <div class="card-header">
        <h1 class="card-title">Welcome Back</h1>
        <p class="card-subtitle">Sign in to your GulmiGang account</p>
      </div>

      <!-- Message Display -->
      <div v-if="message" :class="['message', messageType]">
        <span class="message-icon">{{ messageType === 'success' ? '✅' : '❌' }}</span>
        <span class="message-text">{{ message }}</span>
      </div>

      <Form @submit.prevent="handleSubmit" class="login-form">
        <div class="form-group">
          <label for="identifier" class="form-label">Email or Username</label>
          <Field name="identifier" rules="required" v-slot="{ field, errorMessage }">
            <input
              id="identifier"
              v-bind="field"
              type="text"
              class="form-input"
              placeholder="Enter your email or username"
              :class="{ 'error': errorMessage }"
            />
            <span v-if="errorMessage" class="error-message">{{ errorMessage }}</span>
          </Field>
        </div>

        <div class="form-group">
          <label for="password" class="form-label">Password</label>
          <Field name="password" rules="required" v-slot="{ field, errorMessage }">
            <input
              id="password"
              v-bind="field"
              type="password"
              class="form-input"
              placeholder="Enter your password"
              :class="{ 'error': errorMessage }"
            />
            <span v-if="errorMessage" class="error-message">{{ errorMessage }}</span>
          </Field>
        </div>

        <div class="form-group">
          <label class="checkbox-label">
            <input type="checkbox" v-model="rememberMe" />
            <span class="checkmark"></span>
            Remember me
          </label>
        </div>

        <button type="submit" class="btn btn-primary btn-lg" :disabled="loading" style="width: 100%;">
          <span v-if="loading" class="loading-spinner"></span>
          {{ loading ? 'Signing In...' : 'Sign In' }}
        </button>
      </Form>

      <div class="text-center mt-3">
        <p>Don't have an account? <router-link to="/register" class="text-primary">Create one here</router-link></p>
        <p><a href="#" class="text-muted">Forgot your password?</a></p>
      </div>
    </div>
  </div>
</template>

<script>
import { Form, Field } from 'vee-validate'
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'

export default {
  components: { Form, Field },
  setup() {
    const authStore = useAuthStore()
    const router = useRouter()
    return { authStore, router }
  },
  data() {
    return {
      loading: false,
      rememberMe: false,
      message: null,
      messageType: null // 'success' or 'error'
    }
  },
  methods: {
    async handleSubmit(values) {
      this.loading = true
      this.message = null
      this.messageType = null

      try {
        console.log('Submitting login:', values)
        const response = await this.authStore.login(values)
        console.log('Login successful:', response)

        this.message = 'Login successful! Redirecting...'
        this.messageType = 'success'

        // Redirect after a short delay to show success message
        setTimeout(() => {
          this.router.push('/feed')
        }, 1000)

      } catch (err) {
        console.error('Login error:', err)
        this.messageType = 'error'

        // Handle different types of errors
        if (err.response?.data?.msg) {
          this.message = err.response.data.msg
        } else if (err.response?.status === 400) {
          this.message = 'Invalid credentials. Please check your email/username and password.'
        } else if (err.response?.status === 401) {
          this.message = 'Authentication failed. Please try again.'
        } else if (err.response?.status === 500) {
          this.message = 'Server error. Please try again later.'
        } else if (!err.response) {
          this.message = 'Network error. Please check your connection and try again.'
        } else {
          this.message = err.message || 'Login failed. Please try again.'
        }
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.login {
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
}

.card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.card-header {
  padding: 24px;
  text-align: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.card-title {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 700;
}

.card-subtitle {
  margin: 0;
  opacity: 0.9;
  font-size: 16px;
}

.message {
  padding: 12px 20px;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 500;
  font-size: 14px;
}

.message.success {
  background-color: #d4edda;
  color: #155724;
  border-left: 4px solid #28a745;
}

.message.error {
  background-color: #f8d7da;
  color: #721c24;
  border-left: 4px solid #dc3545;
}

.message-icon {
  font-size: 16px;
  flex-shrink: 0;
}

.message-text {
  flex: 1;
}

.login-form {
  padding: 24px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #495057;
  cursor: pointer;
}

.checkbox-label input[type="checkbox"] {
  width: 16px;
  height: 16px;
  accent-color: #667eea;
}

.text-primary {
  color: #667eea;
  text-decoration: none;
}

.text-primary:hover {
  text-decoration: underline;
}

.text-muted {
  color: #6c757d;
  text-decoration: none;
}

.text-muted:hover {
  color: #495057;
}
</style>