<script setup>
import { RouterLink, RouterView } from 'vue-router'
import { useAuthStore } from './stores/auth'
import { computed, onMounted } from 'vue'

const authStore = useAuthStore()
onMounted(() => {
  authStore.initAuth()
})

const isAuthenticated = computed(() => !!authStore.token)

const logout = () => {
  authStore.logout()
}
</script>

<template>
  <div id="app">
    <!-- Landing Page Header (when not authenticated) -->
    <header v-if="!isAuthenticated" class="site-header landing-header">
      <div class="brand">
        <div class="brand-mark">GG</div>
        <div>
          <h1>GulmiGang</h1>
          <p>Connecting our district through community, skills, and local support.</p>
        </div>
      </div>

      <nav class="site-nav">
        <RouterLink to="/" class="nav-link">Home</RouterLink>
        <RouterLink to="/login" class="nav-link btn btn-outline">Sign In</RouterLink>
        <RouterLink to="/register" class="nav-link btn btn-primary">Join Now</RouterLink>
      </nav>
    </header>

    <!-- Main App Header (when authenticated) -->
    <header v-else class="site-header app-header">
      <div class="brand">
        <div class="brand-mark">GG</div>
        <div>
          <h1>GulmiGang</h1>
        </div>
      </div>

      <nav class="site-nav app-nav">
        <RouterLink to="/feed" class="nav-link">
          <span class="nav-icon">🏠</span>
          <span class="nav-text">Home</span>
        </RouterLink>
        <RouterLink to="/reels" class="nav-link">
          <span class="nav-icon">🎥</span>
          <span class="nav-text">Reels</span>
        </RouterLink>
        <RouterLink to="/create" class="nav-link create-btn">
          <span class="nav-icon">➕</span>
        </RouterLink>
        <RouterLink to="/profile" class="nav-link">
          <span class="nav-icon">👤</span>
          <span class="nav-text">Profile</span>
        </RouterLink>
        <button @click="logout" class="nav-link logout-btn">
          <span class="nav-icon">🚪</span>
          <span class="nav-text">Logout</span>
        </button>
      </nav>
    </header>

    <main class="site-content">
      <RouterView />
    </main>

    <footer v-if="!isAuthenticated" class="site-footer">
      <p>© 2026 GulmiGang. Built for the Gulmi community.</p>
    </footer>
  </div>
</template>

<style scoped>
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(180deg, #f7f9ff 0%, #ffffff 100%);
}

.site-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding: 24px 32px;
  background: white;
  box-shadow: 0 10px 35px rgba(102, 126, 234, 0.08);
  border-bottom: 1px solid #e9eef5;
  flex-wrap: wrap;
}

.landing-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.95);
}

.app-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: white;
  border-bottom: 1px solid #e9eef5;
}

.site-nav {
  display: flex;
  gap: 18px;
  flex-wrap: wrap;
}

.app-nav {
  gap: 8px;
}

.nav-link {
  color: #364157;
  font-weight: 600;
  text-decoration: none;
  padding: 10px 14px;
  border-radius: 12px;
  transition: background-color 0.2s ease, color 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;
}

.nav-link:hover {
  background: rgba(102, 126, 234, 0.08);
  color: #2a3650;
}

.nav-link.router-link-active {
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
}

.nav-icon {
  font-size: 18px;
}

.nav-text {
  display: none;
}

.create-btn {
  background: linear-gradient(135deg, #667eea, #764ba2) !important;
  color: white !important;
  padding: 12px !important;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.create-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4) !important;
}

.logout-btn {
  color: #dc3545;
}

.logout-btn:hover {
  background: rgba(220, 53, 69, 0.1) !important;
  color: #dc3545 !important;
}

.site-content {
  flex: 1;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 24px 40px;
}

.landing-header + .site-content {
  padding-top: 120px;
}

.app-header + .site-content {
  padding-top: 100px;
}

.site-footer {
  padding: 20px 24px;
  text-align: center;
  color: #6c7a95;
  font-size: 0.95rem;
  border-top: 1px solid #e9eef5;
  background: white;
}

@media (max-width: 768px) {
  .site-header {
    padding: 20px;
  }

  .site-nav {
    width: 100%;
    justify-content: center;
  }

  .nav-text {
    display: inline;
    font-size: 12px;
  }

  .site-content {
    padding: 24px 16px 32px;
  }

  .landing-header + .site-content {
    padding-top: 140px;
  }

  .app-header + .site-content {
    padding-top: 120px;
  }
}
</style>
