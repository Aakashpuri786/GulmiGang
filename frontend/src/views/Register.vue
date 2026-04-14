<template>
  <div class="register">
    <h2>Join GulmiGang</h2>

    <!-- Message Display -->
    <div v-if="message" :class="['message', messageType]">
      <span class="message-icon">{{ messageType === 'success' ? '✅' : '❌' }}</span>
      <span class="message-text">{{ message }}</span>
    </div>

    <Form @submit="onSubmit" class="register-form">
      <div class="form-group">
        <Field name="fullName" rules="required" v-slot="{ field, errorMessage }">
          <input v-bind="field" class="form-input" placeholder="Full Name" />
          <span class="error">{{ errorMessage }}</span>
        </Field>
      </div>
      <div class="form-group">
        <Field name="username" rules="required|min:4|max:20|alpha_num" v-slot="{ field, errorMessage }">
          <input v-bind="field" class="form-input" placeholder="Username" />
          <span class="error">{{ errorMessage }}</span>
        </Field>
      </div>
      <div class="form-group">
        <Field name="email" rules="required|email" v-slot="{ field, errorMessage }">
          <input v-bind="field" type="email" class="form-input" placeholder="Email" />
          <span class="error">{{ errorMessage }}</span>
        </Field>
      </div>
      <div class="form-group">
        <Field name="password" rules="required|min:8" v-slot="{ field, errorMessage }">
          <input v-bind="field" type="password" class="form-input" placeholder="Password" />
          <span class="error">{{ errorMessage }}</span>
        </Field>
      </div>
      <div class="form-group">
        <Field name="location" rules="required" v-slot="{ field, errorMessage }">
          <select v-bind="field" class="form-input">
            <option value="">Select Location in Gulmi</option>
            <option value="Resunga">Resunga</option>
            <option value="Musikot">Musikot</option>
            <option value="Isma">Isma</option>
            <option value="Madane">Madane</option>
            <option value="Chatrakot">Chatrakot</option>
            <option value="Dhurkot">Dhurkot</option>
            <option value="Satyawati">Satyawati</option>
            <option value="Gulmi Darbar">Gulmi Darbar</option>
            <option value="Ruru">Ruru</option>
            <option value="Chandrakot">Chandrakot</option>
            <option value="Kali Gandaki">Kali Gandaki</option>
            <option value="Malika">Malika</option>
          </select>
          <span class="error">{{ errorMessage }}</span>
        </Field>
      </div>
      <button type="submit" class="btn" :disabled="loading">{{ loading ? 'Registering...' : 'Register' }}</button>
    </Form>
    <p>Already have an account? <router-link to="/login">Login</router-link></p>
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
      message: null,
      messageType: null // 'success' or 'error'
    }
  },
  methods: {
    async onSubmit(values) {
      this.loading = true
      this.message = null
      this.messageType = null

      try {
        console.log('Submitting registration:', values)
        const response = await this.authStore.register(values)
        console.log('Registration successful:', response)

        this.message = 'Registration successful! Welcome to GulmiGang!'
        this.messageType = 'success'

        // Redirect after a short delay to show success message
        setTimeout(() => {
          this.router.push('/feed')
        }, 1500)

      } catch (err) {
        console.error('Registration error:', err)
        this.messageType = 'error'

        // Handle different types of errors
        if (err.response?.data?.errors) {
          // Validation errors from express-validator
          this.message = err.response.data.errors.map(error => error.msg).join(', ')
        } else if (err.response?.data?.msg) {
          // Custom error message
          this.message = err.response.data.msg
        } else if (err.response?.status === 400) {
          this.message = 'Please check your information and try again.'
        } else if (err.response?.status === 500) {
          this.message = 'Server error. Please try again later.'
        } else {
          this.message = err.message || 'Registration failed. Please try again.'
        }
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.register {
  max-width: 400px;
  margin: 50px auto;
  padding: 20px;
}

h2 {
  text-align: center;
  margin-bottom: 30px;
}

.message {
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 500;
}

.message.success {
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.message.error {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.message-icon {
  font-size: 18px;
}

.message-text {
  flex: 1;
}

.register-form {
  margin-bottom: 20px;
}

p {
  text-align: center;
  color: #666;
}
</style>
