<template>
  <div class="attendance-record">
    <div class="mobile-record">
      <!-- 모바일 헤더 -->
      <header class="mobile-head">
        <button class="mobile-back" type="button" aria-label="뒤로가기" @click="handleBack">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
            <path d="m15 18-6-6 6-6"/>
          </svg>
        </button>
        <div class="mobile-head-text">
          <h1>근태 기록</h1>
          <p>이번 달 근태 현황을 확인합니다.</p>
        </div>
      </header>

      <div class="m-stats-row-card">
        <div class="m-stat-row-item">
          <div class="icon-box blue-bg">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          </div>
          <div class="m-stat-row-text">
            <span class="m-row-num">{{ monthlyStats.normalCount }}</span>
            <span class="m-row-label">정상 출근</span>
          </div>
        </div>
        <div class="m-stat-row-item">
          <div class="icon-box orange-bg">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F97316" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          </div>
          <div class="m-stat-row-text">
            <span class="m-row-num">{{ monthlyStats.lateCount }}</span>
            <span class="m-row-label">지각/조퇴</span>
          </div>
        </div>
        <div class="m-stat-row-item">
          <div class="icon-box purple-bg">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          </div>
          <div class="m-stat-row-text">
            <span class="m-row-num">{{ monthlyStats.absentCount }}</span>
            <span class="m-row-label">결근</span>
          </div>
        </div>
        <div class="m-stat-row-item">
          <div class="icon-box red-bg">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--red)" stroke-width="2"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>
          </div>
          <div class="m-stat-row-text">
            <span class="m-row-num">{{ monthlyStats.leaveDays }}</span>
            <span class="m-row-label">휴가 사용</span>
          </div>
        </div>
      </div>

      <!-- 월 선택 (이후 버전 스타일) -->
      <div class="m-month-bar">
        <button class="m-month-btn" @click="goPrevMonth" aria-label="이전 달">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <button type="button" class="m-month-trigger" aria-label="조회 월 선택" @click="openMonthPicker">
          <span class="m-month-label">{{ headerMonthLabel }}</span>
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="m6 9 6 6 6-6"/>
          </svg>
        </button>
        <button class="m-month-btn" @click="goNextMonth" aria-label="다음 달">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m9 18 6-6-6-6"/></svg>
        </button>
        <input
          ref="mobileMonthInput"
          v-model="selectedMonthValue"
          class="m-month-input-hidden"
          type="month"
          aria-hidden="true"
          tabindex="-1"
        />
      </div>

      <!-- 필터 탭 + 검색 -->
      <div class="m-filter-area">
        <div class="m-tabs">
          <button
            v-for="tab in tabs" :key="tab.value"
            class="m-tab" :class="{ active: activeTab === tab.value }"
            @click="activeTab = tab.value"
          >{{ tab.label }}</button>
        </div>
        <div class="m-search">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input v-model="searchQuery" type="text" placeholder="검색..." />
        </div>
      </div>

      <!-- 기록 카드 목록 -->
      <div class="m-record-list">
        <template v-if="paginatedRecords.length">
          <div v-for="(row, idx) in paginatedRecords" :key="idx" class="m-record-card">
            <div class="m-rc-left">
              <span class="m-rc-date">{{ row.date.slice(5) }}</span>
              <span class="m-rc-day">{{ getDayName(row.date) }}</span>
            </div>
            <div class="m-rc-center">
              <div class="m-rc-times">
                <span class="m-rc-time-item">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                  {{ row.checkIn || '--:--' }}
                </span>
                <span class="m-rc-sep">→</span>
                <span class="m-rc-time-item">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                  {{ row.checkOut || '--:--' }}
                </span>
              </div>
              <span class="m-status-tag" :class="row.status">{{ row.statusDescription }}</span>
            </div>
            <div class="m-rc-right">
              <span class="m-rc-hours">{{ row.workHours }}</span>
              <span class="m-rc-hours-label">근무시간</span>
            </div>
          </div>
        </template>
        <div v-else class="m-empty">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.3"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          <p>조회된 근태 기록이 없습니다.</p>
        </div>
      </div>

      <!-- 페이지네이션 -->
      <div v-if="totalPages > 1" class="m-pagination">
        <button class="m-page-btn" :disabled="currentPage === 1" @click="goPrevPage">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <button v-for="page in pageNumbers" :key="page" class="m-page-num" :class="{ active: currentPage === page }" @click="setPage(page)">{{ page }}</button>
        <button class="m-page-btn" :disabled="currentPage === totalPages" @click="goNextPage">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m9 18 6-6-6-6"/></svg>
        </button>
      </div>
    </div>

    <!-- Header: Monthly Stats -->
    <div class="record-header-card">
      <div class="header-top">
        <h2 class="page-title">이번 달 근태 현황</h2>
        <span class="date-info">{{ headerMonthLabel }} 기준</span>
      </div>
      
      <div class="stats-row">
        <!-- Normal -->
        <div class="stat-item">
          <div class="icon-box blue-bg">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          </div>
          <div class="stat-text">
            <span class="num">{{ monthlyStats.normalCount }}</span>
            <span class="label">정상 출근</span>
          </div>
        </div>
        <!-- Late/Early -->
        <div class="stat-item">
          <div class="icon-box orange-bg">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F97316" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          </div>
          <div class="stat-text">
            <span class="num">{{ monthlyStats.lateCount }}</span>
            <span class="label">지각/조퇴</span>
          </div>
        </div>
        <!-- Remote/Work -->
        <div class="stat-item">
          <div class="icon-box purple-bg">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          </div>
          <div class="stat-text">
            <span class="num">{{ monthlyStats.absentCount }}</span>
            <span class="label">결근</span>
          </div>
        </div>
        <!-- Leave -->
        <div class="stat-item">
          <div class="icon-box red-bg">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--red)" stroke-width="2"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>
          </div>
          <div class="stat-text">
            <span class="num">{{ monthlyStats.leaveDays }}</span>
            <span class="label">휴가 사용</span>
          </div>
        </div>
      </div>
    </div>

    <div class="action-bar-card">
      <div class="action-left">
        <div class="icon-calendar-rect">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        </div>
        <div class="action-text">
          <h3 class="action-title">출퇴근 기록 조회</h3>
          <p class="action-desc">나의 근태 기록을 상세하게 확인하세요.</p>
        </div>
      </div>
      <div class="action-right">
        <div class="month-selector">
          <button class="btn-icon" @click="goPrevMonth" aria-label="이전 달">&lt;</button>
          <input
            v-model="selectedMonthValue"
            class="month-input"
            type="month"
            aria-label="조회 월 선택"
          />
          <button class="btn-icon" @click="goNextMonth" aria-label="다음 달">&gt;</button>
        </div>
      </div>
    </div>

    <div class="list-section-card">
      <div class="table-wrapper">
        <table v-if="paginatedRecords.length" class="record-table">
          <thead>
            <tr>
              <th>날짜</th>
              <th>출근 시간</th>
              <th>퇴근 시간</th>
              <th>상태</th>
              <th class="text-right col-work-hours">총 근무시간</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, idx) in paginatedRecords" :key="idx">
              <td>{{ row.date }} <span class="weekday">({{ getDayName(row.date) }})</span></td>
              <td>{{ row.checkIn || '-' }}</td>
              <td>{{ row.checkOut || '-' }}</td>
              <td><span class="status-tag" :class="row.status">{{ row.statusDescription }}</span></td>
              <td class="text-right font-bold col-work-hours">{{ row.workHours }}</td>
            </tr>
          </tbody>
        </table>
        <div v-else class="empty-state">
          조회된 근태 기록이 없습니다.
        </div>
      </div>

      <!-- Pagination -->
      <div class="pagination">
        <button class="page-arrow" :disabled="currentPage === 1" @click="goPrevPage">&lt;</button>
        <button
          v-for="page in pageNumbers"
          :key="page"
          class="page-num"
          :class="{ active: currentPage === page }"
          :disabled="page > totalPages"
          @click="setPage(page)"
        >
          {{ page }}
        </button>
        <button class="page-arrow" :disabled="currentPage === totalPages" @click="goNextPage">&gt;</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { safeBack } from '@/utils/navigation'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useAttendanceStore } from '@/store/attendance'

const dayNames = ['일', '월', '화', '수', '목', '금', '토']
const MOBILE_BREAKPOINT = 768
const getDayName = (dateText) => dayNames[new Date(dateText).getDay()]

const store = useAttendanceStore()
const { dailyAttendance, monthlySummary } = storeToRefs(store)

const tabs = [
  { value: 'all', label: '전체' },
  { value: 'normal', label: '정상' },
  { value: 'tardy', label: '지각' },
  { value: 'early_leave', label: '조퇴' },
  { value: 'absent', label: '결근' },
  { value: 'vacation', label: '휴가' }
]
const selectedMonth = ref({ year: new Date().getFullYear(), month: new Date().getMonth() + 1 })
const activeTab = ref('all')
const searchQuery = ref('')
const currentPage = ref(1)
const isMobileViewport = ref(false)
const mobileMonthInput = ref(null)

const selectorMonthLabel = computed(() => {
  const month = String(selectedMonth.value.month).padStart(2, '0')
  return `${selectedMonth.value.year}.${month}`
})

const selectedMonthValue = computed({
  get: () => `${selectedMonth.value.year}-${String(selectedMonth.value.month).padStart(2, '0')}`,
  set: (value) => {
    if (!value) return
    const [year, month] = value.split('-').map(Number)
    if (!year || !month) return
    selectedMonth.value = { year, month }
  },
})

const headerMonthLabel = computed(() => `${selectedMonth.value.year}년 ${selectedMonth.value.month}월`)

const monthlyStats = computed(() => {
  return {
    normalCount: monthlySummary.value.normalCount,
    lateCount: monthlySummary.value.tardyCount + monthlySummary.value.earlyLeaveCount,
    absentCount: monthlySummary.value.absentCount,
    leaveDays: monthlySummary.value.vacationCount,
  }
})

const displayedRecords = computed(() => {
  if (activeTab.value === 'all') return dailyAttendance.value
  return dailyAttendance.value.filter((record) => record.status === activeTab.value)
})

const filteredRecords = computed(() => {
  const keyword = searchQuery.value.trim().toLowerCase()
  if (!keyword) return displayedRecords.value

  return displayedRecords.value.filter((record) => {
    const searchTargets = [
      record.date,
      record.checkIn,
      record.checkOut,
      record.statusDescription,
      record.memo,
      record.workHours
    ]
    return searchTargets.some((target) => String(target).toLowerCase().includes(keyword))
  })
})

const pageSize = computed(() => (isMobileViewport.value ? 5 : 10))

const totalPages = computed(() => Math.max(1, Math.ceil(filteredRecords.value.length / pageSize.value)))

const pageNumbers = computed(() => Array.from({ length: totalPages.value }, (_, idx) => idx + 1))

const paginatedRecords = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredRecords.value.slice(start, start + pageSize.value)
})

watch([activeTab, searchQuery, () => selectedMonth.value.year, () => selectedMonth.value.month], () => {
  currentPage.value = 1
})

watch(totalPages, (nextTotal) => {
  if (currentPage.value > nextTotal) currentPage.value = nextTotal
})

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

const goPrevMonth = () => {
  if (selectedMonth.value.month === 1) {
    selectedMonth.value.year -= 1
    selectedMonth.value.month = 12
    return
  }
  selectedMonth.value.month -= 1
}

const goNextMonth = () => {
  if (selectedMonth.value.month === 12) {
    selectedMonth.value.year += 1
    selectedMonth.value.month = 1
    return
  }
  selectedMonth.value.month += 1
}

const openMonthPicker = () => {
  if (!mobileMonthInput.value) return
  if (typeof mobileMonthInput.value.showPicker === 'function') {
    mobileMonthInput.value.showPicker()
    return
  }
  mobileMonthInput.value.focus()
  mobileMonthInput.value.click()
}

const fetchDetails = async () => {
  await Promise.all([
    store.fetchMonthlyRecords(selectedMonth.value.year, selectedMonth.value.month),
    store.fetchMonthlySummary(selectedMonth.value.year, selectedMonth.value.month),
  ])
}

const syncViewport = () => {
  if (typeof window === 'undefined') return
  isMobileViewport.value = window.innerWidth <= MOBILE_BREAKPOINT
}

onMounted(() => {
  syncViewport()
  fetchDetails()
  window.addEventListener('resize', syncViewport)
})

onBeforeUnmount(() => {
  if (typeof window === 'undefined') return
  window.removeEventListener('resize', syncViewport)
})

watch([() => selectedMonth.value.year, () => selectedMonth.value.month], fetchDetails)
const router = useRouter()

const handleBack = () => {
  safeBack(router, '/')
}
</script>

<style scoped>
.attendance-record {
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: calc(100vh - var(--header-h) - 48px);
  overflow: hidden; /* Prevent page scroll */
}

.mobile-record {
  display: none;
  flex-direction: column;
  gap: 14px;
  padding: 0;
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

/* Common Card Style */
.record-header-card, .action-bar-card, .list-section-card {
  background: #fff;
  border-radius: 12px;
  border: 1px solid var(--gray200);
  padding: 24px;
}

/* Header Card: Stats */
.record-header-card {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.page-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--gray900);
}
.date-info {
  font-size: 0.9rem;
  color: var(--gray500);
}
.stats-row {
  display: flex;
  gap: 16px;
}
.stat-item {
  flex: 1;
  background: var(--gray50);
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.stat-text {
  display: flex;
  flex-direction: column;
}

@media (max-width: 768px){
  .attendance-record {
    height: auto;
    overflow: visible;
  }
  .record-header-card,
  .action-bar-card,
  .list-section-card {
    display: none;
  }
  .mobile-record { display: flex; flex-direction: column; gap: 14px; }
}

/* ─── Mobile Stats Row Card (이전 버전 스타일) ─── */
.m-stats-row-card {
  display: flex;
  gap: 8px;
  background: #fff;
  border: 1px solid var(--gray200);
  border-radius: 14px;
  padding: 16px 12px;
}
.m-stat-row-item {
  flex: 1;
  background: var(--gray50);
  border-radius: 10px;
  padding: 12px 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: flex-start;
}
.m-stat-row-text {
  display: flex;
  flex-direction: column;
}
.m-row-num {
  font-size: 1.3rem;
  font-weight: 800;
  color: var(--gray900);
  line-height: 1.1;
}
.m-row-label {
  font-size: 0.68rem;
  color: var(--gray500);
  margin-top: 2px;
  font-weight: 500;
}

/* ─── Mobile Styles ─── */
.mobile-head-text h1 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--gray900);
}
.mobile-head-text p {
  margin: 2px 0 0;
  font-size: 0.78rem;
  color: var(--gray500);
}

/* Month Bar */
.m-month-bar {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0;
  background: #fff;
  border: 1px solid var(--gray200);
  border-radius: 12px;
  padding: 10px 16px;
}
.m-month-label {
  text-align: center;
  font-size: 1rem;
  font-weight: 700;
  color: var(--gray900);
}
.m-month-trigger {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border: none;
  background: transparent;
  color: inherit;
  cursor: pointer;
  padding: 0 8px;
}
.m-month-btn {
  width: 32px; height: 32px;
  border: none; background: var(--gray50);
  border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  color: var(--gray600); cursor: pointer;
}
.m-month-btn:active { background: var(--gray100); }
.m-month-input-hidden {
  position: absolute;
  width: 0;
  height: 0;
  opacity: 0;
  pointer-events: none;
}

/* Stats Grid */
.m-stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
.m-stat-card {
  border-radius: 14px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.m-stat-icon {
  width: 32px; height: 32px;
  border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 6px;
}
.m-stat-num {
  font-size: 1.6rem;
  font-weight: 800;
  line-height: 1.1;
}
.m-stat-label {
  font-size: 0.75rem;
  font-weight: 500;
}
.m-blue { background: #EFF6FF; }
.m-blue .m-stat-icon { background: #DBEAFE; color: #3B82F6; }
.m-blue .m-stat-num { color: #1D4ED8; }
.m-blue .m-stat-label { color: #3B82F6; }
.m-orange { background: #FFF7ED; }
.m-orange .m-stat-icon { background: #FED7AA; color: #EA580C; }
.m-orange .m-stat-num { color: #C2410C; }
.m-orange .m-stat-label { color: #EA580C; }
.m-gray { background: #F8FAFC; }
.m-gray .m-stat-icon { background: #E2E8F0; color: #64748B; }
.m-gray .m-stat-num { color: #334155; }
.m-gray .m-stat-label { color: #64748B; }
.m-green { background: #F0FDF4; }
.m-green .m-stat-icon { background: #BBF7D0; color: #16A34A; }
.m-green .m-stat-num { color: #15803D; }
.m-green .m-stat-label { color: #16A34A; }

/* Filter + Search */
.m-filter-area {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.m-tabs {
  display: flex;
  gap: 6px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  padding-bottom: 2px;
}
.m-tabs::-webkit-scrollbar { display: none; }
.m-tab {
  flex-shrink: 0;
  padding: 6px 14px;
  border-radius: 20px;
  border: 1px solid var(--gray200);
  background: #fff;
  font-size: 0.8rem; font-weight: 600;
  color: var(--gray500);
  cursor: pointer; transition: all 0.15s;
}
.m-tab.active {
  background: var(--primary);
  border-color: var(--primary);
  color: #fff;
}
.m-search {
  display: flex; align-items: center; gap: 8px;
  background: #fff; border: 1px solid var(--gray200);
  border-radius: 10px; padding: 9px 12px;
  color: var(--gray400);
}
.m-search input {
  border: none; background: transparent;
  width: 100%; font-size: 0.85rem; color: var(--gray700);
}
.m-search input::placeholder { color: var(--gray400); }

/* Record Cards */
.m-record-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.m-record-card {
  background: #fff;
  border: 1px solid var(--gray100);
  border-radius: 14px;
  padding: 14px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
}
.m-rc-left {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 42px;
}
.m-rc-date {
  font-size: 1rem;
  font-weight: 800;
  color: var(--gray900);
  line-height: 1;
}
.m-rc-day {
  font-size: 0.72rem;
  color: var(--gray400);
  margin-top: 3px;
  font-weight: 500;
}
.m-rc-center {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.m-rc-times {
  display: flex;
  align-items: center;
  gap: 6px;
}
.m-rc-time-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.82rem;
  color: var(--gray700);
  font-weight: 500;
}
.m-rc-time-item svg { color: var(--gray400); }
.m-rc-sep {
  font-size: 0.75rem;
  color: var(--gray300);
}
.m-status-tag {
  display: inline-block;
  padding: 3px 9px;
  border-radius: 6px;
  font-size: 0.72rem;
  font-weight: 700;
  width: fit-content;
}
.m-status-tag.normal { background: #DBEAFE; color: #1D4ED8; }
.m-status-tag.tardy { background: #FED7AA; color: #C2410C; }
.m-status-tag.early_leave { background: #FDE68A; color: #92400E; }
.m-status-tag.absent { background: #E2E8F0; color: #475569; }
.m-status-tag.vacation { background: #BBF7D0; color: #15803D; }
.m-rc-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  min-width: 52px;
}
.m-rc-hours {
  font-size: 0.92rem;
  font-weight: 800;
  color: var(--gray900);
}
.m-rc-hours-label {
  font-size: 0.68rem;
  color: var(--gray400);
  margin-top: 2px;
}

/* Empty State */
.m-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 48px 0;
  color: var(--gray400);
  font-size: 0.85rem;
}

/* Pagination */
.m-pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 6px;
  padding: 4px 0 8px;
}
.m-page-btn {
  width: 34px; height: 34px;
  border: 1px solid var(--gray200);
  background: #fff; border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  color: var(--gray600); cursor: pointer;
}
.m-page-btn:disabled { opacity: 0.3; cursor: not-allowed; }
.m-page-num {
  width: 34px; height: 34px;
  border: 1px solid var(--gray200);
  background: #fff; border-radius: 8px;
  font-size: 0.85rem; font-weight: 600;
  color: var(--gray600); cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.15s;
}
.m-page-num.active {
  background: var(--primary);
  border-color: var(--primary);
  color: #fff;
}
.stat-text .num {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--gray900);
  line-height: 1.2;
}
.stat-text .label {
  font-size: 0.85rem;
  color: var(--gray500);
}

.icon-box {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
}
.blue-bg { background: #E0F7FA; color: var(--primary); }
.orange-bg { background: #FFF3E0; color: #F97316; }
.purple-bg { background: #F3E5F5; color: #8B5CF6; }
.red-bg { background: #FFEBEE; color: var(--red); }


/* Action Bar */
.action-bar-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
}
.action-left {
  display: flex;
  align-items: center;
  gap: 12px;
}
.icon-calendar-rect {
  width: 40px;
  height: 40px;
  background: var(--gray50);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--gray600);
}
.action-title { font-size: 1.1rem; font-weight: 700; color: var(--gray900); margin-bottom: 2px; }
.action-desc { font-size: 0.85rem; color: var(--gray500); }

.action-right {
  display: flex;
  align-items: center;
  gap: 12px;
}
.month-selector {
  display: flex;
  align-items: center;
  background: var(--gray50);
  border-radius: 6px;
  padding: 4px;
  gap: 8px;
}
.month-input {
  border: 1px solid var(--gray200);
  background: #fff;
  border-radius: 6px;
  padding: 6px 10px;
  font-size: 0.85rem;
  color: var(--gray700);
}
.btn-icon {
  width: 24px; height: 24px;
  border: none; background: #fff;
  border-radius: 4px; color: var(--gray600);
  cursor: pointer; display: flex; align-items: center; justify-content: center;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}
.current-month { font-size: 0.9rem; font-weight: 600; color: var(--gray800); }
.btn-download {
  display: flex; align-items: center; gap: 6px;
  padding: 8px 12px;
  border: 1px solid var(--gray300);
  background: #fff; border-radius: 6px;
  font-size: 0.9rem; color: var(--gray700); font-weight: 500;
  cursor: pointer;
}
.btn-download:hover { background: var(--gray50); }


/* List Section */
.list-section-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0; /* Remove gap, use padding/margin if needed */
  min-height: 0; /* Critical for nested flex scrolling */
  padding-bottom: 16px;
}
.filter-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
}
.tabs {
  display: flex; gap: 8px;
}
.tab {
  padding: 6px 16px;
  border-radius: 20px;
  border: none;
  font-size: 0.9rem; font-weight: 600;
  color: var(--gray500); background: var(--gray100);
  cursor: pointer; transition: all 0.2s;
}
.tab.active {
  background: var(--primary); color: #fff;
}
.search-box {
  display: flex; align-items: center; gap: 8px;
  background: var(--gray50); border: 1px solid var(--gray200);
  border-radius: 6px; padding: 6px 12px; width: 200px; color: var(--gray400);
}
.search-box input {
  border: none; background: transparent; width: 100%; font-size: 0.9rem;
}

.table-wrapper {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
}
.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 220px;
  color: var(--gray500);
  font-size: 0.95rem;
}
.record-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}
.record-table th {
  text-align: left;
  padding: 12px 0;
  border-bottom: 1px solid var(--gray200);
  color: var(--gray500); font-weight: 500; font-size: 0.8rem;
}
.record-table td {
  padding: 16px 0;
  border-bottom: 1px solid var(--gray100);
  color: var(--gray800);
  vertical-align: middle;
}
.text-right { text-align: right; }
.font-bold { font-weight: 700; }
.record-table th.col-work-hours,
.record-table td.col-work-hours {
  width: 140px;
  white-space: nowrap;
  text-align: right;
  padding-right: 16px !important;
}
.weekday { color: var(--gray500); font-size: 0.85rem; margin-left: 2px; }

.status-tag {
  display: inline-block; padding: 4px 10px;
  border-radius: 6px; font-size: 0.75rem; font-weight: 600;
}
.status-tag.normal { background: #E3F2FD; color: #1E88E5; }
.status-tag.tardy { background: #FFF3E0; color: #FB8C00; }
.status-tag.early_leave { background: #FFF3E0; color: #FB8C00; }
.status-tag.absent { background: #F3F4F6; color: #4B5563; }
.status-tag.vacation { background: #FEE2E2; color: #DC2626; }

/* Pagination */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin-top: 16px; /* Explicit spacing */
}
.page-arrow, .page-num {
  width: 32px; height: 32px;
  border-radius: 4px;
  border: none;
  background: transparent;
  color: var(--gray500);
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
    transition: all 0.2s;
}
.page-arrow:hover, .page-num:hover {
  background: var(--gray50);
  color: var(--gray800);
}
.page-num.active {
  background: var(--primary);
  color: #fff;
}
.page-arrow:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .record-header-card,
  .action-bar-card,
  .list-section-card {
    display: none;
  }

  .mobile-record {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }
}
</style>
