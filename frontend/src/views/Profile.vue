<template>
  <div class="profile">
    <h2>Profile</h2>
    <p>Your profile page. Coming soon!</p>
    <button @click="logout" class="btn btn-secondary">Logout</button>
  </div>
</template>

<script>
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'

export default {
  setup() {
    const authStore = useAuthStore()
    const router = useRouter()
    return { authStore, router }
  },
  methods: {
    logout() {
      this.authStore.logout()
      this.router.push('/')
    }
  }
}
</script>

<style scoped>
.profile {
  max-width: 600px;
  margin: 50px auto;
  padding: 20px;
}
</style>