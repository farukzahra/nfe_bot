<script setup lang="ts">
import PageCard from '@/components/PageCard.vue'
</script>

<template>
  <PageCard
    title="Importação"
    subtitle="Envie arquivos XML ou ZIP com notas fiscais"
  >
    <v-sheet
      class="pa-8 text-center border-dashed"
      rounded="sm"
      border
    >
      <v-icon icon="mdi-cloud-upload-outline" size="48" color="primary" class="mb-4" />
      <div class="text-h6 mb-2">Upload disponível na Fase 1</div>
      <p class="text-body-2 text-medium-emphasis mb-0">
        Arraste arquivos .xml ou .zip para importar NF-e e NFC-e.
      </p>
    </v-sheet>
  </PageCard>
</template>
