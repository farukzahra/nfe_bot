<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useTheme, useDisplay } from 'vuetify'

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()
const theme = useTheme()
const { mdAndDown } = useDisplay()

// Restore saved theme preference
const savedTheme = localStorage.getItem('nfe-theme')
if (savedTheme) theme.global.name.value = savedTheme

const drawer = ref(!mdAndDown.value)
const rail = ref(false)

const navSections = [
  {
    title: 'Fiscal',
    items: [
      { title: 'Documentos', to: '/documents', icon: 'mdi-file-document-outline' },
      { title: 'Importar', to: '/import', icon: 'mdi-cloud-upload-outline' },
      { title: 'Erros', to: '/errors', icon: 'mdi-alert-circle-outline' },
    ],
  },
  {
    title: 'Inteligência',
    items: [
      { title: 'Chat IA', to: '/chat', icon: 'mdi-robot-happy-outline' },
    ],
  },
  {
    title: 'Sistema',
    items: [
      { title: 'Sobre', to: '/about', icon: 'mdi-information-outline' },
    ],
  },
]

const allNavItems = navSections.flatMap((s) => s.items)

const currentPage = computed(() => {
  const match = allNavItems.find(
    (i) => route.path === i.to || route.path.startsWith(i.to + '/'),
  )
  return match?.title ?? 'Dashboard'
})

const isDark = computed(() => theme.global.current.value.dark)

function toggleTheme() {
  const next = isDark.value ? 'light' : 'dark'
  theme.global.name.value = next
  localStorage.setItem('nfe-theme', next)
}

function toggleRail() {
  rail.value = !rail.value
}

function logout() {
  auth.logout()
  router.push({ name: 'login' })
}

const userInitials = computed(() => {
  const email = auth.user?.email ?? 'U'
  return email.slice(0, 2).toUpperCase()
})

const isFullHeight = computed(() => !!route.meta.fullHeight)
</script>

<template>
  <!-- ─── Sidebar ────────────────────────────────────────── -->
  <v-navigation-drawer
    v-model="drawer"
    :rail="rail && !mdAndDown"
    :temporary="mdAndDown"
    class="admin-sidebar"
    width="260"
    color="surface"
  >
    <!-- Logo -->
    <div class="sidebar-logo" :class="{ 'sidebar-logo--rail': rail && !mdAndDown }">
      <div class="d-flex align-center gap-2">
        <v-icon icon="mdi-receipt-text" color="primary" :size="rail && !mdAndDown ? 26 : 24" />
        <Transition name="slide-fade">
          <span v-if="!rail || mdAndDown" class="sidebar-brand">NFe Bot</span>
        </Transition>
      </div>
      <v-btn
        v-if="!mdAndDown"
        :icon="rail ? 'mdi-chevron-right' : 'mdi-chevron-left'"
        variant="text"
        size="x-small"
        density="compact"
        color="default"
        @click="toggleRail"
      />
    </div>

    <v-divider />

    <!-- Navigation sections -->
    <div class="sidebar-nav">
      <template v-for="section in navSections" :key="section.title">
        <Transition name="fade">
          <p v-if="!rail || mdAndDown" class="sidebar-section-label">{{ section.title }}</p>
        </Transition>
        <v-list nav density="compact" class="px-2 py-0 mb-2">
          <v-list-item
            v-for="item in section.items"
            :key="item.to"
            :to="item.to"
            :prepend-icon="item.icon"
            :title="item.title"
            rounded="lg"
            color="primary"
            class="nav-item mb-1"
            :data-testid="`nav-${item.to.slice(1)}`"
          />
        </v-list>
      </template>
    </div>

    <!-- User profile at bottom -->
    <template #append>
      <v-divider />
      <div class="sidebar-user" :class="{ 'sidebar-user--rail': rail && !mdAndDown }">
        <v-avatar color="primary" size="32" class="flex-shrink-0">
          <span class="text-caption font-weight-bold">{{ userInitials }}</span>
        </v-avatar>
        <Transition name="slide-fade">
          <div v-if="!rail || mdAndDown" class="ml-3 overflow-hidden">
            <div
              class="text-body-2 font-weight-medium text-truncate"
              data-testid="user-email"
            >{{ auth.user?.email }}</div>
            <div class="text-caption text-medium-emphasis">Administrador</div>
          </div>
        </Transition>
      </div>
    </template>
  </v-navigation-drawer>

  <!-- ─── Top bar ───────────────────────────────────────── -->
  <v-app-bar flat color="surface" border="b" class="admin-appbar">
    <!-- Mobile menu button -->
    <v-btn
      v-if="mdAndDown"
      icon="mdi-menu"
      variant="text"
      class="ml-1"
      @click="drawer = !drawer"
    />

    <!-- Breadcrumb -->
    <v-app-bar-title>
      <div class="d-flex align-center">
        <span class="text-body-2 text-medium-emphasis">NFe Bot</span>
        <v-icon size="14" class="mx-1 text-disabled">mdi-chevron-right</v-icon>
        <span class="text-body-2 font-weight-semibold">{{ currentPage }}</span>
      </div>
    </v-app-bar-title>

    <v-spacer />

    <!-- Theme toggle -->
    <v-tooltip :text="isDark ? 'Modo claro' : 'Modo escuro'" location="bottom">
      <template #activator="{ props }">
        <v-btn
          v-bind="props"
          :icon="isDark ? 'mdi-weather-sunny' : 'mdi-weather-night'"
          variant="text"
          size="small"
          class="mr-1"
          @click="toggleTheme"
        />
      </template>
    </v-tooltip>

    <!-- User menu -->
    <v-menu :close-on-content-click="true">
      <template #activator="{ props }">
        <v-btn v-bind="props" variant="text" class="mr-2 px-2 user-menu-btn" data-testid="user-menu-btn">
          <v-avatar color="primary" size="30">
            <span class="text-caption font-weight-bold" style="font-size: 0.7rem">{{ userInitials }}</span>
          </v-avatar>
          <v-icon size="16" class="ml-1 text-medium-emphasis">mdi-chevron-down</v-icon>
        </v-btn>
      </template>

      <v-card min-width="220" rounded="xl" elevation="12" class="mt-2">
        <v-list>
          <v-list-item class="py-3 px-4">
            <template #prepend>
              <v-avatar color="primary" size="40">
                <span class="text-body-2 font-weight-bold">{{ userInitials }}</span>
              </v-avatar>
            </template>
            <v-list-item-title class="text-body-2 font-weight-semibold">
              {{ auth.user?.email }}
            </v-list-item-title>
            <v-list-item-subtitle>Administrador</v-list-item-subtitle>
          </v-list-item>
        </v-list>
        <v-divider />
        <v-list density="compact">
          <v-list-item
            prepend-icon="mdi-logout-variant"
            title="Sair"
            class="text-error"
            data-testid="logout-btn"
            @click="logout"
          />
        </v-list>
      </v-card>
    </v-menu>
  </v-app-bar>

  <!-- ─── Main content ─────────────────────────────────── -->
  <v-main class="admin-main">
    <div v-if="isFullHeight" class="full-height-content">
      <router-view />
    </div>
    <v-container v-else fluid class="pa-6">
      <router-view />
    </v-container>
  </v-main>
</template>

<style scoped>
/* ─── Sidebar ──────────────────────────────────────────── */
.admin-sidebar {
  border-right: 1px solid rgba(var(--v-border-color), 0.1) !important;
}

.sidebar-logo {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px 0 16px;
  height: 64px;
  flex-shrink: 0;
}

.sidebar-logo--rail {
  justify-content: center;
  padding: 0;
}

.sidebar-brand {
  font-size: 1.2rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  white-space: nowrap;
}

.sidebar-section-label {
  font-size: 0.68rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(var(--v-theme-on-surface), 0.4);
  padding: 12px 20px 4px;
  margin: 0;
}

.sidebar-nav {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding-top: 8px;
}

.sidebar-user {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  min-height: 56px;
}

.sidebar-user--rail {
  justify-content: center;
  padding: 12px 0;
}

/* Nav items */
:deep(.nav-item .v-list-item__prepend .v-icon) {
  opacity: 0.7;
  transition: opacity 0.2s;
}

:deep(.nav-item.v-list-item--active .v-list-item__prepend .v-icon) {
  opacity: 1;
}

:deep(.nav-item.v-list-item--active) {
  font-weight: 600;
}

/* ─── App bar ──────────────────────────────────────────── */
.admin-appbar {
  border-bottom: 1px solid rgba(var(--v-border-color), 0.1) !important;
}

.user-menu-btn {
  height: 40px !important;
  min-width: unset;
}

/* ─── Main ─────────────────────────────────────────────── */
.admin-main {
  background: rgb(var(--v-theme-background));
}

.full-height-content {
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* ─── Transitions ──────────────────────────────────────── */
.slide-fade-enter-active { transition: all 0.2s ease; }
.slide-fade-leave-active { transition: all 0.15s ease; }
.slide-fade-enter-from { opacity: 0; transform: translateX(-8px); }
.slide-fade-leave-to { opacity: 0; transform: translateX(-4px); }

.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
