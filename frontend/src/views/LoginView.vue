<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AuthLayout from '@/layouts/AuthLayout.vue'

const email = ref('')
const password = ref('')
const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

async function submit() {
  await auth.login(email.value, password.value)
  const redirect = (route.query.redirect as string) || '/documents'
  await router.push(redirect)
}
</script>

<template>
  <AuthLayout title="Entrar" subtitle="Consulte e gerencie suas notas fiscais">
    <v-form @submit.prevent="submit">
      <v-text-field
        v-model="email"
        label="Email"
        type="email"
        prepend-inner-icon="mdi-email-outline"
        data-testid="login-email"
        required
      />
      <v-text-field
        v-model="password"
        label="Senha"
        type="password"
        prepend-inner-icon="mdi-lock-outline"
        data-testid="login-password"
        required
      />

      <v-alert
        v-if="auth.error"
        type="error"
        variant="tonal"
        class="mb-4"
        data-testid="login-error"
      >
        {{ auth.error }}
      </v-alert>

      <v-btn
        type="submit"
        block
        :loading="auth.loading"
        data-testid="login-submit"
      >
        Entrar
      </v-btn>
    </v-form>

    <div class="text-center mt-6">
      <router-link to="/register" class="text-primary text-decoration-none">
        Criar conta
      </router-link>
    </div>
  </AuthLayout>
</template>
