<template>
  <div class="welcome">
    <!-- Hero Section -->
    <section class="hero">
      <div class="hero-content">
        <h1>Welcome to GulmiGang</h1>
        <p>Connect, learn, and grow with your Gulmi community. Share knowledge, discover local talents, and build meaningful relationships in our beautiful district.</p>

        <div class="hero-stats">
          <div class="stat">
            <span class="stat-number">500+</span>
            <span class="stat-label">Community Members</span>
          </div>
          <div class="stat">
            <span class="stat-number">50+</span>
            <span class="stat-label">Skills Shared</span>
          </div>
          <div class="stat">
            <span class="stat-number">100+</span>
            <span class="stat-label">Local Events</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="features">
      <div class="card">
        <h2 class="text-center mb-3">Why Choose GulmiGang?</h2>
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon">🤝</div>
            <h3>Community Connection</h3>
            <p>Connect with neighbors, friends, and fellow community members across all Gulmi municipalities.</p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">🎓</div>
            <h3>Skill Sharing</h3>
            <p>Learn new skills from local experts and share your knowledge with others in the community.</p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">📍</div>
            <h3>Local Focus</h3>
            <p>Everything is tailored for Gulmi - from location-based content to community-specific events.</p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">🔒</div>
            <h3>Safe & Secure</h3>
            <p>Your privacy matters. Connect safely with verified community members.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="cta-section">
      <div class="card text-center">
        <h2>Join GulmiGang Today</h2>
        <p>Connect with your community, share your skills, and discover amazing opportunities in Gulmi.</p>
        <div class="cta-buttons">
          <router-link to="/register" class="btn btn-primary btn-lg cta-main">
            <span class="btn-icon">🚀</span>
            Get Started Free
          </router-link>
          <router-link to="/login" class="btn btn-secondary btn-lg cta-secondary">
            <span class="btn-icon">🔑</span>
            Sign In
          </router-link>
        </div>
        <div class="cta-features">
          <div class="feature-item">
            <span class="feature-icon">⚡</span>
            <span>Free to join</span>
          </div>
          <div class="feature-item">
            <span class="feature-icon">🛡️</span>
            <span>Safe & secure</span>
          </div>
          <div class="feature-item">
            <span class="feature-icon">🌟</span>
            <span>Community driven</span>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
export default {
  name: 'Welcome'
}
</script>

<style scoped>
.welcome {
  display: grid;
  gap: 40px;
  width: min(1120px, 100%);
  margin: 0 auto;
  padding: 40px 24px 80px;
}

.hero {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 40px;
  align-items: center;
  padding: 40px;
  background: linear-gradient(135deg, #eef3ff 0%, #ffffff 100%);
  border-radius: 28px;
  box-shadow: 0 20px 50px rgba(48, 75, 154, 0.08);
}

.hero-content h1 {
  font-size: clamp(2.5rem, 5vw, 4.25rem);
  margin: 0 0 24px;
  line-height: 1.03;
  color: #1d2446;
}

.hero-content p {
  font-size: 1.05rem;
  max-width: 680px;
  line-height: 1.8;
  color: #4f5c7b;
  margin: 0 0 32px;
}

.hero-stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
}

.stat {
  background: white;
  border-radius: 18px;
  padding: 22px;
  box-shadow: 0 12px 28px rgba(99, 115, 160, 0.08);
  text-align: center;
}

.stat-number {
  display: block;
  font-size: 1.75rem;
  font-weight: 700;
  color: #2c3e50;
}

.stat-label {
  display: block;
  margin-top: 8px;
  color: #6b7a99;
}

.features {
  padding: 0;
}

.card {
  background: white;
  border-radius: 24px;
  padding: 36px;
  box-shadow: 0 18px 60px rgba(87, 103, 164, 0.08);
}

.text-center {
  text-align: center;
}

.mb-3 {
  margin-bottom: 24px;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 24px;
  margin-top: 32px;
}

.feature-card {
  text-align: center;
  padding: 28px 22px;
  border-radius: 20px;
  background: #f7f9ff;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.feature-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 22px 50px rgba(102, 126, 234, 0.14);
}

.feature-icon {
  font-size: 44px;
  margin-bottom: 18px;
}

.feature-card h3 {
  font-size: 1.15rem;
  font-weight: 700;
  margin-bottom: 14px;
  color: #1f2c48;
}

.feature-card p {
  color: #5f6d8c;
  line-height: 1.7;
}

.cta-section {
  padding: 60px 0;
}

.cta-buttons {
  display: flex;
  gap: 20px;
  justify-content: center;
  flex-wrap: wrap;
  margin-top: 30px;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 180px;
  padding: 16px 28px;
  border-radius: 999px;
  font-weight: 700;
  text-decoration: none;
  transition: transform 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease;
  font-size: 1.1rem;
}

.btn-icon {
  font-size: 1.2rem;
  margin-right: 8px;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 20px 40px rgba(102, 126, 234, 0.3);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 25px 50px rgba(102, 126, 234, 0.4);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.9);
  color: #2c3e50;
  border: 2px solid #e1e5e9;
  backdrop-filter: blur(10px);
}

.btn-secondary:hover {
  transform: translateY(-2px);
  background: white;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.cta-features {
  display: flex;
  justify-content: center;
  gap: 32px;
  margin-top: 40px;
  flex-wrap: wrap;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #6c757d;
  font-weight: 500;
}

.feature-icon {
  font-size: 1.2rem;
}

@media (max-width: 1024px) {
  .hero {
    grid-template-columns: 1fr;
    padding: 32px;
  }

  .hero-stats {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .welcome {
    padding: 24px 16px 48px;
    gap: 28px;
  }

  .hero {
    padding: 28px 20px;
  }

  .hero-content h1 {
    font-size: 2.5rem;
  }

  .stat {
    padding: 18px;
  }

  .card {
    padding: 28px;
  }

  .cta-buttons {
    width: 100%;
    flex-direction: column;
    align-items: stretch;
  }

  .btn {
    width: 100%;
  }
}
</style>