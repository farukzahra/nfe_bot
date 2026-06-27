<script setup lang="ts">
import PageCard from '@/components/PageCard.vue'
</script>

<template>
  <PageCard
    title="Erros de Importação"
    subtitle="Arquivos que não puderam ser processados"
  >
    <v-empty-state
      icon="mdi-check-circle-outline"
      title="Nenhum erro registrado"
      text="Quando uma importação falhar, os detalhes aparecerão aqui."
    />
  </PageCard>
</template>
