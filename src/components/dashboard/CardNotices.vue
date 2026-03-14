<template>
  <div class="card fade-up delay-3 notices-card">
    <div class="card-header">
      <h3>공지사항</h3>
      <button class="more-btn" type="button" @click="goList">더보기</button>
    </div>
    <div class="card-body card-body-fill">
      <div v-if="loading" class="empty-row">공지사항을 불러오는 중입니다.</div>
      <div v-else-if="notices.length === 0" class="empty-row">공지사항이 없습니다.</div>
      <div v-for="item in notices" :key="item.id" class="notice-item">
        <div class="notice-dot"></div>
        <button class="notice-title" type="button" @click="openDetail(item)">
          <span v-if="item.isPinned" class="pin-badge" aria-label="고정">
            <span class="pin-icon" aria-hidden="true"></span>
          </span>
          {{ item.title }}
        </button>
        <div class="notice-who">{{ item.department }} ({{ item.author }})</div>
        <div class="notice-date font-num">{{ item.createdAt }}</div>
      </div>
    </div>
  </div>

  <NoticeDetailModal :open="showDetailModal" :notice="selectedNotice" @close="closeDetail" />
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import NoticeDetailModal from '@/components/notices/NoticeDetailModal.vue'
import { getRecentNotices } from '@/api/hr'
import { normalizeNotice, sortNoticesByDateDesc } from '@/utils/notice'

const router = useRouter()
const notices = ref([])
const loading = ref(false)
const showDetailModal = ref(false)
const selectedNotice = ref(null)

const loadNotices = async () => {
  loading.value = true
  try {
    const rows = await getRecentNotices(8)
    const normalized = (Array.isArray(rows) ? rows : []).map((row) => normalizeNotice(row))
    notices.value = sortNoticesByDateDesc(normalized).slice(0, 8)
  } catch (error) {
    notices.value = []
    alert(error?.response?.data?.error?.message || '공지사항 조회에 실패했습니다.')
  } finally {
    loading.value = false
  }
}

const goList = () => router.push('/notices')
const openDetail = (notice) => {
  selectedNotice.value = notice
  showDetailModal.value = true
}
const closeDetail = () => {
  showDetailModal.value = false
  selectedNotice.value = null
}

onMounted(() => {
  loadNotices()
})
</script>

<style scoped>
.notices-card{height:100%;display:flex;flex-direction:column}
.card-body-fill{flex:1}
.empty-row{
  display:flex;
  align-items:center;
  justify-content:center;
  min-height:120px;
  color:var(--gray400);
  font-size:0.85rem;
}
.more-btn{
  border:none;background:transparent;color:var(--gray500);
  font-size:.8rem;font-weight:600;padding:4px 8px;border-radius:8px;
}
.more-btn:hover{background:var(--gray100);color:var(--gray700)}
.notice-item{
  display:flex;align-items:center;padding:13px 0;border-bottom:1px solid var(--gray100);gap:7px;
}
.notice-item:last-child{border-bottom:none}
.notice-dot{width:6px;height:6px;border-radius:50%;flex-shrink:0}
.notice-dot{background:var(--blue)}
.notice-title{
  flex:1;border:none;background:transparent;text-align:left;
  font-size:0.88rem;color:var(--gray700);font-weight:500;
  display:flex;align-items:center;gap:6px;
  overflow:hidden;text-overflow:ellipsis;white-space:nowrap
}
.notice-title:hover{color:var(--primary-dark);text-decoration:underline}
.pin-badge{
  flex-shrink:0;
  display:inline-flex;
  align-items:center;
  justify-content:center;
  height:18px;
  padding:0 6px;
  border-radius:999px;
  background:#fff7ed;
  color:#9a3412;
  border:1px solid #fdba74;
  font-size:0.68rem;
  font-weight:700;
}
.pin-icon{
  width:10px;
  height:10px;
  background:currentColor;
  clip-path:polygon(50% 0, 86% 14%, 86% 44%, 58% 44%, 58% 100%, 42% 100%, 42% 44%, 14% 44%, 14% 14%);
}
.notice-who,.notice-date{font-size:0.75rem;color:var(--gray400);white-space:nowrap}
</style>
