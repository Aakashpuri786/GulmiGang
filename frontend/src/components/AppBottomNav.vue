<template>
  <nav class="app-bottom-nav" aria-label="Primary">
    <div class="app-bottom-nav-inner">
      <div class="nav-cluster nav-cluster-left">
        <RouterLink to="/feed" class="nav-link bottom-nav-link">
          <span class="nav-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-4.5v-6h-5v6H5a1 1 0 0 1-1-1z" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8"/>
            </svg>
          </span>
          <span class="nav-text">Home</span>
        </RouterLink>
        <RouterLink to="/reels" class="nav-link bottom-nav-link">
          <span class="nav-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <rect x="4" y="4" width="16" height="16" rx="4" fill="none" stroke="currentColor" stroke-width="1.8"/>
              <path d="m10 9 5 3-5 3z" fill="currentColor"/>
            </svg>
          </span>
          <span class="nav-text">Reels</span>
        </RouterLink>
      </div>

      <div class="nav-cluster nav-cluster-center">
        <RouterLink to="/create" class="nav-link bottom-nav-link create-btn">
          <span class="nav-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <path d="M12 5v14M5 12h14" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="2"/>
            </svg>
          </span>
          <span class="nav-text">Create</span>
        </RouterLink>
      </div>

      <div class="nav-cluster nav-cluster-right">
        <RouterLink to="/chat" class="nav-link bottom-nav-link">
          <span class="nav-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <path d="M6 7.5h12a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H9l-5 3v-11a2 2 0 0 1 2-2Z" fill="none" stroke="currentColor" stroke-linejoin="round" stroke-width="1.8"/>
            </svg>
          </span>
          <span class="nav-text">Chat</span>
        </RouterLink>
        <RouterLink to="/profile" class="nav-link bottom-nav-link">
          <span class="nav-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <circle cx="12" cy="8" r="3.5" fill="none" stroke="currentColor" stroke-width="1.8"/>
              <path d="M5.5 19a6.5 6.5 0 0 1 13 0" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.8"/>
            </svg>
          </span>
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
  transition: background-color 0.2s ease, color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
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
  box-shadow: inset 0 0 0 1px rgba(102, 126, 234, 0.08);
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
  width: 22px;
  height: 22px;
  line-height: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.nav-icon svg {
  width: 100%;
  height: 100%;
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
    padding: 0 0 env(safe-area-inset-bottom, 0px);
  }

  .app-bottom-nav-inner {
    width: 100%;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    gap: 2px;
    padding: 8px 8px calc(8px + env(safe-area-inset-bottom, 0px));
    border-radius: 24px 24px 0 0;
    border-left: none;
    border-right: none;
    border-bottom: none;
    box-shadow: 0 -8px 30px rgba(31, 44, 72, 0.12);
  }

  .nav-cluster {
    display: contents;
  }

  .bottom-nav-link {
    min-width: 0;
    min-height: 58px;
    padding: 8px 4px;
    border-radius: 16px;
    gap: 6px;
  }

  .create-btn {
    min-width: 0;
    transform: translateY(-10px);
    border-radius: 18px;
  }

  .nav-icon {
    width: 20px;
    height: 20px;
  }

  .nav-text {
    font-size: 0.62rem;
    font-weight: 700;
    letter-spacing: 0.02em;
  }
}
</style>
