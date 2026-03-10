<template>
  <section class="denied card">
    <h2>{{ title }}</h2>
    <p>{{ description }}</p>
  </section>
</template>

<script setup>
defineProps({
  title: { type: String, default: '열람 권한이 없습니다' },
  description: { type: String, default: '권한이 없는 문서/화면은 확인할 수 없습니다.' }
})
</script>

<style scoped>
.denied { border: 1px solid #fecaca; background: #fff7f7; padding: 18px; }
.denied h2 { font-size: 0.98rem; color: #b91c1c; }
.denied p { margin-top: 6px; color: #9f1239; font-size: 0.84rem; }
</style>
