<template>
  <div class="notice-page">
    <div class="breadcrumb">메인 / 공지사항</div>

    <section class="card page-head fade-up">
      <div class="title-wrap">
        <h1>공지사항</h1>
      </div>

      <div class="search-row">
        <select v-model="selectedType" class="type-select">
          <option v-for="type in NOTICE_TYPE_OPTIONS" :key="type.value" :value="type.value">
            {{ type.label }}
          </option>
        </select>
        <input v-model="keyword" type="text" class="keyword-input" placeholder="공지사항 제목 검색" />
      </div>
    </section>

    <section class="card list-card fade-up delay-1">
      <div class="list-head">
        <div>제목</div>
        <div>생성일자</div>
        <div>작성 부서(작성자)</div>
        <div>공지사항 유형</div>
      </div>

      <div v-if="loading" class="empty">공지사항을 불러오는 중입니다.</div>
      <div v-else-if="filteredNotices.length === 0" class="empty">검색 결과가 없습니다.</div>

      <div v-for="notice in pagedNotices" :key="notice.id" class="list-row">
        <button class="title-btn" type="button" @click="openDetailModal(notice)">
          <span v-if="notice.isPinned" class="pin-badge" aria-label="고정">
            <span class="pin-icon" aria-hidden="true"></span>
          </span>
          {{ notice.title }}
        </button>
        <div class="font-num">{{ notice.createdAt }}</div>
        <div>{{ notice.department }} ({{ notice.author }})</div>
        <div><span class="type-chip">{{ notice.typeLabel }}</span></div>
      </div>

      <div v-if="filteredNotices.length > 0" class="pagination">
        <button type="button" class="page-btn" :disabled="currentPage === 1" @click="currentPage--">이전</button>
        <span class="page-info font-num">{{ currentPage }} / {{ totalPages }}</span>
        <button type="button" class="page-btn" :disabled="currentPage === totalPages" @click="currentPage++">다음</button>
      </div>
    </section>

    <NoticeDetailModal :open="showDetailModal" :notice="selectedNotice" @close="closeDetailModal" />
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import NoticeDetailModal from '@/components/notices/NoticeDetailModal.vue'
import { getNotices } from '@/api/hr'
import { NOTICE_TYPE_OPTIONS, normalizeNotice, sortNoticesByDateDesc } from '@/utils/notice'

const PAGE_SIZE = 10
const keyword = ref('')
const selectedType = ref('ALL')
const currentPage = ref(1)
const showDetailModal = ref(false)
const selectedNotice = ref(null)
const allNotices = ref([])
const loading = ref(false)

const resolvePositive = (value, fallback = 1) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

const fetchAllNotices = async () => {
  loading.value = true
  try {
    const firstPage = await getNotices({ page: 1 })
    const firstContent = Array.isArray(firstPage?.content) ? firstPage.content : []
    const total = resolvePositive(firstPage?.totalPages, 1)
    const merged = [...firstContent]

    if (total > 1) {
      for (let page = 2; page <= total; page += 1) {
        const pageData = await getNotices({ page })
        const content = Array.isArray(pageData?.content) ? pageData.content : []
        merged.push(...content)
      }
    }

    allNotices.value = sortNoticesByDateDesc(merged.map((row) => normalizeNotice(row)))
  } catch (error) {
    allNotices.value = []
    alert(error?.response?.data?.error?.message || '공지사항 조회에 실패했습니다.')
  } finally {
    loading.value = false
  }
}

const filteredNotices = computed(() => {
  const q = keyword.value.trim().toLowerCase()
  return allNotices.value.filter((notice) => {
    const typeMatched = selectedType.value === 'ALL' ? true : notice.noticeType === selectedType.value
    const keywordMatched = q ? String(notice.title || '').toLowerCase().includes(q) : true
    return typeMatched && keywordMatched
  })
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredNotices.value.length / PAGE_SIZE)))

const pagedNotices = computed(() => {
  const start = (currentPage.value - 1) * PAGE_SIZE
  return filteredNotices.value.slice(start, start + PAGE_SIZE)
})

const openDetailModal = (notice) => {
  selectedNotice.value = notice
  showDetailModal.value = true
}

const closeDetailModal = () => {
  showDetailModal.value = false
  selectedNotice.value = null
}

watch([keyword, selectedType], async () => {
  currentPage.value = 1
})

watch(totalPages, (nextPageCount) => {
  if (currentPage.value > nextPageCount) {
    currentPage.value = nextPageCount
  }
})

onMounted(async () => {
  await fetchAllNotices()
})
</script>

<style scoped>
.notice-page{max-width:1200px}
.breadcrumb{font-size:.78rem;color:var(--gray400);margin-bottom:4px}
.page-head{margin-top:12px;margin-bottom:12px;padding:16px}
.title-wrap h1{margin:0;font-size:1.5rem;color:var(--gray800)}
.search-row{margin-top:12px;display:flex;gap:8px}
.type-select,.keyword-input{
  height:34px;border:1px solid var(--gray200);border-radius:10px;background:#fff;
  color:var(--gray700);font-size:.85rem;padding:0 10px;
}
.keyword-input{width:260px}
.list-card{overflow:hidden}
.list-head,.list-row{
  display:grid;grid-template-columns:minmax(0,1.8fr) .7fr 1fr .8fr;
  align-items:center;gap:8px;padding:12px 16px;
}
.list-head{background:var(--gray50);border-bottom:1px solid var(--gray200);font-size:.8rem;font-weight:700;color:var(--gray500)}
.list-row{border-bottom:1px solid var(--gray100)}
.list-row:last-child{border-bottom:none}
.title-btn{
  border:none;background:transparent;text-align:left;font-size:.9rem;color:var(--gray700);font-weight:600;
  display:flex;align-items:center;gap:8px;
  white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
}
.title-btn:hover{color:var(--primary-dark);text-decoration:underline}
.pin-badge{
  flex-shrink:0;
  display:inline-flex;
  align-items:center;
  justify-content:center;
  height:20px;
  padding:0 7px;
  border-radius:999px;
  background:#fff7ed;
  color:#9a3412;
  border:1px solid #fdba74;
  font-size:0.72rem;
  font-weight:700;
}
.pin-icon{
  width:10px;
  height:10px;
  background:currentColor;
  clip-path:polygon(50% 0, 86% 14%, 86% 44%, 58% 44%, 58% 100%, 42% 100%, 42% 44%, 14% 44%, 14% 14%);
}
.type-chip{
  display:inline-flex;align-items:center;justify-content:center;height:24px;padding:0 10px;
  border-radius:999px;background:#E0F2FE;color:#075985;font-size:.76rem;font-weight:700;
}
.empty{padding:48px 16px;text-align:center;color:var(--gray400);font-size:.9rem}
.pagination{
  display:flex;align-items:center;justify-content:center;gap:10px;
  padding:14px 16px;border-top:1px solid var(--gray100);
}
.page-btn{
  height:30px;padding:0 12px;border:1px solid var(--gray200);border-radius:8px;
  background:#fff;color:var(--gray600);font-size:.8rem;font-weight:600;
}
.page-btn:hover:not(:disabled){background:var(--gray50)}
.page-btn:disabled{opacity:.45;cursor:default}
.page-info{font-size:.82rem;color:var(--gray500)}
</style>
