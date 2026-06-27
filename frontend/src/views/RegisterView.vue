<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AuthLayout from '@/layouts/AuthLayout.vue'

const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const localError = ref<string | null>(null)
const auth = useAuthStore()
const router = useRouter()

async function submit() {
  localError.value = null

  if (password.value !== confirmPassword.value) {
    localError.value = 'As senhas não coincidem'
    return
  }

  await auth.register(email.value, password.value)
  await router.push('/documents')
}
</script>

<template>
  <AuthLayout title="Criar conta" subtitle="Comece a importar suas NF-e e NFC-e">
    <v-form @submit.prevent="submit">
      <v-text-field
        v-model="email"
        label="Email"
        type="email"
        prepend-inner-icon="mdi-email-outline"
        data-testid="register-email"
        required
      />
      <v-text-field
        v-model="password"
        label="Senha"
        type="password"
        prepend-inner-icon="mdi-lock-outline"
        data-testid="register-password"
        required
      />
      <v-text-field
        v-model="confirmPassword"
        label="Confirmar senha"
        type="password"
        prepend-inner-icon="mdi-lock-check-outline"
        data-testid="register-confirm-password"
        required
      />

      <v-alert
        v-if="localError || auth.error"
        type="error"
        variant="tonal"
        class="mb-4"
        data-testid="register-error"
      >
        {{ localError || auth.error }}
      </v-alert>

      <v-btn
        type="submit"
        block
        :loading="auth.loading"
        data-testid="register-submit"
      >
        Criar conta
      </v-btn>
    </v-form>

    <div class="text-center mt-6">
      <router-link to="/login" class="text-primary text-decoration-none">
        Já tenho conta
      </router-link>
    </div>
  </AuthLayout>
</template>
