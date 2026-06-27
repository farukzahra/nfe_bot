<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import BrandLogo from '@/components/BrandLogo.vue'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const navItems = [
  { title: 'Documentos', to: '/documents', icon: 'mdi-file-document-multiple' },
  { title: 'Importar', to: '/import', icon: 'mdi-upload' },
  { title: 'Erros', to: '/errors', icon: 'mdi-alert-circle' },
  { title: 'Chat', to: '/chat', icon: 'mdi-chat' },
  { title: 'Sobre', to: '/about', icon: 'mdi-information-outline' },
]

const currentTitle = computed(() => {
  return navItems.find((item) => item.to === route.path)?.title ?? 'NFe Bot'
})

function logout() {
  auth.logout()
  router.push({ name: 'login' })
}
</script>

<template>
  <v-navigation-drawer permanent color="surface" width="260">
    <div class="pa-4">
      <BrandLogo />
    </div>

    <v-divider />

    <v-list nav density="comfortable" class="px-2">
      <v-list-item
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        :prepend-icon="item.icon"
        :title="item.title"
        :active="route.path === item.to"
        rounded="sm"
        color="primary"
        :data-testid="`nav-${item.to.slice(1)}`"
      />
    </v-list>
  </v-navigation-drawer>

  <v-app-bar flat border="b" color="background">
    <v-app-bar-title class="text-h6 font-weight-medium">
      {{ currentTitle }}
    </v-app-bar-title>
    <v-spacer />
    <v-chip
      variant="tonal"
      color="primary"
      class="mr-3"
      data-testid="user-email"
    >
      {{ auth.user?.email }}
    </v-chip>
    <v-btn
      variant="text"
      prepend-icon="mdi-logout"
      data-testid="logout-btn"
      @click="logout"
    >
      Sair
    </v-btn>
  </v-app-bar>

  <v-main class="app-main">
    <v-container fluid class="py-6">
      <router-view />
    </v-container>
  </v-main>
</template>

<style scoped>
.app-main {
  background:
    radial-gradient(circle at top left, rgba(22, 151, 246, 0.06), transparent 35%),
    rgb(var(--v-theme-background));
  min-height: 100vh;
}
</style>
