<template>
  <div class="attendance-record">
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
            <span class="num">{{ monthlyStats.remoteCount }}</span>
            <span class="label">재택/외근</span>
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

    <!-- Title & Actions -->
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
          <span class="current-month">{{ selectorMonthLabel }}</span>
          <button class="btn-icon" @click="goNextMonth" aria-label="다음 달">&gt;</button>
        </div>
        <button class="btn-download">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          엑셀 다운로드
        </button>
      </div>
    </div>

    <!-- List Section -->
    <div class="list-section-card">
      <div class="filter-row">
        <div class="tabs">
          <button
            v-for="tab in tabs"
            :key="tab.value"
            class="tab"
            :class="{ active: activeTab === tab.value }"
            @click="activeTab = tab.value"
          >
            {{ tab.label }}
          </button>
        </div>
        <div class="search-box">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input v-model="searchQuery" type="text" placeholder="검색" />
        </div>
      </div>

      <div class="table-wrapper">
        <table class="record-table">
          <thead>
            <tr>
              <th>날짜</th>
              <th>출근 시간</th>
              <th>퇴근 시간</th>
              <th>상태</th>
              <th>메모</th>
              <th class="text-right">총 근무시간</th>
            </tr>
          </thead>
          <tbody>
            <!-- Mock Data Rows -->
            <tr v-for="(row, idx) in paginatedRecords" :key="idx">
              <td>{{ row.date }} <span class="weekday">({{ row.day }})</span></td>
              <td>{{ row.inTime }}</td>
              <td>{{ row.outTime }}</td>
              <td><span class="status-tag" :class="row.statusClass">{{ row.status }}</span></td>
              <td class="memo">{{ row.memo }}</td>
              <td class="text-right font-bold">{{ row.total }}</td>
            </tr>
          </tbody>
        </table>
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
import { computed, ref, watch } from 'vue'

const dayNames = ['일', '월', '화', '수', '목', '금', '토']

const tabs = [
  { value: 'all', label: '전체' },
  { value: 'normal', label: '정상' },
  { value: 'late', label: '지각/조퇴' },
  { value: 'leave', label: '휴가' }
]

const statusMap = {
  normal: { status: '정상', statusClass: 'normal', inTime: '08:55', outTime: '18:10', memo: '-', total: '8h 15m', leaveDays: 0 },
  late: { status: '지각/조퇴', statusClass: 'late', inTime: '09:10', outTime: '18:20', memo: '대중교통 지연', total: '8h 10m', leaveDays: 0 },
  remote: { status: '재택/외근', statusClass: 'remote', inTime: '09:00', outTime: '18:00', memo: '재택근무', total: '8h 00m', leaveDays: 0 },
  leave: { status: '휴가', statusClass: 'leave', inTime: '-', outTime: '-', memo: '연차 사용', total: '-', leaveDays: 1 }
}

const monthPatterns = [
  ['normal', 'late', 'normal', 'normal', 'remote', 'normal', 'leave', 'normal'],
  ['normal', 'normal', 'late', 'remote', 'normal', 'leave', 'normal', 'normal'],
  ['late', 'normal', 'normal', 'normal', 'leave', 'normal', 'remote', 'normal'],
  ['normal', 'leave', 'normal', 'late', 'normal', 'remote', 'normal', 'normal']
]

const selectedMonth = ref({ year: 2026, month: 2 })
const activeTab = ref('all')
const searchQuery = ref('')
const currentPage = ref(1)

const monthOffset = computed(() => (selectedMonth.value.year - 2026) * 12 + (selectedMonth.value.month - 2))

const selectorMonthLabel = computed(() => {
  const month = String(selectedMonth.value.month).padStart(2, '0')
  return `${selectedMonth.value.year}.${month}`
})

const headerMonthLabel = computed(() => `${selectedMonth.value.year}년 ${selectedMonth.value.month}월`)

const monthlyRecords = computed(() => {
  const { year, month } = selectedMonth.value
  const pattern = monthPatterns[Math.abs(monthOffset.value) % monthPatterns.length]
  const daysInMonth = new Date(year, month, 0).getDate()
  const today = new Date()
  const startOfSelectedMonth = new Date(year, month - 1, 1)
  const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999)
  const currentYear = today.getFullYear()
  const currentMonth = today.getMonth() + 1

  if (startOfSelectedMonth > endOfToday) return []

  const maxDay = year === currentYear && month === currentMonth ? today.getDate() : daysInMonth

  return Array.from({ length: maxDay }, (_, idx) => maxDay - idx)
    .map((day) => {
      const dateObj = new Date(year, month - 1, day)
      const y = dateObj.getFullYear()
      const m = String(dateObj.getMonth() + 1).padStart(2, '0')
      const d = String(dateObj.getDate()).padStart(2, '0')
      const dayType = pattern[(day - 1) % pattern.length]
      const statusInfo = statusMap[dayType]

      return {
        ...statusInfo,
        type: dayType,
        date: `${y}.${m}.${d}`,
        day: dayNames[dateObj.getDay()],
        dateObj
      }
    })
    .filter((record) => ![0, 6].includes(record.dateObj.getDay()))
    .filter((record) => record.dateObj <= endOfToday)
    .map(({ dateObj, ...record }) => record)
})

const monthlyStats = computed(() => {
  const normalCount = monthlyRecords.value.filter((record) => record.type === 'normal').length
  const lateCount = monthlyRecords.value.filter((record) => record.type === 'late').length
  const remoteCount = monthlyRecords.value.filter((record) => record.type === 'remote').length
  const leaveTotal = monthlyRecords.value.reduce((sum, record) => sum + (record.leaveDays || 0), 0)

  return {
    normalCount,
    lateCount,
    remoteCount,
    leaveDays: Number.isInteger(leaveTotal) ? String(leaveTotal) : leaveTotal.toFixed(1)
  }
})

const displayedRecords = computed(() => {
  if (activeTab.value === 'all') return monthlyRecords.value
  return monthlyRecords.value.filter((record) => record.type === activeTab.value)
})

const filteredRecords = computed(() => {
  const keyword = searchQuery.value.trim().toLowerCase()
  if (!keyword) return displayedRecords.value

  return displayedRecords.value.filter((record) => {
    const searchTargets = [
      record.date,
      record.day,
      record.inTime,
      record.outTime,
      record.status,
      record.memo,
      record.total
    ]
    return searchTargets.some((target) => String(target).toLowerCase().includes(keyword))
  })
})

const pageSize = computed(() => (activeTab.value === 'all' ? 10 : 3))

const totalPages = computed(() => Math.max(1, Math.ceil(filteredRecords.value.length / pageSize.value)))

const pageNumbers = computed(() => Array.from({ length: totalPages.value }, (_, idx) => idx + 1))

const paginatedRecords = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredRecords.value.slice(start, start + pageSize.value)
})

watch([activeTab, searchQuery, monthOffset], () => {
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
</script>

<style scoped>
.attendance-record {
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: calc(100vh - var(--header-h) - 48px);
  overflow: hidden; /* Prevent page scroll */
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
  padding: 20px 24px;
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
.weekday { color: var(--gray500); font-size: 0.85rem; margin-left: 2px; }

.status-tag {
  display: inline-block; padding: 4px 10px;
  border-radius: 6px; font-size: 0.75rem; font-weight: 600;
}
.status-tag.normal { background: #E3F2FD; color: #1E88E5; }
.status-tag.late { background: #FFF3E0; color: #FB8C00; }
.status-tag.remote { background: #F3E8FF; color: #7E22CE; }
.status-tag.leave { background: #FEE2E2; color: #DC2626; }
.memo {
  color: var(--gray500); font-size: 0.85rem;
}

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
</style>
