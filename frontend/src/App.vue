<script setup>
import { RouterView } from 'vue-router'
import { useAuthStore } from './stores/auth'
import { computed, onMounted, watch } from 'vue'
import { useStoryStore } from './stores/story'
import { useChatStore } from './stores/chat'
import PublicHeader from './components/PublicHeader.vue'
import AppHeader from './components/AppHeader.vue'
import AppBottomNav from './components/AppBottomNav.vue'

const authStore = useAuthStore()
const storyStore = useStoryStore()
const chatStore = useChatStore()

onMounted(() => {
  authStore.initAuth()
})

const isAuthenticated = computed(() => !!authStore.token)

watch(() => authStore.token, (token) => {
  if (token) {
    storyStore.initRealtime(token)
    chatStore.initRealtime(token)
  } else {
    storyStore.disconnectSocket()
    chatStore.disconnectSocket()
  }
}, { immediate: true })
</script>

<template>
  <div id="app">
    <PublicHeader v-if="!isAuthenticated" />
    <AppHeader v-else />

    <main class="site-content" :class="{ 'with-bottom-nav': isAuthenticated }">
      <RouterView />
    </main>

    <AppBottomNav v-if="isAuthenticated" />

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

.site-content {
  flex: 1;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 24px 40px;
}

.site-content.with-bottom-nav {
  padding-top: 100px;
  padding-bottom: 148px;
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
  .site-content {
    padding: 24px 16px 32px;
  }

  .site-content.with-bottom-nav {
    padding-top: 104px;
    padding-bottom: 132px;
  }
}
</style>
