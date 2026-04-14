<script setup>
import { RouterLink } from 'vue-router'
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
}
</style>
