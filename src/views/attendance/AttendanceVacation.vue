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
          <span class="value">15.0</span>
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
          <span class="value">3.5</span>
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
          <span class="value highlight">11.5</span>
        </div>
        <div class="expiry-info">사용 기한: 2026.12.31</div>
      </div>
    </div>

    <!-- Content Grid -->
    <div class="content-grid">
      <!-- Left: Usage History -->
      <div class="card history-section">
        <div class="section-header">
          <h3>연차 사용 내역</h3>
          <span class="badge">2026년</span>
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
              <tr v-for="item in usageHistory" :key="item.id">
                <td class="col-date">{{ item.date }}</td>
                <td><span class="type-badge">{{ item.type }}</span></td>
                <td>{{ item.period }}</td>
                <td class="col-days">-{{ item.days }}</td>
                <td>
                  <span class="status-dot" :class="item.status"></span>
                  {{ getStatusLabel(item.status) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Right: Grant History / Upcoming -->
      <div class="right-col">
        <!-- Upcoming Leave -->
        <div class="card upcoming-card">
          <div class="section-header">
            <h3>다음 휴가 일정</h3>
          </div>
          <div class="empty-state" v-if="!upcomingLeave">
            <p>예정된 휴가가 없습니다.</p>
            <button class="btn-text" @click="$router.push('/approval/draft')">휴가 계획하기 &gt;</button>
          </div>
        </div>

        <!-- Grant History -->
        <div class="card grant-section">
          <div class="section-header">
            <h3>연차 부여 내역</h3>
          </div>
          <ul class="grant-list">
            <li v-for="grant in grantHistory" :key="grant.id">
              <div class="grant-info">
                <span class="grant-title">{{ grant.reason }}</span>
                <span class="grant-date">{{ grant.date }}</span>
              </div>
              <span class="grant-days">+{{ grant.days }}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const upcomingLeave = ref(null)

const usageHistory = ref([
  { id: 1, date: '2026.02.13', type: '반차', period: '2026.02.13 (오후)', days: 0.5, status: 'approved' },
  { id: 2, date: '2026.01.20', type: '연차', period: '2026.01.20', days: 1.0, status: 'approved' },
  { id: 3, date: '2026.01.05', type: '연차', period: '2026.01.05', days: 1.0, status: 'approved' },
  { id: 4, date: '2025.12.24', type: '연차', period: '2025.12.24', days: 1.0, status: 'approved' },
])

const grantHistory = ref([
  { id: 1, reason: '2026년 정기 부여', date: '2026.01.01', days: 15.0 },
  { id: 2, reason: '2025년 이월 연차', date: '2026.01.01', days: 0.0 },
])

const getStatusLabel = (status) => {
  const map = { approved: '승인완료', pending: '결재중', rejected: '반려' }
  return map[status] || status
}
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

.expiry-info {
  position: absolute;
  top: 24px;
  right: 24px;
  font-size: 0.8rem;
  color: var(--gray400);
  background: var(--gray50);
  padding: 4px 8px;
  border-radius: 4px;
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

.status-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  margin-right: 6px;
}

.status-dot.approved { background: #4CAF50; }
.status-dot.pending { background: #FFC107; }
.status-dot.rejected { background: #F44336; }

/* Right Column */
.right-col {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.upcoming-card {
  min-height: 140px;
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
</style>
