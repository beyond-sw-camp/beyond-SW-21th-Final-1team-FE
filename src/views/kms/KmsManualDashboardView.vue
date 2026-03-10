<template>
  <div class="kms-manual-dashboard">
    <section class="card top">
      <div class="search-wrap">
        <input v-model="keyword" type="text" placeholder="업무 메뉴얼 검색" />
      </div>
      <div class="result">
        <p>검색 결과 {{ filteredManuals.length }}건</p>
      </div>
    </section>

    <section class="category-grid">
      <button
        v-for="category in kmsCategories"
        :key="category.key"
        class="category-card card"
        @click="goCategory(category)"
      >
        <h3>{{ category.name }}</h3>
        <p>{{ countByCategory(category.key) }}개 메뉴얼</p>
        <span class="badge" :class="{ restricted: category.restricted }">
          {{ category.restricted ? '권한 필요' : '열람 가능' }}
        </span>
      </button>
    </section>

    <section class="card list">
      <header>
        <h2>검색 미리보기</h2>
      </header>
      <table>
        <thead>
        <tr>
          <th>제목</th>
          <th>작성일</th>
          <th>작성자</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="item in filteredManuals.slice(0, 8)" :key="item.id" @click="router.push(`/kms/manuals/detail/${item.id}`)">
          <td>{{ item.title }}</td>
          <td>{{ item.createdAt }}</td>
          <td>{{ item.author }}</td>
        </tr>
        </tbody>
      </table>
    </section>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { kmsCategories } from '@/mocks/kms'
import { useKmsManualStore } from '@/store/kmsManuals'

const router = useRouter()
const manualStore = useKmsManualStore()
const keyword = ref('')
const restrictedCategoryKeys = ['finance', 'security']

const filteredManuals = computed(() => {
  const q = keyword.value.trim().toLowerCase()
  const rows = manualStore.activeManuals
  if (!q) return rows
  return rows.filter((item) => item.title.toLowerCase().includes(q) || item.summary.toLowerCase().includes(q))
})

const countByCategory = (key) => manualStore.activeManuals.filter((item) => item.category === key).length

const goCategory = (category) => {
  if (restrictedCategoryKeys.includes(category.key)) {
    alert('열람 권한이 없는 카테고리입니다.')
    return
  }
  router.push(`/kms/manuals/category/${category.key}`)
}
</script>

<style scoped>
.kms-manual-dashboard { display: flex; flex-direction: column; gap: 16px; }
.top { padding: 16px; border: 1px solid var(--gray200); display: flex; justify-content: space-between; gap: 10px; align-items: center; }
.search-wrap { flex: 1; }
input { width: 100%; border: 1px solid var(--gray300); border-radius: 10px; padding: 10px 12px; }
.result p { font-size: 0.85rem; color: var(--gray500); }
.category-grid { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 12px; }
.category-card { text-align: left; padding: 14px; border: 1px solid var(--gray200); background: #fff; }
h3 { font-size: 0.92rem; color: var(--gray800); }
.category-card p { margin-top: 6px; font-size: 0.8rem; color: var(--gray500); }
.badge { margin-top: 10px; display: inline-block; padding: 4px 8px; border-radius: 8px; font-size: 0.74rem; background: var(--accent); color: var(--primary-dark); font-weight: 700; }
.badge.restricted { background: #fef2f2; color: #b91c1c; }
.list { border: 1px solid var(--gray200); padding: 16px; }
h2 { font-size: 0.94rem; color: var(--gray800); }
table { margin-top: 10px; width: 100%; border-collapse: collapse; }
th, td { border-bottom: 1px solid var(--gray100); text-align: left; padding: 10px 8px; font-size: 0.84rem; }
th { color: var(--gray500); font-weight: 600; }
tbody tr { cursor: pointer; }
tbody tr:hover { background: var(--gray50); }
@media (max-width: 1200px) { .category-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
@media (max-width: 768px) { .category-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
</style>
