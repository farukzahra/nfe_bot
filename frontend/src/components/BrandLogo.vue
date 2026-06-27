<script setup lang="ts">
defineProps<{
  large?: boolean
}>()
</script>

<template>
  <div class="d-flex align-center brand-logo" :class="{ 'brand-logo--large': large }">
    <v-icon
      icon="mdi-receipt-text-outline"
      :size="large ? 40 : 28"
      class="brand-logo__icon mr-2"
    />
    <div>
      <div class="brand-logo__title">NFe Bot</div>
      <div v-if="large" class="text-body-2 text-medium-emphasis">
        Importação fiscal inteligente
      </div>
    </div>
  </div>
</template>

<style scoped>
.brand-logo__title {
  font-size: 1.125rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  line-height: 1.2;
}

.brand-logo--large .brand-logo__title {
  font-size: 1.75rem;
}
</style>
