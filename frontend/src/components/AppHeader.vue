<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()
const router = useRouter()
const menuOpen = ref(false)
const menuRef = ref(null)

const closeMenu = () => {
  menuOpen.value = false
}

const toggleMenu = () => {
  menuOpen.value = !menuOpen.value
}

const handleDocumentClick = (event) => {
  if (!menuRef.value?.contains(event.target)) {
    closeMenu()
  }
}

const goToSettings = async () => {
  closeMenu()
  await router.push({ path: '/profile', query: { edit: '1' } }).catch(() => {})
}

const logout = async () => {
  closeMenu()
  authStore.logout()
  await router.push('/login').catch(() => {})
}

onMounted(() => {
  document.addEventListener('click', handleDocumentClick)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleDocumentClick)
})
</script>

<template>
  <header class="site-header app-header">
    <div class="brand">
      <div class="brand-mark">GG</div>
      <div>
        <h1>GulmiGang</h1>
      </div>
    </div>

    <div class="header-actions">
      <RouterLink to="/search" class="search-link" aria-label="Open search">
        <svg viewBox="0 0 24 24" class="search-icon" aria-hidden="true">
          <path
            d="M10.5 4a6.5 6.5 0 1 0 4.03 11.6l4.43 4.43 1.41-1.41-4.43-4.43A6.5 6.5 0 0 0 10.5 4Zm0 2a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9Z"
            fill="currentColor"
          />
        </svg>
        <span>Search</span>
      </RouterLink>

      <div ref="menuRef" class="menu-shell">
        <button
          type="button"
          class="menu-toggle"
          aria-label="Open account menu"
          :aria-expanded="menuOpen"
          @click.stop="toggleMenu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <div v-if="menuOpen" class="menu-dropdown">
          <button type="button" class="menu-item" @click="goToSettings">
            Settings
          </button>
          <button type="button" class="menu-item danger" @click="logout">
            Logout
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped>
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

.app-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: rgba(255, 255, 255, 0.96);
  backdrop-filter: blur(12px);
}

.brand {
  display: flex;
  align-items: center;
  gap: 14px;
}

.brand-mark {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  font-weight: 800;
  color: white;
  background: linear-gradient(135deg, #667eea, #764ba2);
  box-shadow: 0 10px 24px rgba(102, 126, 234, 0.24);
}

.brand h1 {
  margin: 0;
  color: #1e2845;
  font-size: clamp(1.8rem, 3vw, 2.2rem);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.menu-shell {
  position: relative;
}

.search-link {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  border-radius: 18px;
  background: #f4f7fd;
  color: #33415d;
  text-decoration: none;
  font-weight: 700;
  transition: background-color 0.2s ease, color 0.2s ease, transform 0.2s ease;
}

.search-link:hover {
  background: #eaf0ff;
  color: #5f6dd2;
  transform: translateY(-1px);
}

.search-link.router-link-active {
  background: #eef2ff;
  color: #667eea;
}

.search-icon {
  width: 18px;
  height: 18px;
}

.menu-toggle {
  display: inline-flex;
  flex-direction: column;
  justify-content: center;
  gap: 4px;
  width: 48px;
  height: 48px;
  padding: 0;
  border: 1px solid #e0e8f5;
  border-radius: 18px;
  background: #f4f7fd;
  transition: background-color 0.2s ease, border-color 0.2s ease, transform 0.2s ease;
}

.menu-toggle:hover {
  background: #eaf0ff;
  border-color: #cad7f3;
  transform: translateY(-1px);
}

.menu-toggle span {
  width: 18px;
  height: 2px;
  margin: 0 auto;
  border-radius: 999px;
  background: #33415d;
}

.menu-dropdown {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  min-width: 168px;
  padding: 8px;
  border: 1px solid #e3eaf6;
  border-radius: 18px;
  background: white;
  box-shadow: 0 18px 38px rgba(26, 41, 74, 0.14);
}

.menu-item {
  width: 100%;
  border: none;
  border-radius: 12px;
  background: transparent;
  color: #24324e;
  font: inherit;
  font-weight: 700;
  text-align: left;
  padding: 12px 14px;
  transition: background-color 0.2s ease, color 0.2s ease;
}

.menu-item:hover {
  background: #f4f7fd;
  color: #667eea;
}

.menu-item.danger:hover {
  background: #fff1f1;
  color: #d04b4b;
}

@media (max-width: 768px) {
  .site-header {
    padding: 20px;
  }

  .search-link span {
    display: none;
  }

  .search-link {
    padding: 12px;
  }

  .menu-dropdown {
    right: -4px;
  }
}
</style>
