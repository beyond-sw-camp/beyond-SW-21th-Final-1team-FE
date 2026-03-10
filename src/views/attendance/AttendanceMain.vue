<template>
  <div class="attendance-dashboard">
    <!-- ═══ TOP ROW ═══ -->
    <div class="top-row">
      <!-- 1. 출퇴근 기록 카드 -->
      <div class="card clock-card">
        <div class="card-header-row">
          <div class="date-info">
            <span class="icon-calendar">📅</span>
            <span>{{ currentDate }}</span>
          </div>
          <span class="status-badge" :class="workStatusClass">{{ workStatusLabel }}</span>
        </div>
        
        <div class="clock-display">
          <div class="time-main">{{ currentTime }}</div>
          <div class="location-info">서울, 대한민국</div>
        </div>

        <div class="clock-actions">
          <div class="time-row">
            <div class="time-item">
              <span class="label">☀️ 출근 시간</span>
              <span class="value">{{ checkInTime }}</span>
            </div>
            <div class="divider"></div>
            <div class="time-item">
              <span class="label">🌙 퇴근 시간</span>
              <span class="value">{{ checkOutTime }}</span>
            </div>
          </div>
          <button v-if="!isCheckedIn" class="btn-check-out btn-in" @click="handleCheckIn">출근하기</button>
          <button v-else class="btn-check-out" @click="handleCheckOut">퇴근하기</button>
        </div>
      </div>

      <!-- 2. 이번 주 근무 현황 -->
      <div class="card weekly-card">
        <div class="card-header-row">
          <span class="card-title">이번 주 근무</span>
          <span class="icon-refresh">
             <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>
          </span>
        </div>
        <div class="period-info">02.09 - 02.15 (법정 52h)</div>

        <div class="weekly-stat">
          <div class="hours-display">
            <span class="hours-num">42</span>
            <span class="hours-unit">h</span>
          </div>
          <div class="progress-info">
            <span>표준 40h 달성</span>
            <span class="percent">105%</span>
          </div>
          <div class="progress-bar-bg">
            <div class="progress-bar-fill" style="width: 100%"></div>
          </div>
        </div>

        <div class="weekly-breakdown">
          <div class="bd-item">
            <span class="label">기본 근무</span>
            <span class="value">40 / 40h</span>
          </div>
          <div class="bd-item">
            <span class="label">연장 근무</span>
            <span class="value blue">2 / 12h</span>
          </div>
        </div>
      </div>

      <!-- 3. 이번 달 현황 (Clickable) -->
      <div class="card monthly-card" @click="$router.push('/attendance/record')">
        <div class="card-header-row">
          <span class="card-title">이번 달 근태 현황</span>
          <span class="icon-arrow-right" @click.stop="$router.push('/attendance/vacation')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
          </span>
        </div>
        <div class="period-info">2026년 2월 기준</div>

        <div class="monthly-grid">
          <!-- Item 1 -->
          <div class="m-item">
            <div class="icon-box blue-bg">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            </div>
            <div class="m-stat">
              <span class="num">12</span>
              <span class="label">정상 출근</span>
            </div>
          </div>
          <!-- Item 2 -->
          <div class="m-item">
            <div class="icon-box orange-bg">
               <!-- Late/Early Icon: Alert Circle -->
               <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F97316" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            </div>
            <div class="m-stat">
              <span class="num">1</span>
              <span class="label">지각/조퇴</span>
            </div>
          </div>
          <!-- Item 3 -->
          <div class="m-item">
            <div class="icon-box purple-bg">
               <!-- Remote/Trip Icon: Home -->
               <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            </div>
            <div class="m-stat">
              <span class="num">2</span>
              <span class="label">재택/외근</span>
            </div>
          </div>
          <!-- Item 4 -->
          <div class="m-item">
            <div class="icon-box red-bg">
               <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--red)" stroke-width="2"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>
            </div>
            <div class="m-stat">
              <span class="num">0.5</span>
              <span class="label">휴가 사용</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ═══ BOTTOM ROW ═══ -->
    <div class="bottom-row">
      <!-- Left: Calendar -->
      <div class="col-left">
        <div class="card calendar-card" @click="$router.push('/attendance/schedule')">
          <div class="card-header-row">
            <div class="cal-title">
              <span class="card-title">근무 일정</span>
              <div class="cal-badge">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                2026.02
              </div>
            </div>
            <div class="cal-nav">
              <button class="icon-btn">&lt;</button>
              <button class="icon-btn">&gt;</button>
            </div>
          </div>

          <div class="calendar-grid">
            <div class="cal-head">
              <span class="sun">일</span><span>월</span><span>화</span><span>수</span><span>목</span><span>금</span><span class="sat">토</span>
            </div>
            <!-- Week 1: Feb 1 is Sunday -->
            <div class="cal-week week-flex">
              <div class="day sun">1</div>
              <div class="day">2</div>
              <div class="day">3</div>
              <div class="day">4</div>
              <div class="day">5</div>
              <div class="day">6</div>
              <div class="day sat">7</div>
            </div>
            <!-- Week 2 -->
            <div class="cal-week week-flex">
              <div class="day sun">8</div>
              <div class="day">9</div>
              <div class="day has-schedule">
                10
                <div class="bar-blue">8h 00m</div>
              </div>
              <div class="day has-schedule">
                11
                <div class="bar-blue">8h 10m</div>
              </div>
              <div class="day has-schedule">
                12
                <div class="bar-blue">8h 05m</div>
              </div>
              <div class="day has-schedule">
                13
                <div class="bar-blue">8h 15m</div>
              </div>
              <div class="day sat">14</div>
            </div>
             <!-- Week 3 -->
             <div class="cal-week week-flex">
              <div class="day sun">15</div>
              <div class="day has-schedule">
                16
                <div class="bar-blue">8h 30m</div>
              </div>
              <div class="day has-schedule">
                17
                <div class="bar-blue">8h 20m</div>
              </div>
              <div class="day today has-schedule">
                18
                <div class="bar-blue">Working</div>
              </div>
              <div class="day has-schedule">
                19
                <div class="bar-blue">Plan</div>
              </div>
              <div class="day">20</div>
              <div class="day sat">21</div>
            </div>
            <!-- Week 4 -->
            <div class="cal-week week-flex">
              <div class="day sun">22</div>
              <div class="day">23</div>
              <div class="day has-schedule">
                24
                <div class="bar-orange">Meeting</div>
              </div>
              <div class="day">25</div>
              <div class="day">26</div>
              <div class="day has-schedule">
                27
                <div class="bar-blue">Wrap-up</div>
              </div>
              <div class="day sat">28</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right: Applications -->
      <div class="col-right">
        <!-- Quick App renamed to Vacation App -->
        <div class="card quick-card">
          <div class="card-header-row mb-4">
            <span class="card-title">휴가 신청</span>
            <span class="more-link" @click="$router.push('/attendance/vacation')">더보기</span>
          </div>
          <div class="quick-list">
            <div class="quick-item" @click="$router.push('/approval/draft')">
              <div class="icon-circle blue-bg">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              </div>
              <div class="quick-text">
                <div class="main-text">연장근무 신청</div>
                <div class="sub-text">야간 및 휴일 근무</div>
              </div>
              <span class="chevron">&gt;</span>
            </div>
             <div class="quick-item" @click="$router.push('/approval/draft')">
              <div class="icon-circle purple-bg">
                <!-- Business Trip: Briefcase -->
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
              </div>
              <div class="quick-text">
                <div class="main-text">외근/출장 신청</div>
                <div class="sub-text">외부 일정 보고</div>
              </div>
              <span class="chevron">&gt;</span>
            </div>
             <div class="quick-item" @click="$router.push('/approval/draft')">
              <div class="icon-circle red-bg">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--red)" stroke-width="2"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>
              </div>
              <div class="quick-text">
                <div class="main-text">휴가 신청</div>
                <div class="sub-text">연차, 반차 등</div>
              </div>
              <span class="chevron">&gt;</span>
            </div>
          </div>
        </div>

        <!-- My Applications -->
        <div class="card history-card" @click="$router.push('/attendance/history')">
           <div class="card-header-row mb-2">
            <span class="card-title">나의 신청 현황</span>
            <span class="more-link">더보기</span>
          </div>
          <div class="history-list">
             <div class="history-item" v-for="app in recentApplications" :key="app.id">
              <div class="h-top">
                <span class="status-badge-sm" :class="getApprStatusClass(app.status)">{{ getApprStatusLabel(app.status) }}</span>
                <span class="h-date">{{ app.appliedAt.substring(5).replace('-', '.') }}</span>
              </div>
              <div class="h-title">{{ app.title }}</div>
            </div>
             <div v-if="recentApplications.length === 0" class="no-data-text">
                신청 내역이 없습니다.
             </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useAttendanceStore } from '@/store/attendance'
import { storeToRefs } from 'pinia'

const store = useAttendanceStore()

const recentApplications = computed(() => {
  // Sort by appliedAt desc
  return [...store.myLeaveRequests]
    .sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt))
    .slice(0, 2)
})

const getApprStatusLabel = (s) => ({ pending: '결재 대기', approved: '승인됨', rejected: '반려됨' }[s])
const getApprStatusClass = (s) => ({ pending: 'warning', approved: 'success', rejected: 'danger' }[s])

// -- Clock Logic --
const currentDate = ref('')
const currentTime = ref('')
const { checkInTime, checkOutTime } = storeToRefs(store)

const isCheckedIn = computed(() => {
  return !!checkInTime.value && !checkOutTime.value
})

const workStatusLabel = computed(() => {
  if (isCheckedIn.value) return '근무 중'
  if (checkOutTime.value) return '퇴근 완료'
  return '출근 전'
})

const workStatusClass = computed(() => {
  if (isCheckedIn.value) return 'working'
  if (checkOutTime.value) return 'done'
  return 'before'
})

const isLateCheckIn = (timeText) => {
  if (!timeText) return false
  const [h, m] = timeText.split(':').map(Number)
  return h > 9 || (h === 9 && m > 0)
}

const handleCheckIn = () => {
  const now = new Date()
  const h = String(now.getHours()).padStart(2, '0')
  const m = String(now.getMinutes()).padStart(2, '0')
  const checkIn = `${h}:${m}`
  const status = isLateCheckIn(checkIn) ? 'late' : 'normal'
  // New check-in should start a fresh work session.
  store.setCheckOutTime(null)
  store.setCheckInTime(checkIn)
  store.upsertMyDailyAttendance({ date: now, checkIn, checkOut: null, status })
}

const handleCheckOut = () => {
  const now = new Date()
  const h = String(now.getHours()).padStart(2, '0')
  const m = String(now.getMinutes()).padStart(2, '0')
  const checkOut = `${h}:${m}`
  store.setCheckOutTime(checkOut)
  store.upsertMyDailyAttendance({
    date: now,
    checkIn: checkInTime.value,
    checkOut,
    status: isLateCheckIn(checkInTime.value) ? 'late' : 'normal'
  })
}

const updateTime = () => {
  const now = new Date()
  const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' }
  currentDate.value = now.toLocaleDateString('ko-KR', options)
  
  const h = String(now.getHours()).padStart(2, '0') // 24-hour format logic check? Design shows "9시 14분 10초"
  // For design match "9시 14분 10초"
  const hours = now.getHours()
  const minutes = now.getMinutes()
  const seconds = now.getSeconds()
  currentTime.value = `${hours}시 ${minutes}분 ${seconds}초`
}

let timer = null
onMounted(() => {
  updateTime()
  timer = setInterval(updateTime, 1000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<style scoped>
.attendance-dashboard {
  height: calc(100vh - var(--header-h) - 48px);
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow: hidden; /* Prevent scroll if content fits */
}  

/* ── Common Card ── */
.card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.03); 
  border: 1px solid var(--gray200); /* Optional based on global style */
  padding: 24px;
}
.card-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--gray800);
}
.card-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
.period-info {
  font-size: 0.85rem;
  color: var(--gray500);
  margin-bottom: 20px;
}

/* ── Top Row ── */
.top-row {
  display: flex;
  gap: 16px;
}
.top-row > .card {
  flex: 1;
  min-height: 180px;
  display: flex;
  flex-direction: column;
  padding: 20px;
}

/* 1. Clock Card */
.clock-card {
  min-width: 320px;
}
.date-info {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 1rem;
  color: var(--gray600);
}
.status-badge {
  font-size: 0.9rem; 
  font-weight: 700; 
  padding: 4px 10px; 
  border-radius: 20px;
}
.status-badge.working { background: #E6F7ED; color: #00C853; }
.status-badge.done { background: #E0E7FF; color: #3730A3; }
.status-badge.before { background: #F3F4F6; color: #4B5563; }
.clock-display {
  text-align: center;
  margin: 16px 0;
}
.time-main {
  font-size: 3.2rem;
  font-weight: 800;
  color: var(--gray900);
  letter-spacing: -1px;
  margin-bottom: 2px;
}
.location-info {
  font-size: 0.95rem;
  color: var(--gray400);
}
.clock-actions {
  margin-top: auto;
}
.time-row {
  background: var(--gray50);
  border-radius: 10px;
  padding: 8px 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
.time-item .label {
  font-size: 0.82rem;
  color: var(--gray500);
  margin-bottom: 2px;
}
.time-item .value {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--gray800);
}
.divider {
  width: 1px;
  height: 20px;
  background: var(--gray300);
}
.btn-check-out {
  width: 100%;
  padding: 12px;
  background: var(--gray800);
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.2s;
}
.btn-check-out.btn-in {
  background: var(--primary);
}
.btn-check-out:hover {
  opacity: 0.9;
}

/* 2. Weekly Card */
.weekly-stat {
  margin-bottom: 12px;
}
.hours-display {
  display: flex;
  align-items: baseline;
  gap: 4px;
  margin-bottom: 4px;
}
.hours-num {
  font-size: 3rem;
  font-weight: 800;
  color: var(--primary);
  line-height: 1;
}
.hours-unit {
  font-size: 1.5rem;
  color: var(--gray400);
  font-weight: 400;
}
.progress-info {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  color: var(--gray500);
  margin-bottom: 8px;
}
.progress-info .percent {
  color: var(--primary);
  font-weight: 700;
}
.progress-bar-bg {
  width: 100%;
  height: 8px;
  background: var(--gray100);
  border-radius: 4px;
  overflow: hidden;
}
.progress-bar-fill {
  background: var(--primary);
  height: 100%;
  border-radius: 4px;
}
.weekly-breakdown {
  display: flex;
  justify-content: space-between;
  background: var(--gray50);
  padding: 16px;
  border-radius: 10px;
}
.bd-item {
  display: flex;
  flex-direction: column;
}
.bd-item .label {
  font-size: 0.8rem;
  color: var(--gray400);
  margin-bottom: 4px;
}
.bd-item .value {
  font-size: 1rem;
  font-weight: 700;
  color: var(--gray800);
}
.bd-item .value.blue { color: var(--primary); }

/* 3. Monthly Grid */
.monthly-card {
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}
.monthly-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.06);
}
.monthly-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  flex: 1;
}
.m-item {
  background: var(--gray50);
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.icon-box {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  margin-bottom: 12px;
}
.blue-bg { background: #E0F7FA; color: var(--primary); }
.orange-bg { background: #FFF3E0; color: var(--orange); }
.purple-bg { background: #F3E5F5; color: var(--purple); }
.red-bg { background: #FFEBEE; color: var(--red); }

.m-stat .num {
  display: block;
  font-size: 1.4rem;
  font-weight: 800;
  color: var(--gray800);
  margin-bottom: 2px;
}
.m-stat .label {
  font-size: 0.8rem;
  color: var(--gray500);
}

/* ── Bottom Row ── */
.bottom-row {
  flex: 1;
  display: flex;
  gap: 16px;
  min-height: 0;
}
.col-left {
  flex: 2;
  order: 2; /* Move to right */
  display: flex;
  flex-direction: column;
}
.col-right {
  flex: 1;
  order: 1; /* Move to left */
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Calendar Card */
.calendar-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}
.calendar-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.06);
}
.cal-title {
  display: flex;
  align-items: center;
  gap: 12px;
}
.cal-badge {
  background: var(--gray100);
  color: var(--gray600);
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
}
.cal-nav {
  display: flex;
  gap: 4px;
}
.icon-btn {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--gray200);
  background: transparent;
  border-radius: 4px;
  cursor: pointer;
  color: var(--gray500);
}
.icon-btn:hover { background: var(--gray50); }

.calendar-grid {
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: 0;
}
.cal-head {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--gray100);
  font-size: 0.85rem;
  color: var(--gray500);
  flex-shrink: 0;
}
.cal-week {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  min-height: 60px; 
}
.week-flex {
  flex: 1;
  min-height: 0;
}
.day {
  position: relative;
  border-top: 1px solid transparent;
  padding: 8px;
  font-size: 0.9rem;
  color: var(--gray700);
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%; /* Force height */
}
.day.sun { color: var(--red); }
.day.sat { color: #3F51B5; }
.day.other-month { opacity: 0.3; }
.day.today {
  background: var(--gray800);
  color: #fff;
  border-radius: 8px;
}

.bar-blue, .bar-orange {
  margin-top: 6px;
  font-size: 0.7rem;
  padding: 2px 6px;
  border-radius: 4px;
  width: 90%;
  text-align: center;
}
.bar-blue {
  background: #E0F7FA;
  color: var(--primary);
}
.bar-orange {

  background: #FFF3E0;
  color: var(--orange);
}
.today .bar-blue {
   background: rgba(255,255,255,0.2);
   color: #fff;
}

/* Quick Apps */
.quick-card, .history-card {
  flex: 1;
  display: flex;
  flex-direction: column;
}
.history-card {
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}
.history-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.06);
}
.quick-list, .history-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.quick-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 8px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
}
.quick-item:hover { background: var(--gray50); }
.icon-circle {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.quick-text {
  flex: 1;
}
.quick-text .main-text {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--gray800);
  margin-bottom: 2px;
}
.quick-text .sub-text {
  font-size: 0.8rem;
  color: var(--gray400);
}
.chevron {
  color: var(--gray300);
  font-size: 1.2rem;
}

/* History Card */
.more-link {
  font-size: 0.8rem;
  color: var(--gray500);
  cursor: pointer;
}
.history-item {
  background: var(--gray50);
  padding: 16px;
  border-radius: 10px;
  margin-bottom: 0px;
}
.h-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}
.status-badge-sm {
  font-size: 0.7rem;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 700;
}
.status-badge-sm.warning {
  background: #FFF8E1;
  color: #FBC02D;
}
.status-badge-sm.success {
  background: #DCFCE7;
  color: #166534;
}
.status-badge-sm.danger {
  background: #FEE2E2;
  color: #991B1B;
}
.no-data-text { font-size: 0.9rem; color: var(--gray500); text-align: center; padding: 12px; }
.h-date {
  font-size: 0.8rem;
  color: var(--gray400);
}
.h-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--gray800);
}

.mb-4 { margin-bottom: 16px; }
.mb-2 { margin-bottom: 8px; }

/* Responsive */
@media (max-width: 1200px) {
  .top-row { flex-wrap: wrap; }
  .bottom-row { flex-direction: column; }
}
</style>
