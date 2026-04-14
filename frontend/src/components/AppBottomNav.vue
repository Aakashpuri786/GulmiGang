<script setup>
import { RouterLink } from 'vue-router'
</script>

<template>
  <nav class="app-bottom-nav" aria-label="Primary">
    <div class="app-bottom-nav-inner">
      <div class="nav-cluster nav-cluster-left">
        <RouterLink to="/feed" class="nav-link bottom-nav-link">
          <span class="nav-icon">Home</span>
          <span class="nav-text">Home</span>
        </RouterLink>
        <RouterLink to="/reels" class="nav-link bottom-nav-link">
          <span class="nav-icon">Reels</span>
          <span class="nav-text">Reels</span>
        </RouterLink>
      </div>

      <div class="nav-cluster nav-cluster-center">
        <RouterLink to="/create" class="nav-link bottom-nav-link create-btn">
          <span class="nav-icon">+</span>
          <span class="nav-text">Create</span>
        </RouterLink>
      </div>

      <div class="nav-cluster nav-cluster-right">
        <RouterLink to="/chat" class="nav-link bottom-nav-link">
          <span class="nav-icon">Chat</span>
          <span class="nav-text">Chat</span>
        </RouterLink>
        <RouterLink to="/profile" class="nav-link bottom-nav-link">
          <span class="nav-icon">Profile</span>
          <span class="nav-text">Profile</span>
        </RouterLink>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.app-bottom-nav {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1100;
  display: flex;
  justify-content: center;
  padding: 0 20px calc(18px + env(safe-area-inset-bottom, 0px));
  pointer-events: none;
}

.app-bottom-nav-inner {
  width: min(760px, 100%);
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 14px;
  align-items: center;
  padding: 12px 14px;
  border-radius: 26px;
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(214, 223, 237, 0.95);
  box-shadow: 0 18px 45px rgba(31, 44, 72, 0.16);
  backdrop-filter: blur(18px);
  pointer-events: auto;
}

.nav-cluster {
  display: flex;
  align-items: center;
  gap: 10px;
}

.nav-cluster-center {
  justify-content: center;
}

.nav-cluster-right {
  justify-content: flex-end;
}

.nav-link {
  color: #364157;
  font-weight: 600;
  text-decoration: none;
  padding: 10px 14px;
  border-radius: 18px;
  transition: background-color 0.2s ease, color 0.2s ease, transform 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  border: none;
  background: transparent;
  cursor: pointer;
  font: inherit;
}

.nav-link:hover {
  background: rgba(102, 126, 234, 0.08);
  color: #2a3650;
}

.nav-link.router-link-active {
  background: rgba(102, 126, 234, 0.12);
  color: #667eea;
}

.bottom-nav-link {
  min-height: 70px;
  min-width: 104px;
  flex-direction: column;
  justify-content: center;
  gap: 8px;
  padding: 12px 14px;
}

.nav-icon {
  font-size: 0.9rem;
  line-height: 1;
  font-weight: 700;
}

.nav-text {
  font-size: 0.78rem;
  line-height: 1;
}

.create-btn {
  min-width: 136px;
  background: linear-gradient(135deg, #667eea, #764ba2) !important;
  color: white !important;
  box-shadow: 0 8px 18px rgba(102, 126, 234, 0.28);
}

.create-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 12px 22px rgba(102, 126, 234, 0.34);
}

@media (max-width: 768px) {
  .app-bottom-nav {
    padding: 0 12px calc(10px + env(safe-area-inset-bottom, 0px));
  }

  .app-bottom-nav-inner {
    width: 100%;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    gap: 8px;
    padding: 10px;
    border-radius: 22px 22px 0 0;
  }

  .nav-cluster {
    display: contents;
  }

  .bottom-nav-link {
    min-width: 0;
    min-height: 62px;
    padding: 10px 6px;
  }

  .create-btn {
    min-width: 0;
  }

  .nav-icon {
    font-size: 0.7rem;
  }

  .nav-text {
    font-size: 0.68rem;
  }
}
</style>
