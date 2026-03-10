<template>
  <div class="empty-state card">
    <h3>{{ title }}</h3>
    <p>{{ description }}</p>
  </div>
</template>

<script setup>
defineProps({
  title: { type: String, default: '데이터가 없습니다.' },
  description: { type: String, default: '' }
})
</script>

<style scoped>
.empty-state { border: 1px dashed var(--gray300); background: var(--gray50); padding: 24px 14px; text-align: center; }
.empty-state h3 { font-size: 0.9rem; color: var(--gray700); }
.empty-state p { margin-top: 6px; font-size: 0.82rem; color: var(--gray500); }
</style>
