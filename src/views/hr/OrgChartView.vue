<template>
  <div class="org-page">
    <div class="breadcrumb">인사 / 조직도</div>

    <section class="page-head">
      <div class="title-wrap">
        <h1>조직도</h1>
      </div>
    </section>

    <OrgExplorer />
  </div>
</template>

<script setup>
import OrgExplorer from '@/components/org/OrgExplorer.vue'
</script>

<style scoped>
.org-page { width: 100%; max-width: none; min-width: 0; }
.breadcrumb { font-size: .78rem; color: var(--gray400); margin-bottom: 4px; }

.page-head {
  margin-top: 12px;
  margin-bottom: 12px;
  background: var(--glass);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 16px;
}

.title-wrap { display: flex; align-items: center; gap: 10px; }
.title-wrap h1 { margin: 0; font-size: 1.5rem; color: var(--gray800); }
</style>
