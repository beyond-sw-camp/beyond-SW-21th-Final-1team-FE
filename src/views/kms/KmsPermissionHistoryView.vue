<template>
  <div class="permission-history">
    <section class="card head">
      <h1>권한 변경 이력</h1>
      <p>읽기 권한이 언제/누가/어떻게 바뀌었는지 타임라인으로 확인합니다.</p>
    </section>

    <section class="card filters">
      <select v-model="moduleFilter">
        <option value="all">전체</option>
        <option value="manual">업무 메뉴얼</option>
        <option value="archive">아카이브</option>
      </select>
      <input v-model.trim="keyword" type="text" placeholder="문서명/변경자 검색" />
    </section>

    <section class="card timeline-wrap">
      <KmsEmptyState v-if="rows.length === 0" title="권한 변경 이력이 없습니다." />
      <ul v-else class="timeline">
        <li v-for="row in rows" :key="row.id">
          <div class="point"></div>
          <article>
            <h3>[{{ row.module === 'manual' ? '업무 메뉴얼' : '아카이브' }}] {{ row.title }}</h3>
            <p class="meta">{{ row.changedAt }} · {{ row.actor }}</p>
            <p class="change">{{ row.change }}</p>
            <p class="diff">변경 전: {{ row.before }}</p>
            <p class="diff">변경 후: {{ row.after }}</p>
          </article>
        </li>
      </ul>
    </section>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import KmsEmptyState from '@/components/kms/KmsEmptyState.vue'
import { permissionChangeTimeline } from '@/mocks/kms'

const moduleFilter = ref('all')
const keyword = ref('')

const rows = computed(() => {
  const q = keyword.value.toLowerCase()
  return permissionChangeTimeline.filter((item) => {
    const moduleMatch = moduleFilter.value === 'all' || item.module === moduleFilter.value
    if (!moduleMatch) return false
    if (!q) return true
    const text = `${item.title} ${item.actor} ${item.change}`.toLowerCase()
    return text.includes(q)
  })
})
</script>

<style scoped>
.permission-history { display: flex; flex-direction: column; gap: 16px; }
.head, .filters, .timeline-wrap { border: 1px solid var(--gray200); padding: 18px; }
.head h1 { font-size: 1.14rem; color: var(--gray800); }
.head p { margin-top: 6px; color: var(--gray500); font-size: 0.84rem; }
.filters { display: grid; grid-template-columns: 180px 1fr; gap: 10px; }
.filters select, .filters input { border: 1px solid var(--gray300); border-radius: 10px; padding: 10px 12px; }
.timeline { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 10px; }
.timeline li { display: grid; grid-template-columns: 14px 1fr; gap: 8px; align-items: flex-start; }
.point { width: 10px; height: 10px; border-radius: 50%; background: var(--primary); margin-top: 8px; }
article { border: 1px solid var(--gray100); border-radius: 10px; padding: 10px; background: #fff; }
article h3 { font-size: 0.88rem; color: var(--gray800); }
.meta { margin-top: 3px; color: var(--gray500); font-size: 0.76rem; }
.change { margin-top: 8px; color: var(--gray700); font-size: 0.82rem; }
.diff { margin-top: 4px; color: var(--gray500); font-size: 0.78rem; }
@media (max-width: 900px) {
  .filters { grid-template-columns: 1fr; }
}
</style>
