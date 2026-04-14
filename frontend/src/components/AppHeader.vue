<template>
  <header class="site-header app-header">
    <div class="brand">
      <div class="brand-mark">GG</div>
      <div>
        <h1>GulmiGang</h1>
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

@media (max-width: 768px) {
  .site-header {
    padding: 20px;
  }
}
</style>
