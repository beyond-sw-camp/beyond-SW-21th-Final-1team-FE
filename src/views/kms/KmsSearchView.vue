<template>
  <div class="kms-search">
    <section class="card head">
      <h1>KMS 통합 검색 결과</h1>
      <p>업무 메뉴얼/회의록을 통합해서 검색합니다.</p>
    </section>

    <section class="card filters">
      <input v-model.trim="keyword" type="text" placeholder="제목/내용/작성자 검색" />
      <select v-model="docType">
        <option value="all">전체 유형</option>
        <option value="manual">업무 메뉴얼</option>
        <option value="archive">회의록/아카이브</option>
      </select>
      <input v-model="authorKeyword" type="text" placeholder="작성자" />
      <input v-model="fromDate" type="date" />
      <input v-model="toDate" type="date" />
    </section>

    <section class="card results">
      <header>
        <h2>검색 결과</h2>
        <p>{{ rows.length }}건</p>
      </header>

      <KmsEmptyState
        v-if="rows.length === 0"
        title="해당 문서를 찾을 수 없습니다"
        description="검색어 또는 필터를 다시 설정해 주세요."
      />

      <div v-else class="card-grid">
        <article v-for="row in rows" :key="`${row.type}-${row.id}`" class="doc-card">
          <span class="type">{{ row.type === 'manual' ? '업무 메뉴얼' : '회의록/아카이브' }}</span>
          <button type="button" class="title" @click="goDetail(row)">{{ row.title }}</button>
          <p class="meta">{{ row.author }} · {{ row.category }} · {{ row.date }}</p>
          <p class="excerpt">{{ row.summary }}</p>
        </article>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import KmsEmptyState from '@/components/kms/KmsEmptyState.vue'
import { AUTH_KEYS } from '@/utils/auth'
import { useKmsManualStore } from '@/store/kmsManuals'
import { canReadManual } from '@/mocks/kms'
import { canReadArchiveDoc, resolveCurrentUserOrgContext, useKmsArchiveStore } from '@/store/kmsArchive'

const router = useRouter()
const manualStore = useKmsManualStore()
const archiveStore = useKmsArchiveStore()

const keyword = ref('')
const docType = ref('all')
const authorKeyword = ref('')
const fromDate = ref('')
const toDate = ref('')

const currentUserId = computed(() => sessionStorage.getItem(AUTH_KEYS.userId) || '')
const currentUserRole = computed(() => sessionStorage.getItem(AUTH_KEYS.role) || 'user')
const userContext = computed(() => resolveCurrentUserOrgContext(currentUserId.value))

const manualRows = computed(() => manualStore.activeManuals
  .filter((item) => canReadManual(item, currentUserRole.value))
  .map((item) => ({
    type: 'manual',
    id: item.id,
    title: item.title,
    summary: item.summary,
    body: item.body,
    author: item.author,
    category: item.category,
    date: item.createdAt
  })))

const archiveRows = computed(() => archiveStore.docs.value
  .filter((doc) => canReadArchiveDoc(doc, userContext.value))
  .map((doc) => ({
    type: 'archive',
    id: doc.id,
    title: doc.title,
    summary: doc.summary,
    body: doc.body,
    author: doc.owner,
    category: doc.category,
    date: doc.createdAt
  })))

const allRows = computed(() => [...manualRows.value, ...archiveRows.value])

const isInRange = (dateText) => {
  if (!fromDate.value && !toDate.value) return true
  const target = new Date(dateText).getTime()
  if (Number.isNaN(target)) return false
  if (fromDate.value && target < new Date(fromDate.value).getTime()) return false
  if (toDate.value && target > new Date(toDate.value).getTime()) return false
  return true
}

const rows = computed(() => {
  const q = keyword.value.toLowerCase()
  const authorQ = authorKeyword.value.toLowerCase()
  return allRows.value.filter((row) => {
    if (docType.value !== 'all' && row.type !== docType.value) return false
    if (!isInRange(row.date)) return false
    if (authorQ && !row.author.toLowerCase().includes(authorQ)) return false
    if (!q) return true
    const text = `${row.title} ${row.summary} ${row.body} ${row.author} ${row.category}`.toLowerCase()
    return text.includes(q)
  })
})

const goDetail = (row) => {
  if (row.type === 'manual') {
    router.push(`/kms/manuals/detail/${row.id}`)
    return
  }
  router.push(`/kms/archive/${row.id}`)
}
</script>

<style scoped>
.kms-search { display: flex; flex-direction: column; gap: 16px; }
.head, .filters, .results { border: 1px solid var(--gray200); padding: 18px; }
.head h1 { font-size: 1.14rem; color: var(--gray800); }
.head p { margin-top: 6px; color: var(--gray500); font-size: 0.84rem; }
.filters { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr 1fr; gap: 10px; }
.filters input, .filters select { border: 1px solid var(--gray300); border-radius: 10px; padding: 10px 12px; }
.results header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
.results h2 { font-size: 0.92rem; color: var(--gray800); }
.results p { color: var(--gray500); font-size: 0.8rem; }
.card-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
.doc-card { border: 1px solid var(--gray100); border-radius: 10px; padding: 12px; background: #fff; display: flex; flex-direction: column; gap: 6px; }
.type { width: fit-content; border-radius: 999px; border: 1px solid var(--gray200); background: var(--gray50); padding: 3px 8px; font-size: 0.72rem; color: var(--gray600); }
.title { border: none; background: transparent; text-align: left; color: var(--gray800); font-weight: 700; font-size: 0.9rem; padding: 0; }
.title:hover { color: var(--primary-dark); }
.meta { margin: 0; font-size: 0.76rem; color: var(--gray500); }
.excerpt { margin: 0; color: var(--gray600); font-size: 0.82rem; line-height: 1.6; min-height: 38px; }
@media (max-width: 1100px) {
  .filters { grid-template-columns: 1fr; }
  .card-grid { grid-template-columns: 1fr; }
}
</style>
