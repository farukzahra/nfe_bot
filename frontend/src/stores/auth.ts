import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api, type AuthUser } from '@/api/client'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<AuthUser | null>(null)
  const token = ref<string | null>(localStorage.getItem('token'))
  const loading = ref(false)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => !!token.value)

  function setSession(newToken: string, newUser: AuthUser) {
    token.value = newToken
    user.value = newUser
    localStorage.setItem('token', newToken)
  }

  function clearSession() {
    token.value = null
    user.value = null
    localStorage.removeItem('token')
  }

  async function register(email: string, password: string) {
    loading.value = true
    error.value = null

    try {
      const { token: newToken, user: newUser } = await api.register(email, password)
      setSession(newToken, newUser)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Registration failed'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function login(email: string, password: string) {
    loading.value = true
    error.value = null

    try {
      const { token: newToken, user: newUser } = await api.login(email, password)
      setSession(newToken, newUser)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Login failed'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchMe() {
    if (!token.value) return

    try {
      const { user: currentUser } = await api.me()
      user.value = currentUser
    } catch {
      clearSession()
    }
  }

  function logout() {
    clearSession()
  }

  return {
    user,
    token,
    loading,
    error,
    isAuthenticated,
    register,
    login,
    fetchMe,
    logout,
  }
})
