<script setup lang="ts">
import BrandLogo from '@/components/BrandLogo.vue'

defineProps<{
  title: string
  subtitle?: string
}>()
</script>

<template>
  <v-main class="auth-bg">
    <v-container class="fill-height py-8">
      <v-row align="center" justify="center">
        <v-col cols="12" sm="10" md="6" lg="4">
          <div class="text-center mb-8">
            <BrandLogo large class="justify-center mb-2" />
            <p v-if="subtitle" class="text-body-2 text-medium-emphasis mt-2">
              {{ subtitle }}
            </p>
          </div>

          <v-card class="pa-6" elevation="8">
            <v-card-title class="text-h5 font-weight-bold pa-0 mb-6">
              {{ title }}
            </v-card-title>

            <slot />
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </v-main>
</template>
