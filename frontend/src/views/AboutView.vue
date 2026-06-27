<script setup lang="ts">
import PageCard from '@/components/PageCard.vue'
import {
  documentationIndex,
  projectSummary,
  repositoryUrl,
} from '@/data/docs-index'
</script>

<template>
  <PageCard
    title="Sobre o NFe Bot"
    subtitle="Documentação do projeto — espelho do índice em main.md"
  >
    <p class="text-body-1 mb-6">
      {{ projectSummary }}
    </p>

    <v-alert type="info" variant="tonal" class="mb-6">
      Os arquivos abaixo ficam na pasta <code>docs/</code> do repositório.
      O índice principal é <code>main.md</code>.
    </v-alert>

    <v-list lines="two" class="pa-0">
      <v-list-item
        v-for="doc in documentationIndex"
        :key="doc.id"
        rounded="sm"
        class="mb-2 doc-item"
      >
        <template #prepend>
          <v-avatar color="primary" variant="tonal" size="36">
            <span class="text-caption font-weight-bold">{{ doc.number }}</span>
          </v-avatar>
        </template>

        <v-list-item-title class="font-weight-medium">
          {{ doc.title }}
        </v-list-item-title>
        <v-list-item-subtitle>
          {{ doc.description }}
        </v-list-item-subtitle>

        <template #append>
          <v-chip size="small" variant="outlined" class="doc-file">
            {{ doc.file }}
          </v-chip>
        </template>
      </v-list-item>
    </v-list>

    <v-divider class="my-6" />

    <div class="d-flex align-center flex-wrap ga-3">
      <v-btn
        :href="repositoryUrl"
        target="_blank"
        rel="noopener noreferrer"
        prepend-icon="mdi-github"
        variant="outlined"
      >
        Repositório GitHub
      </v-btn>
      <v-chip prepend-icon="mdi-book-open-variant" variant="tonal">
        {{ documentationIndex.length }} documentos
      </v-chip>
    </div>
  </PageCard>
</template>

<style scoped>
.doc-item {
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.doc-file {
  font-family: monospace;
  font-size: 0.75rem;
}

code {
  font-family: monospace;
  font-size: 0.875rem;
}
</style>
