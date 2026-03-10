<template>
  <div class="manual-category">
    <section class="card header">
      <h1>{{ categoryName }} 메뉴얼</h1>
      <p>작성일 기준 내림차순 정렬</p>
    </section>

    <section class="card table-wrap">
      <table>
        <thead>
        <tr>
          <th>제목</th>
          <th>작성일</th>
          <th>작성자</th>
          <th>버전</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="row in rows" :key="row.id" @click="router.push(`/kms/manuals/detail/${row.id}`)">
          <td>{{ row.title }}</td>
          <td>{{ row.createdAt }}</td>
          <td>{{ row.author }}</td>
          <td>{{ row.version }}</td>
        </tr>
        </tbody>
      </table>
    </section>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { kmsCategories, sortByDateDesc } from '@/mocks/kms'
import { useKmsManualStore } from '@/store/kmsManuals'

const route = useRoute()
const router = useRouter()
const manualStore = useKmsManualStore()

const categoryName = computed(() => {
  const category = kmsCategories.find((item) => item.key === route.params.categoryKey)
  return category?.name || '전체'
})

const rows = computed(() =>
  sortByDateDesc(manualStore.activeManuals.filter((item) => item.category === route.params.categoryKey))
)
</script>

<style scoped>
.manual-category { display: flex; flex-direction: column; gap: 16px; }
.header { padding: 18px; border: 1px solid var(--gray200); }
h1 { font-size: 1.15rem; color: var(--gray800); }
p { margin-top: 6px; color: var(--gray500); font-size: 0.84rem; }
.table-wrap { padding: 16px; border: 1px solid var(--gray200); }
table { width: 100%; border-collapse: collapse; }
th, td { border-bottom: 1px solid var(--gray100); text-align: left; padding: 12px 10px; font-size: 0.85rem; }
th { color: var(--gray500); font-weight: 600; }
tbody tr { cursor: pointer; }
tbody tr:hover { background: var(--gray50); }
</style>
