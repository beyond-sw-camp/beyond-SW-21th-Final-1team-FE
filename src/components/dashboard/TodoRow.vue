<template>
  <div class="todo-row">
    <span class="todo-title">{{ title }}</span>
    <span class="todo-due" :style="{ color: color }">{{ dueLabel }}</span>
  </div>
</template>

<script setup>
defineProps({
  title: { type: String, required: true },
  dueLabel: { type: String, default: '날짜 미정' },
  color: { type: String, default: '#06B6D4' },
})
</script>

<style scoped>
.todo-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 9px 0;
  border-bottom: 1px solid var(--gray100);
  gap: 8px;
}
.todo-row:last-child { border-bottom: none; }
.todo-title {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--gray700);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.todo-due {
  font-size: 0.76rem;
  font-weight: 700;
  white-space: nowrap;
  flex-shrink: 0;
}
</style>
