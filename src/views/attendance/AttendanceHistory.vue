<template>
  <div class="attendance-history">
    <div class="mobile-history">
      <header class="mobile-head">
        <button class="mobile-back" type="button" aria-label="뒤로가기" @click="handleBack">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
            <path d="m15 18-6-6 6-6"/>
          </svg>
        </button>
        <div>
          <h1>신청 내역</h1>
          <p>신청 내역을 확인합니다.</p>
        </div>
      </header>
    </div>

    <!-- Header Card -->
    <div class="header-card">
      <div class="icon-file-text">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
      </div>
      <div class="header-text">
        <h2 class="page-title">신청 내역 조회</h2>
        <p class="page-desc">휴가, 연장근무 등 각종 신청 내역을 확인하세요.</p>
      </div>
    </div>

    <!-- Status Summary Cards -->
    <div class="summary-row">
      <!-- Pending -->
      <div class="summary-card">
        <div class="card-content">
          <span class="card-label">결재 대기</span>
          <div class="card-value-row">
            <span class="card-value orange">{{ stats.pending }}</span>
            <span class="card-unit">건</span>
          </div>
        </div>
        <div class="card-icon-circle orange-bg">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        </div>
      </div>
      <!-- Approved -->
      <div class="summary-card">
        <div class="card-content">
          <span class="card-label">승인 완료</span>
          <div class="card-value-row">
            <span class="card-value green">{{ stats.approved }}</span>
            <span class="card-unit">건</span>
          </div>
        </div>
        <div class="card-icon-circle green-bg">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
        </div>
      </div>
      <!-- Rejected -->
      <div class="summary-card">
        <div class="card-content">
          <span class="card-label">반려</span>
          <div class="card-value-row">
            <span class="card-value red">{{ stats.rejected }}</span>
            <span class="card-unit">건</span>
          </div>
        </div>
        <div class="card-icon-circle red-bg">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#EF4444" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
        </div>
      </div>
    </div>

    <!-- List Section -->
    <div class="list-section-card">
      <div class="filter-row">
        <div class="tabs">
          <button 
            v-for="tab in tabs" 
            :key="tab" 
            class="tab" 
            :class="{ active: activeTab === tab }"
            @click="activeTab = tab"
          >
            {{ tab }}
          </button>
        </div>
        <div class="search-box">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="text" v-model="searchQuery" placeholder="신청 내역 검색" />
        </div>
      </div>

      <div class="table-wrapper">
        <table v-if="paginatedHistoryList.length" class="history-table">
          <thead>
            <tr>
              <th width="15%">신청일</th>
              <th width="10%">구분</th>
              <th width="35%">제목/내용</th>
              <th width="15%">해당 일자</th>
              <th width="15%">결재자</th>
              <th width="10%" class="text-right">상태</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in paginatedHistoryList" :key="item.id">
              <td class="date">{{ item.date }}</td>
              <td><span class="type-badge" :class="getTypeColor(item.type)">{{ item.type }}</span></td>
              <td class="title">{{ item.title }}</td>
              <td class="target-date">{{ item.targetDate }}</td>
              <td class="approver">{{ item.approver }}</td>
              <td class="text-right">
                <span 
                  class="status-badge" 
                  :class="[getStatusColor(item.status), { 'clickable': item.status === '반려' }]"
                  @click="handleStatusClick(item)"
                >
                  {{ item.status }}
                  <span v-if="item.status === '반려'" class="status-hint">사유 보기</span>
                </span>
              </td>
            </tr>
          </tbody>
        </table>
        <div v-else class="empty-state">
          조회된 신청 내역이 없습니다.
        </div>
      </div>

      <!-- Pagination -->
      <div class="pagination" v-if="totalPages > 1">
        <button class="page-arrow" :disabled="currentPage === 1" @click="goPrevPage">&lt;</button>
        <button
          v-for="page in pageNumbers"
          :key="page"
          class="page-num"
          :class="{ active: currentPage === page }"
          @click="setPage(page)"
        >
          {{ page }}
        </button>
        <button class="page-arrow" :disabled="currentPage === totalPages" @click="goNextPage">&gt;</button>
      </div>
    </div>

    <!-- Rejection Reason Modal -->
    <BaseModal v-model="showReasonModal" width="400px">
      <div class="modal-content">
        <h3 class="modal-title">반려 사유</h3>
        <p class="modal-text">{{ rejectionReason || '사유가 없습니다.' }}</p>
        <div class="modal-actions">
          <button class="btn-confirm" @click="showReasonModal = false">확인</button>
        </div>
      </div>
    </BaseModal>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { computed, onMounted, ref } from 'vue'
import { useAttendanceStore } from '@/store/attendance'
import BaseModal from '@/components/common/BaseModal.vue'

const store = useAttendanceStore()

const formatDateTime = (value) => {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return String(value).replace('T', ' ').slice(0, 16).replace(/-/g, '.')
  }
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year}.${month}.${day} ${hours}:${minutes}`
}

const formatDate = (value) => {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return String(value).slice(0, 10).replace(/-/g, '.')
  }
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}.${month}.${day}`
}

const historyList = computed(() => {
  return [...store.requestHistory]
    .map(item => ({
    id: item.id,
    rawAppliedAt: item.appliedAt,
    date: formatDateTime(item.appliedAt),
    type: item.type,
    title: item.title || `${item.type} 신청`,
    targetDate: item.targetDate ? formatDate(item.targetDate) : item.period,
    approver: item.approver || '-',
    status: mapStatus(item.status),
    rejectReason: item.rejectReason || item.rejectionReason || '',
  }))
    .sort((a, b) => new Date(b.rawAppliedAt).getTime() - new Date(a.rawAppliedAt).getTime())
})

const tabs = ['전체', '휴가', '연장', '외근/출장', '재택']
const activeTab = ref('전체')
const searchQuery = ref('')
const currentPage = ref(1)

const filteredHistoryList = computed(() => {
  let list = historyList.value

  // 1. Filter by Tab
  if (activeTab.value === '휴가') {
    list = list.filter(item => item.type === '휴가' || item.type.includes('휴가'))
  } else if (activeTab.value === '연장') {
    list = list.filter(item => item.type.includes('연장'))
  } else if (activeTab.value === '외근/출장') {
    list = list.filter(item => item.type.includes('외근') || item.type.includes('출장'))
  } else if (activeTab.value === '재택') {
    list = list.filter(item => item.type.includes('재택'))
  }

  // 2. Filter by Search
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    list = list.filter(item => 
      item.title.toLowerCase().includes(query) || 
      (item.approver && item.approver.toLowerCase().includes(query)) ||
      (item.type && item.type.toLowerCase().includes(query)) ||
      (item.status && item.status.toLowerCase().includes(query)) ||
      (item.targetDate && item.targetDate.toLowerCase().includes(query)) ||
      (item.date && item.date.toLowerCase().includes(query))
    )
  }
  
  return list
})

const pageSize = 8

const totalPages = computed(() => Math.max(1, Math.ceil(filteredHistoryList.value.length / pageSize)))

const pageNumbers = computed(() => Array.from({ length: totalPages.value }, (_, idx) => idx + 1))

const paginatedHistoryList = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredHistoryList.value.slice(start, start + pageSize)
})

const mapStatus = (status) => {
  const map = { pending: '대기', approved: '승인', rejected: '반려' }
  return map[status] || status
}

const stats = computed(() => {
  return {
    pending: store.requestCounts.pending,
    approved: store.requestCounts.approved,
    rejected: store.requestCounts.rejected,
  }
})

const getTypeColor = (type) => {
  if (type === '휴가') return 'pink'
  if (type === '연장') return 'blue'
  if (type === '외근' || type === '출장') return 'gray'
  if (type === '재택' || type === '재택근무') return 'purple'
  return 'gray'
}

const getStatusColor = (status) => {
  if (status === '대기') return 'orange'
  if (status === '승인') return 'green'
  if (status === '반려') return 'red'
  return 'gray'
}

const showReasonModal = ref(false)
const rejectionReason = ref('')

const handleStatusClick = (item) => {
  if (item.status === '반려' || item.status.includes('반려')) {
    rejectionReason.value = item.rejectReason || '사유가 없습니다.'
    showReasonModal.value = true
  }
}

const setPage = (page) => {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
}

const goPrevPage = () => {
  if (currentPage.value > 1) currentPage.value -= 1
}

const goNextPage = () => {
  if (currentPage.value < totalPages.value) currentPage.value += 1
}

const resetToFirstPage = () => {
  currentPage.value = 1
}

watch([activeTab, searchQuery], resetToFirstPage)

watch(totalPages, (nextTotalPages) => {
  if (currentPage.value > nextTotalPages) {
    currentPage.value = nextTotalPages
  }
})

onMounted(async () => {
  await Promise.all([
    store.refreshRequestHistory(),
    store.refreshRequestCounts(),
  ])
})
const router = useRouter()

const handleBack = () => {
  if (window.history.length > 1) {
    router.back()
    return
  }
  router.push('/')
}
</script>

<style scoped>
.attendance-history {
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: calc(100vh - var(--header-h) - 48px);
  overflow: hidden;
}

/* Header Card */
.header-card {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  border: 1px solid var(--gray200);
}
.icon-file-text {
  width: 48px; height: 48px;
  background: var(--gray50);
  border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  color: var(--gray600);
}
.page-title { font-size: 1.2rem; font-weight: 700; color: var(--gray900); margin-bottom: 4px; }
.page-desc { font-size: 0.9rem; color: var(--gray500); }

.mobile-history {
  display: none;
  background: #f5f8fc;
  border: 1px solid #eef2f7;
  border-radius: 18px;
  padding: 18px;
}

.mobile-head {
  display: flex;
  align-items: center;
  gap: 12px;
}

.mobile-head h1 {
  margin: 0;
  font-size: 1.2rem;
  color: var(--gray800);
}

.mobile-head p {
  margin: 6px 0 0;
  font-size: 0.85rem;
  color: var(--gray500);
}

.mobile-back{
  width:32px;height:32px;border-radius:10px;border:1px solid #e2e8f0;background:#fff;
  display:flex;align-items:center;justify-content:center;color:#475569;cursor:pointer;
  flex-shrink: 0;
}

/* Summary Cards */
.summary-row {
  display: flex;
  gap: 16px;
}
.summary-card {
  flex: 1;
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  border: 1px solid var(--gray200);
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.card-label { font-size: 0.9rem; color: var(--gray500); font-weight: 600; margin-bottom: 8px; display: block; }
.card-value-row { display: flex; align-items: baseline; gap: 4px; }
.card-value { font-size: 1.8rem; font-weight: 800; line-height: 1; }
.card-unit { font-size: 0.9rem; color: var(--gray400); font-weight: 600; }

.card-value.orange { color: #F59E0B; }
.card-value.green { color: #10B981; }
.card-value.red { color: #EF4444; }

.card-icon-circle {
  width: 44px; height: 44px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
}
.orange-bg { background: #FEF3C7; }
.green-bg { background: #D1FAE5; }
.red-bg { background: #FEE2E2; }

@media (max-width: 768px){
  .attendance-history {
    height: auto;
    overflow: visible;
  }
  .header-card,
  .summary-row,
  .list-section-card {
    display: none;
  }
  .mobile-history { display: block; }
}


/* List Section */
.list-section-card {
  flex: 1;
  background: #fff;
  border-radius: 12px;
  border: 1px solid var(--gray200);
  padding: 24px 24px 16px 24px;
  display: flex; flex-direction: column;
  min-height: 0;
}
.filter-row {
  display: flex; justify-content: space-between; margin-bottom: 24px;
}
.tabs { display: flex; gap: 8px; }
.tab {
  padding: 6px 16px; border-radius: 20px;
  border: none; background: var(--gray100); color: var(--gray500);
  font-size: 0.9rem; font-weight: 600; cursor: pointer; transition: all 0.2s;
}
.tab.active { background: var(--primary); color: #fff; }

.search-box {
  display: flex; align-items: center; gap: 8px;
  background: var(--gray50); border: 1px solid var(--gray200);
  border-radius: 6px; padding: 6px 12px; width: 240px; color: var(--gray400);
}
.search-box input { border: none; background: transparent; width: 100%; font-size: 0.9rem; outline: none; }

/* Table */
.table-wrapper {
  flex: 1;
  overflow-y: auto;
}
.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 260px;
  color: var(--gray500);
  font-size: 0.95rem;
}
.history-table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
.history-table th {
  background: var(--gray50);
  color: var(--gray600); font-weight: 600;
  padding: 12px 16px; text-align: left;
  font-size: 0.8rem;
  border-bottom: 1px solid var(--gray200); /* Optional header border */
}
.history-table td {
  padding: 18px 16px;
  border-bottom: 1px solid var(--gray100);
  color: var(--gray800);
  vertical-align: middle;
}
.text-right { text-align: right; }
.date, .target-date, .approver { color: var(--gray600); font-size: 0.9rem; }
.title { font-weight: 600; }

/* Badges */
.type-badge {
  display: inline-block; padding: 4px 10px; border-radius: 4px;
  font-size: 0.8rem; font-weight: 700;
}
.type-badge.pink { background: #FCE7F3; color: #EC4899; }
.type-badge.blue { background: #DBEAFE; color: #3B82F6; }
.type-badge.gray { background: #F3F4F6; color: #4B5563; }
.type-badge.purple { background: #F3E8FF; color: #A855F7; }

.status-badge {
  display: inline-flex; align-items: center; gap: 4px;
  padding: 4px 10px; border-radius: 20px;
  font-size: 0.8rem; font-weight: 600;
  border: 1px solid transparent;
}
/* For status, we will use outlined style to match image closely or filled?
   Image shows outline style with icon. Let's simplify first.
*/
.status-badge.orange { background: #FFFBEB; color: #D97706; border-color: #FCD34D; }
.status-badge.green { background: #ECFDF5; color: #059669; border-color: #6EE7B7; }
.status-badge.red { background: #FEF2F2; color: #DC2626; border-color: #FCA5A5; }
.status-badge.clickable { cursor: pointer; text-decoration: underline; }

/* Modal Styles */
.modal-title { font-size: 1.1rem; font-weight: 700; color: var(--gray900); margin-bottom: 12px; }
.modal-text { font-size: 0.95rem; color: var(--gray700); line-height: 1.5; margin-bottom: 24px; }
.modal-actions { display: flex; justify-content: flex-end; }
.btn-confirm {
  background: var(--primary); color: #fff; border: none; padding: 8px 20px;
  border-radius: 6px; font-weight: 600; cursor: pointer; transition: opacity 0.2s;
}
.btn-confirm:hover { opacity: 0.9; }


/* Pagination */
.pagination {
  display: flex; justify-content: center; align-items: center; gap: 8px;
  margin-top: 16px;
}
.page-arrow, .page-num {
  width: 32px; height: 32px; border-radius: 4px; border: none;
  background: transparent; color: var(--gray500); font-size: 0.9rem; font-weight: 500;
  cursor: pointer; display: flex; align-items: center; justify-content: center;
  transition: all 0.2s;
}
.page-arrow:hover, .page-num:hover { background: var(--gray50); color: var(--gray800); }
.page-num.active { background: var(--primary); color: #fff; }
.page-arrow:disabled { opacity: 0.3; cursor: not-allowed; }
</style>
