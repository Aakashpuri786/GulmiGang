<script setup>
import { RouterLink } from 'vue-router'
</script>

<template>
  <header class="site-header landing-header">
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

.landing-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.95);
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

.brand p {
  margin: 4px 0 0;
  color: #6b7894;
  font-size: 0.95rem;
}

.site-nav {
  display: flex;
  gap: 18px;
  flex-wrap: wrap;
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
  gap: 8px;
}

.nav-link:hover {
  background: rgba(102, 126, 234, 0.08);
  color: #2a3650;
}

@media (max-width: 768px) {
  .site-header {
    padding: 20px;
  }

  .site-nav {
    width: 100%;
    justify-content: center;
  }
}
</style>
