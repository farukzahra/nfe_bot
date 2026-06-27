<script setup lang="ts">
import PageCard from '@/components/PageCard.vue'
</script>

<template>
  <PageCard
    title="Chatbot Gerencial"
    subtitle="Consultas em linguagem natural sobre seus dados fiscais"
  >
    <v-sheet class="pa-8" rounded="sm" color="#212121">
      <div class="d-flex align-center mb-4">
        <v-icon icon="mdi-robot-outline" color="primary" class="mr-3" />
        <div>
          <div class="text-h6">Assistente fiscal</div>
          <div class="text-body-2 text-medium-emphasis">
            Disponível na Fase 3
          </div>
        </div>
      </div>
      <p class="text-body-2 text-medium-emphasis mb-0">
        Pergunte sobre vendas, compras, produtos e fornecedores usando linguagem natural.
      </p>
    </v-sheet>
  </PageCard>
</template>
