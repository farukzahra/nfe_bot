<script setup lang="ts">
import PageCard from '@/components/PageCard.vue'
</script>

<template>
  <PageCard
    title="Documentos Fiscais"
    subtitle="Entradas, saídas e histórico de importações"
  >
    <v-empty-state
      icon="mdi-file-document-outline"
      title="Nenhum documento importado"
      text="Use a tela de importação para enviar XMLs ou arquivos ZIP."
    >
      <template #actions>
        <v-btn to="/import" prepend-icon="mdi-upload">
          Importar agora
        </v-btn>
      </template>
    </v-empty-state>
  </PageCard>
</template>
