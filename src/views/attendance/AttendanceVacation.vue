<template>
  <div class="attendance-vacation">
    <div class="page-header">
      <h2 class="page-title">연차/휴가 현황</h2>
      <div class="header-actions">
        <button class="btn-primary" @click="$router.push('/approval/draft')">휴가 신청</button>
      </div>
    </div>

    <!-- Summary Cards -->
    <div class="summary-cards">
      <div class="card summary-card total">
        <div class="card-icon blue-bg">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
        </div>
        <div class="card-info">
          <span class="label">총 연차</span>
          <span class="value">{{ leaveBalance.totalAnnualLeave.toFixed(1) }}</span>
        </div>
      </div>

      <div class="card summary-card used">
        <div class="card-icon red-bg">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
          </svg>
        </div>
        <div class="card-info">
          <span class="label">사용 연차</span>
          <span class="value">{{ leaveBalance.usedAnnualLeave.toFixed(1) }}</span>
        </div>
      </div>

      <div class="card summary-card remaining">
        <div class="card-icon green-bg">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
        </div>
        <div class="card-info">
          <span class="label">잔여 연차</span>
          <span class="value highlight">{{ leaveBalance.remainingAnnualLeave.toFixed(1) }}</span>
        </div>
      </div>
    </div>

    <!-- Content Grid -->
    <div class="content-grid">
      <!-- Left: Usage History -->
      <div class="card history-section">
        <div class="section-header">
          <h3>연차 사용 내역</h3>
          <span class="badge">{{ currentYear }}년</span>
        </div>
        <div class="history-filters">
          <select v-model="selectedStatus" class="filter-select">
            <option value="all">전체 상태</option>
            <option value="approved">승인완료</option>
            <option value="pending">결재중</option>
            <option value="rejected">반려</option>
            <option value="cancelled">취소</option>
          </select>
          <select v-model="selectedType" class="filter-select">
            <option value="all">전체 종류</option>
            <option v-for="type in availableLeaveTypes" :key="type" :value="type">{{ type }}</option>
          </select>
        </div>
        <div class="table-container">
          <table class="history-table">
            <thead>
              <tr>
                <th>날짜</th>
                <th>구분</th>
                <th>사용 기간</th>
                <th>사용 일수</th>
                <th>상태</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in filteredLeaveRequests" :key="item.id">
                <td class="col-date">{{ item.applyDate }}</td>
                <td><span class="type-badge">{{ item.leaveType }}</span></td>
                <td>{{ item.startDate }} ~ {{ item.endDate }}</td>
                <td class="col-days">-{{ formatUsedDays(item) }}</td>
                <td>
                  <span class="status-badge" :class="item.status">{{ getStatusLabel(item.status) }}</span>
                </td>
              </tr>
              <tr v-if="filteredLeaveRequests.length === 0">
                <td colspan="5" class="empty-row">휴가 신청 내역이 없습니다.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Right: Grant History / Upcoming -->
      <div class="right-col">
        <!-- Leave Status Summary -->
        <div class="card status-summary-card">
          <div class="section-header">
            <h3>휴가 사용 요약</h3>
          </div>
          <div class="status-summary-grid">
            <div class="status-summary-item approved">
              <span class="status-summary-label">승인완료</span>
              <strong>{{ leaveStatusSummary.approved }}</strong>
            </div>
            <div class="status-summary-item pending">
              <span class="status-summary-label">결재중</span>
              <strong>{{ leaveStatusSummary.pending }}</strong>
            </div>
            <div class="status-summary-item rejected">
              <span class="status-summary-label">반려</span>
              <strong>{{ leaveStatusSummary.rejected }}</strong>
            </div>
            <div class="status-summary-item cancelled">
              <span class="status-summary-label">취소</span>
              <strong>{{ leaveStatusSummary.cancelled }}</strong>
            </div>
          </div>
        </div>

        <!-- Grant History -->
        <div class="card grant-section">
          <div class="section-header">
            <h3>연차 부여 내역</h3>
          </div>
          <ul v-if="leaveGrantHistory.length" class="grant-list">
            <li v-for="grant in leaveGrantHistory" :key="grant.id">
              <div class="grant-info">
                <span class="grant-title">{{ grant.reason }}</span>
                <span class="grant-date">{{ grant.date }}</span>
              </div>
              <span class="grant-days">+{{ grant.days }}</span>
            </li>
          </ul>
          <div v-else class="empty-state grant-empty-state">
            <p>연차 부여 이력이 없습니다.</p>
            <span class="empty-sub">현재 화면에는 불러온 연차 부여 데이터가 없어 부여 내역을 표시하지 않습니다.</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useAttendanceStore } from '@/store/attendance'

const store = useAttendanceStore()
const { leaveBalance, leaveGrantHistory, myLeaveRequestsList } = storeToRefs(store)
const currentYear = new Date().getFullYear()
const selectedStatus = ref('all')
const selectedType = ref('all')
const availableLeaveTypes = computed(() =>
  [...new Set(myLeaveRequestsList.value.map((item) => item.leaveType).filter(Boolean))].sort(),
)
const filteredLeaveRequests = computed(() =>
  myLeaveRequestsList.value.filter((item) => {
    const statusMatch = selectedStatus.value === 'all' || item.status === selectedStatus.value
    const typeMatch = selectedType.value === 'all' || item.leaveType === selectedType.value
    return statusMatch && typeMatch
  }),
)
const leaveStatusSummary = computed(() =>
  myLeaveRequestsList.value.reduce(
    (acc, item) => {
      if (acc[item.status] !== undefined) {
        acc[item.status] += 1
      }
      return acc
    },
    {
      approved: 0,
      pending: 0,
      rejected: 0,
      cancelled: 0,
    },
  ),
)

const getStatusLabel = (status) => {
  const map = { approved: '승인완료', pending: '결재중', rejected: '반려', cancelled: '취소' }
  return map[status] || status
}

const formatUsedDays = (item) => {
  const usedDays = Number(item?.usedDays || 0)
  const leaveType = String(item?.leaveType || '')
  if (usedDays === 0.5 || leaveType.includes('반차')) {
    return '반차'
  }
  if (!Number.isInteger(usedDays)) {
    return `${usedDays.toFixed(1)}일`
  }
  return `${usedDays}일`
}

onMounted(async () => {
  await Promise.all([
    store.fetchLeaveBalance(),
    store.fetchLeaveGrantHistory(currentYear),
    store.fetchMyLeaveRequests(),
  ])
})
</script>

<style scoped>
.attendance-vacation {
  display: flex;
  flex-direction: column;
  gap: 20px;
  height: 100%;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--gray900);
}

.btn-primary {
  background: var(--primary);
  color: #fff;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  font-size: 0.9rem;
  transition: opacity 0.2s;
}
.btn-primary:hover { opacity: 0.9; }

/* Summary Cards */
.summary-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.summary-card {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  border: 1px solid var(--gray100);
  position: relative;
}

.card-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.blue-bg { background: #E3F2FD; color: #1976D2; }
.red-bg { background: #FFEBEE; color: #D32F2F; }
.green-bg { background: #E8F5E9; color: #388E3C; }
.amber-bg { background: #FFF8E1; color: #F59E0B; }

.card-info {
  display: flex;
  flex-direction: column;
}

.label {
  font-size: 0.9rem;
  color: var(--gray500);
  margin-bottom: 2px;
}

.value {
  font-size: 1.8rem;
  font-weight: 800;
  color: var(--gray800);
}

.value.highlight {
  color: var(--primary);
}

/* Content Grid */
.content-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 16px;
  flex: 1;
}

.card {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  border: 1px solid var(--gray100);
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h3 {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--gray800);
}

.badge {
  background: var(--gray100);
  color: var(--gray600);
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 600;
}

.history-filters {
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
}

.filter-select {
  min-width: 132px;
  padding: 8px 10px;
  border: 1px solid var(--gray200);
  border-radius: 8px;
  background: #fff;
  color: var(--gray700);
  font-size: 0.85rem;
}

/* Table */
.table-container {
  overflow-x: auto;
}

.history-table {
  width: 100%;
  border-collapse: collapse;
}

.history-table th {
  text-align: left;
  padding: 12px;
  color: var(--gray500);
  font-weight: 500;
  font-size: 0.85rem;
  border-bottom: 1px solid var(--gray100);
}

.history-table td {
  padding: 16px 12px;
  font-size: 0.95rem;
  color: var(--gray800);
  border-bottom: 1px solid var(--gray50);
}

.col-date {
  font-weight: 600;
  color: var(--gray700);
}

.type-badge {
  background: var(--gray100);
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  color: var(--gray600);
}

.col-days {
  color: var(--red);
  font-weight: 600;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 70px;
  padding: 5px 10px;
  border-radius: 999px;
  font-size: 0.76rem;
  font-weight: 700;
}
.status-badge.approved { background: #E8F5E9; color: #2E7D32; }
.status-badge.pending { background: #FFF8E1; color: #B45309; }
.status-badge.rejected { background: #FEE2E2; color: #B91C1C; }
.status-badge.cancelled { background: #F3F4F6; color: #6B7280; }

/* Right Column */
.right-col {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.status-summary-card {
  min-height: 180px;
}

.status-summary-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.status-summary-item {
  padding: 16px 14px;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  border: 1px solid transparent;
}

.status-summary-item strong {
  font-size: 1.4rem;
  font-weight: 800;
}

.status-summary-label {
  font-size: 0.82rem;
  font-weight: 700;
}

.status-summary-item.approved {
  background: #E8F5E9;
  border-color: #C8E6C9;
  color: #2E7D32;
}

.status-summary-item.pending {
  background: #FFF8E1;
  border-color: #FDE68A;
  color: #B45309;
}

.status-summary-item.rejected {
  background: #FEE2E2;
  border-color: #FECACA;
  color: #B91C1C;
}

.status-summary-item.cancelled {
  background: #F3F4F6;
  border-color: #E5E7EB;
  color: #6B7280;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 8px;
  color: var(--gray400);
  font-size: 0.9rem;
  padding: 20px 0;
}

.empty-sub {
  color: var(--gray400);
  font-size: 0.82rem;
  text-align: center;
  line-height: 1.4;
}

.btn-text {
  background: none;
  border: none;
  color: var(--primary);
  font-weight: 600;
  cursor: pointer;
  font-size: 0.9rem;
}
.btn-text:hover { text-decoration: underline; }

/* Grant List */
.grant-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.grant-list li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid var(--gray50);
}

.grant-list li:last-child {
  border-bottom: none;
}

.grant-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.grant-title {
  font-size: 0.95rem;
  color: var(--gray800);
  font-weight: 500;
}

.grant-date {
  font-size: 0.8rem;
  color: var(--gray400);
}

.grant-days {
  font-size: 1rem;
  font-weight: 700;
  color: var(--primary);
}

.grant-empty-state {
  min-height: 160px;
}

@media (max-width: 1200px) {
  .summary-cards {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
