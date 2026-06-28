<script setup lang="ts">
defineProps<{
  title: string
  subtitle?: string
}>()

const features = [
  { icon: 'mdi-cloud-upload-outline', text: 'Importação de XML e ZIP em lote' },
  { icon: 'mdi-robot-happy-outline', text: 'Chatbot com inteligência artificial' },
  { icon: 'mdi-chart-bar', text: 'Análise de entradas e saídas' },
  { icon: 'mdi-shield-check-outline', text: 'Dados isolados por usuário' },
]
</script>

<template>
  <v-main class="auth-main">
    <div class="auth-layout">
      <!-- ─── Left panel: branding ─────────────────────── -->
      <div class="auth-brand">
        <div class="auth-brand__inner">
          <!-- Logo -->
          <div class="d-flex align-center mb-6">
            <v-icon icon="mdi-receipt-text" color="white" size="36" class="mr-3" />
            <span class="auth-brand__name">NFe Bot</span>
          </div>

          <h2 class="auth-brand__headline">
            Gestão fiscal inteligente para o seu negócio
          </h2>
          <p class="auth-brand__sub">
            Importe, consulte e analise suas notas fiscais com o poder da IA.
          </p>

          <!-- Feature list -->
          <div class="auth-features">
            <div v-for="f in features" :key="f.text" class="auth-feature">
              <div class="auth-feature__icon">
                <v-icon :icon="f.icon" size="18" color="white" />
              </div>
              <span class="auth-feature__text">{{ f.text }}</span>
            </div>
          </div>

          <!-- Decorative circles -->
          <div class="auth-deco auth-deco--1" />
          <div class="auth-deco auth-deco--2" />
        </div>
      </div>

      <!-- ─── Right panel: form ────────────────────────── -->
      <div class="auth-form">
        <div class="auth-form__inner">
          <!-- Mobile logo -->
          <div class="d-flex d-md-none align-center mb-8">
            <v-icon icon="mdi-receipt-text" color="primary" size="32" class="mr-2" />
            <span style="font-size:1.4rem;font-weight:700">NFe Bot</span>
          </div>

          <h1 class="auth-form__title">{{ title }}</h1>
          <p v-if="subtitle" class="auth-form__subtitle">{{ subtitle }}</p>

          <slot />
        </div>
      </div>
    </div>
  </v-main>
</template>

<style scoped>
.auth-main {
  background: rgb(var(--v-theme-background));
  min-height: 100vh;
}

.auth-layout {
  display: flex;
  min-height: 100vh;
}

/* ─── Left branding panel ───────────────────────────────── */
.auth-brand {
  display: none;
  flex: 0 0 42%;
  background: linear-gradient(135deg, #0f6fc6 0%, #1697f6 50%, #38b6ff 100%);
  position: relative;
  overflow: hidden;
}

@media (min-width: 960px) {
  .auth-brand { display: flex; align-items: center; justify-content: center; }
}

.auth-brand__inner {
  position: relative;
  z-index: 1;
  padding: 48px 52px;
  max-width: 420px;
}

.auth-brand__name {
  font-size: 1.75rem;
  font-weight: 700;
  color: white;
  letter-spacing: 0.02em;
}

.auth-brand__headline {
  font-size: 1.55rem;
  font-weight: 700;
  color: white;
  line-height: 1.35;
  margin-bottom: 12px;
}

.auth-brand__sub {
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.82);
  line-height: 1.6;
  margin-bottom: 40px;
}

.auth-features {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.auth-feature {
  display: flex;
  align-items: center;
  gap: 14px;
}

.auth-feature__icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.18);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.auth-feature__text {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
}

/* Decorative circles */
.auth-deco {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.06);
}
.auth-deco--1 {
  width: 360px;
  height: 360px;
  bottom: -100px;
  right: -80px;
}
.auth-deco--2 {
  width: 200px;
  height: 200px;
  top: -60px;
  left: -60px;
}

/* ─── Right form panel ──────────────────────────────────── */
.auth-form {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 24px;
  background: rgb(var(--v-theme-background));
}

.auth-form__inner {
  width: 100%;
  max-width: 420px;
}

.auth-form__title {
  font-size: 1.6rem;
  font-weight: 700;
  line-height: 1.3;
  margin-bottom: 6px;
  color: rgb(var(--v-theme-on-background));
}

.auth-form__subtitle {
  font-size: 0.9rem;
  color: rgba(var(--v-theme-on-background), 0.6);
  margin-bottom: 28px;
}
</style>
