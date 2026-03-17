<template>
  <div class="flexible-work-manage">
    <!-- Header -->
    <div class="page-header">
      <div class="header-content">
        <h2 class="page-title">유연근무 관리</h2>
      </div>
    </div>

    <!-- Tabs -->
    <div class="tabs-container">
      <button 
        class="tab-btn" 
        :class="{ active: currentTab === 'list' }"
        @click="currentTab = 'list'"
      >
        신청 목록
      </button>
      <button 
        class="tab-btn" 
        :class="{ active: currentTab === 'schedule' }"
        @click="currentTab = 'schedule'"
      >
        스케줄 뷰
      </button>
    </div>

    <!-- Tab 1: List View -->
    <div v-if="currentTab === 'list'" class="tab-content">
      <div class="content-card">
        <div class="action-bar">
          <div class="left-actions">
            <select class="filter-select" v-model="selectedFilter">
              <option value="all">전체 상태</option>
              <option value="pending">승인 대기</option>
            </select>
          </div>
        </div>

        <table class="list-table">
          <thead>
            <tr>
              <th>신청자</th>
              <th>부서</th>
              <th>신청 기간</th>
              <th>근무 유형</th>
              <th>상태</th>
              <th>상세</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in sortedPlanList" :key="item.id">
              <td>
                 <div class="user-info">
                    <span class="name">{{ item.name }}</span>
                    <span class="position">{{ item.position }}</span>
                 </div>
              </td>
              <td>{{ item.dept }}</td>
              <td>{{ item.period }}</td>
              <td>
                <span class="type-badge">{{ item.type }}</span>
              </td>
              <td>
                <span 
                  class="status-badge" 
                  :class="[item.status, { 'clickable': item.status === 'rejected' }]"
                  @click="item.status === 'rejected' && handleViewDetail(item)"
                >
                  {{ getStatusLabel(item.status) }}
                </span>
              </td>
              <td>
                <button class="btn-detail" @click="handleViewDetail(item)">보기</button>
              </td>
            </tr>
            <tr v-if="sortedPlanList.length === 0">
              <td colspan="6" class="empty-cell">현재 같은 부서 팀원의 유연근무 신청 내역이 없습니다.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Tab 2: Schedule View (Daily Timeline) -->
    <div v-if="currentTab === 'schedule'" class="tab-content">
      <!-- Alerts -->
      <div class="alert-box warning" v-if="hasStaffShortage">
        <div class="alert-icon">!</div>
        <div class="alert-text">
          <strong>코어타임 인원 부족 경고 ({{ selectedDayLabel }})</strong>
          <p>{{ selectedDayDateLabel }} 14:00 - 16:00 구간에 근무 인원이 부족합니다.</p>
        </div>
      </div>

      <div class="content-card">
        <!-- Day Navigation -->
        <div class="day-nav-wrapper">
           <div class="week-header">
             <div class="week-navigation">
               <div class="week-title">{{ weekTitle }}</div>
             </div>
             <div class="week-picker">
               <label for="weekPicker">주차 선택</label>
               <input
                 id="weekPicker"
                 v-model="selectedWeek"
                 type="week"
                 class="week-input"
                 @change="handleWeekChange"
               />
             </div>
           </div>
           <div class="day-tabs">
             <button 
                v-for="(day, idx) in days" 
                :key="idx"
                class="day-tab"
                :class="{ active: selectedDayIndex === idx, 'has-issue': day.hasIssue }"
                @click="selectedDayIndex = idx"
             >
               <span class="day-label">{{ day.label }}</span>
               <span class="day-date">{{ day.date }}</span>
               <span class="dot-indicator" v-if="day.hasIssue"></span>
             </button>
           </div>
        </div>
        
        <div class="timeline-container">
           <!-- Timeline Header (Hours) -->
           <div class="timeline-header">
             <div class="th-name">구성원</div>
             <div class="th-hours">
               <div v-for="h in hours" :key="h" class="th-hour">{{ h }}</div>
             </div>
           </div>

           <!-- Timeline Body -->
           <div class="timeline-body">
              <!-- Core Time Background -->
              <div class="core-time-bg" style="left: 200px; width: 420px; left: calc(200px + (14 - 8) * (100% - 200px) / 12); width: calc(2 * (100% - 200px) / 12);"></div>
              
              <!-- User Rows -->
              <div class="timeline-row" v-for="user in scheduleData" :key="user.id">
                 <div class="tl-name-cell">
                   <div class="avatar-initial">{{ user.name[0] }}</div>
                   <div class="name-info">
                     <span class="g-name">{{ user.name }}</span>
                     <span class="g-pos">{{ user.position }}</span>
                   </div>
                 </div>
                 <div class="tl-track-cell">
                    <div
                      v-if="user.weekPlan[selectedDayIndex]"
                      class="time-bar-pill"
                      :class="getTimeClass(user.weekPlan[selectedDayIndex])"
                      :style="getBarStyle(user.weekPlan[selectedDayIndex])"
                    >
                      <span class="bar-time">{{ user.weekPlan[selectedDayIndex].start }} - {{ user.weekPlan[selectedDayIndex].end }}</span>
                      <span class="bar-type">{{ getTypeLabel(user.weekPlan[selectedDayIndex].type) }}</span>
                    </div>
                    <div v-else class="empty-bar">신청 없음</div>
                 </div>
              </div>
              <div v-if="scheduleData.length === 0" class="timeline-empty">
                현재 선택한 주차에 같은 부서 팀원의 유연근무 신청이 없습니다.
              </div>
           </div>

           <!-- Legend -->
           <div class="timeline-footer">
              <div class="legend-item"><span class="pill-sample blue"></span>기본 근무</div>
              <div class="legend-item"><span class="pill-sample green"></span>유연 근무</div>
              <div class="legend-item"><span class="pill-sample gray"></span>단축/휴가</div>
              <div class="core-legend">
                 <span class="core-box"></span> 코어타임 (14:00 - 16:00)
              </div>
            </div>
        </div>
      </div>
    </div>

    <!-- Detail Modal -->
    <BaseModal v-model="showDetailModal" width="600px" v-if="selectedPlan">
      <div class="modal-header">
        <h3 class="modal-title">유연근무 신청 상세</h3>
        <span class="status-badge" :class="selectedPlan.status">{{ getStatusLabel(selectedPlan.status) }}</span>
      </div>
      
      <div class="detail-grid">
        <div class="detail-item">
          <label>신청자</label>
          <div class="val">{{ selectedPlan.name }} {{ selectedPlan.position }}</div>
        </div>
        <div class="detail-item">
          <label>부서</label>
          <div class="val">{{ selectedPlan.dept }}</div>
        </div>
        <div class="detail-item full">
          <label>신청 기간</label>
          <div class="val">{{ selectedPlan.period }}</div>
        </div>
        <div class="detail-item full">
          <label>근무 유형</label>
          <div class="val highlight">{{ selectedPlan.type }}</div>
        </div>
        <div class="detail-item full">
           <label>신청 사유</label>
           <div class="val box">{{ selectedPlan.reason || '-' }}</div>
        </div>
        <div class="detail-item full" v-if="selectedPlan.status === 'rejected'">
           <label style="color: var(--red);">반려 사유</label>
           <div class="val box reject-box">{{ selectedPlan.rejectionReason || '반려 사유가 없습니다.' }}</div>
        </div>
      </div>

      <!-- Simple visual representation of schedule pattern -->
      <div class="schedule-pattern-preview">
        <h4>근무 패턴 예시 (09:00 - 18:00)</h4>
        <div class="pattern-bar">
           <div class="p-segment work" style="width: 100%">기본 근무</div>
        </div>
      </div>

      <div class="modal-actions">
        <button class="btn-close" @click="showDetailModal = false">닫기</button>
      </div>
    </BaseModal>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useAttendanceStore } from '@/store/attendance'
import BaseModal from '@/components/common/BaseModal.vue'

const store = useAttendanceStore()
const currentTab = ref('list')
const selectedDayIndex = ref(0) // 0: Mon, 1: Tue ...
const selectedFilter = ref('all') // 'all' or 'pending'
const selectedWeek = ref('')

// Detail Modal State
const showDetailModal = ref(false)
const selectedPlan = ref(null)

const handleViewDetail = (item) => {
  selectedPlan.value = item
  showDetailModal.value = true
}

// Hours 08 ~ 20 (12 hours span)
const hours = Array.from({length: 13}, (_, i) => i + 8) // 8, 9, ... 20

// Use store data for plans
const planList = computed(() => store.flexibleWorkPlans)
const overviewDays = computed(() => store.teamWeeklyOverview?.days || [])
const sortedPlanList = computed(() => {
  let list = [...planList.value]

  // Filtering
  if (selectedFilter.value === 'pending') {
    list = list.filter(item => item.status === 'pending')
  }

  return list
})

const parseIsoDate = (value) => {
  const [year, month, day] = String(value).slice(0, 10).split('-').map(Number)
  return new Date(year, month - 1, day)
}

const formatDateNumber = (value) =>
  `${String(value.getMonth() + 1).padStart(2, '0')}.${String(value.getDate()).padStart(2, '0')}`

const toDateKey = (value) => {
  const year = value.getFullYear()
  const month = String(value.getMonth() + 1).padStart(2, '0')
  const day = String(value.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const getMonday = (value) => {
  const date = new Date(value)
  const day = date.getDay()
  const diff = day === 0 ? -6 : 1 - day
  date.setDate(date.getDate() + diff)
  date.setHours(0, 0, 0, 0)
  return date
}

const formatWeekValue = (value) => {
  const monday = getMonday(value)
  const thursday = new Date(monday)
  thursday.setDate(monday.getDate() + 3)
  const isoYear = thursday.getFullYear()
  const firstThursday = new Date(isoYear, 0, 4)
  const firstIsoMonday = getMonday(firstThursday)
  const diffDays = Math.round((monday - firstIsoMonday) / 86400000)
  const weekNumber = Math.floor(diffDays / 7) + 1
  return `${isoYear}-W${String(weekNumber).padStart(2, '0')}`
}

const weekValueToMonday = (value) => {
  const [yearPart, weekPart] = String(value).split('-W')
  const year = Number(yearPart)
  const week = Number(weekPart)
  const firstThursday = new Date(year, 0, 4)
  const firstIsoMonday = getMonday(firstThursday)
  const monday = new Date(firstIsoMonday)
  monday.setDate(firstIsoMonday.getDate() + (week - 1) * 7)
  return monday
}

const mapPlanType = (plan) => {
  const workForm = String(plan.type || '').toUpperCase()
  if (workForm.includes('OFFICE')) return 'normal'
  if (workForm.includes('SHORT')) return 'short'
  return 'flex'
}

const selectedWeekMonday = computed(() =>
  weekValueToMonday(selectedWeek.value || formatWeekValue(new Date())),
)

const days = computed(() =>
  Array.from({ length: 5 }, (_, idx) => {
    const planDate = overviewDays.value[idx]?.planDate
    const date = planDate
      ? parseIsoDate(planDate)
      : new Date(selectedWeekMonday.value.getFullYear(), selectedWeekMonday.value.getMonth(), selectedWeekMonday.value.getDate() + idx)
    return {
      label: ['월', '화', '수', '목', '금'][idx],
      date: formatDateNumber(date),
      fullDate: planDate || toDateKey(date),
      hasIssue: Boolean(overviewDays.value[idx]?.coreTimeShortageRisk),
    }
  }),
)

const scheduleData = computed(() => {
  const grouped = new Map()

  overviewDays.value.forEach((day, dayIndex) => {
    ;(day.entries || []).forEach((item) => {
      if (!grouped.has(item.userId)) {
        grouped.set(item.userId, {
          id: item.userId,
          name: item.name,
          position: item.position,
          dept: item.dept,
          weekPlan: Array.from({ length: 5 }, () => null),
        })
      }

      grouped.get(item.userId).weekPlan[dayIndex] = {
        start: String(item.startDate).slice(11, 16),
        end: String(item.endDate).slice(11, 16),
        type: mapPlanType(item),
      }
    })
  })

  return Array.from(grouped.values())
})
const hasStaffShortage = computed(() => Boolean(overviewDays.value[selectedDayIndex.value]?.coreTimeShortageRisk))

const weekTitle = computed(() => {
  const start = overviewDays.value[0]?.planDate
    ? parseIsoDate(overviewDays.value[0].planDate)
    : new Date(selectedWeekMonday.value)
  const end = overviewDays.value[4]?.planDate
    ? parseIsoDate(overviewDays.value[4].planDate)
    : new Date(selectedWeekMonday.value.getFullYear(), selectedWeekMonday.value.getMonth(), selectedWeekMonday.value.getDate() + 4)
  return `${start.getFullYear()}년 ${start.getMonth() + 1}월 ${formatDateNumber(start)} - ${formatDateNumber(end)}`
})

const selectedDayLabel = computed(() => days.value[selectedDayIndex.value]?.label || '')
const selectedDayDateLabel = computed(() => days.value[selectedDayIndex.value]?.date || '')

const getStatusLabel = (s) => ({ pending: '승인 대기', approved: '승인됨', rejected: '반려됨' }[s])

const refreshWeekOverview = async () => {
  const monday = weekValueToMonday(selectedWeek.value || formatWeekValue(new Date()))
  selectedDayIndex.value = 0
  await store.fetchTeamWeeklyOverview(toDateKey(monday))
}

const handleWeekChange = async () => {
  await refreshWeekOverview()
}

onMounted(async () => {
  const today = new Date()
  selectedWeek.value = formatWeekValue(today)
  await Promise.all([store.fetchTeamFlexibleWorkPlans(), refreshWeekOverview()])
})

// --- Timeline Helpers ---
const getTimeClass = (day) => {
  if (!day) return 'pill-gray'
  if (day.type === 'normal') return 'pill-blue'
  if (day.type === 'flex') return 'pill-green'
  return 'pill-gray'
}
const getTypeLabel = (type) => ({ normal: '기본', flex: '유연', short: '단축' }[type] || type)

const parseTime = (t) => {
  const [h, m] = t.split(':').map(Number)
  return h + m / 60
}

const getBarStyle = (day) => {
  if (!day) {
    return { left: '0%', width: '0%' }
  }
  const start = parseTime(day.start)
  const end = parseTime(day.end)
  const duration = end - start
  
  // Total span 8 to 20 = 12 hours
  const startOffset = start - 8
  
  const leftPercent = (startOffset / 12) * 100
  const widthPercent = (duration / 12) * 100
  
  return {
    left: `${leftPercent}%`,
    width: `${widthPercent}%`
  }
}
</script>

<style scoped>
.flexible-work-manage {
  display: flex; flex-direction: column; gap: 20px;
}
.page-header { display: flex; justify-content: space-between; align-items: flex-end; }
.page-title { font-size: 1.5rem; font-weight: 700; color: var(--gray900); }
.page-desc { color: var(--gray500); font-size: 0.95rem; }

/* Tabs */
.tabs-container {
  display: flex; gap: 8px; border-bottom: 2px solid var(--gray200);
}
.tab-btn {
  padding: 10px 20px; background: none; border: none; font-size: 1rem; color: var(--gray500); cursor: pointer; font-weight: 600;
  border-bottom: 2px solid transparent; margin-bottom: -2px;
}
.tab-btn.active { color: var(--primary); border-bottom-color: var(--primary); }


/* Content */
.content-card {
  background: #fff; border-radius: 12px; border: 1px solid var(--gray200); overflow: hidden;
  box-shadow: 0 4px 12px rgba(0,0,0,0.03);
  min-height: 500px;
}

/* List View */
.action-bar {
  padding: 20px 24px; border-bottom: 1px solid var(--gray100); background: #fff;
  display: flex; justify-content: flex-start; align-items: center;
}
.left-actions { display: flex; gap: 12px; align-items: center; }
.filter-select { 
  padding: 8px 12px; border-radius: 6px; border: 1px solid var(--gray300); 
  font-size: 0.9rem; color: var(--gray700); cursor: pointer;
  transition: border-color 0.2s;
}
.filter-select:hover { border-color: var(--gray400); }

.list-table { width: 100%; border-collapse: collapse; }
.list-table th { 
  background: var(--gray50); padding: 16px 24px; text-align: left; 
  font-size: 0.85rem; color: var(--gray600); font-weight: 700; 
  border-bottom: 1px solid var(--gray200); text-transform: uppercase; letter-spacing: 0.03em;
}
.list-table td { 
  padding: 16px 24px; border-bottom: 1px solid var(--gray100); 
  font-size: 0.95rem; color: var(--gray800); vertical-align: middle;
  transition: background 0.1s;
}
.list-table tr:hover td { background: var(--gray50); }
.list-table tr:last-child td { border-bottom: none; }
.empty-cell { text-align: center; color: var(--gray500); padding: 36px 24px; }

.user-info { display: flex; flex-direction: column; gap: 2px; }
.name { font-weight: 600; color: var(--gray900); }
.position { font-size: 0.8rem; color: var(--gray500); }

.type-badge { 
  background: #F3F4F6; padding: 6px 10px; border-radius: 6px; 
  font-size: 0.85rem; font-weight: 600; color: var(--gray700); 
  display: inline-block;
}

.status-badge { padding: 6px 10px; border-radius: 20px; font-size: 0.8rem; font-weight: 700; display: inline-flex; align-items: center; gap: 4px; }
.status-badge::before { content: ''; display: block; width: 6px; height: 6px; border-radius: 50%; }
.status-badge.pending { background: #FFFBEB; color: #B45309; border: 1px solid #FEF3C7; }
.status-badge.pending::before { background: #F59E0B; }
.status-badge.approved { background: #ECFDF5; color: #047857; border: 1px solid #D1FAE5; }
.status-badge.approved::before { background: #10B981; }
.status-badge.rejected { background: #FEF2F2; color: #B91C1C; border: 1px solid #FEE2E2; }
.status-badge.rejected::before { background: #EF4444; }
.status-badge.clickable { cursor: pointer; text-decoration: underline; }

.btn-detail { 
  border: 1px solid var(--gray300); background: #fff; padding: 6px 12px; border-radius: 6px; 
  font-size: 0.85rem; cursor: pointer; color: var(--gray600); font-weight: 500;
  transition: all 0.2s;
}
.btn-detail:hover { border-color: var(--gray400); color: var(--gray800); background: var(--gray50); }

/* Alerts */
.alert-box {
  background: #FEF2F2; border: 1px solid #FECACA; border-radius: 12px; padding: 20px; margin-bottom: 24px;
  display: flex; gap: 16px; box-shadow: 0 4px 6px -1px rgba(220, 38, 38, 0.1); align-items: flex-start;
}
.alert-icon { font-size: 1.8rem; line-height: 1; }
.alert-text strong { color: #991B1B; display: block; margin-bottom: 6px; font-size: 1.05rem; }
.alert-text p { color: #7F1D1D; font-size: 0.95rem; margin: 0; line-height: 1.5; }

/* Timeline View */
.day-nav-wrapper {
  padding: 24px 32px 0 32px; border-bottom: 1px solid var(--gray200); background: #fff;
}
.week-header { display: flex; justify-content: space-between; align-items: center; gap: 16px; margin-bottom: 16px; }
.week-navigation { display: flex; align-items: center; gap: 12px; }
.week-title { font-size: 1rem; font-weight: 700; color: var(--gray800); }
.week-picker { display: flex; align-items: center; gap: 10px; }
.week-picker label { font-size: 0.9rem; color: var(--gray600); font-weight: 600; white-space: nowrap; }
.week-input { padding: 8px 12px; border: 1px solid var(--gray300); border-radius: 8px; font-size: 0.9rem; color: var(--gray700); }
.day-tabs { display: flex; gap: 8px; }
.day-tab { 
  flex: 1; border: none; background: none; padding: 12px; 
  display: flex; flex-direction: column; align-items: center; gap: 4px;
  cursor: pointer; border-bottom: 3px solid transparent; 
  transition: all 0.2s; position: relative;
}
.day-tab:hover { background: var(--gray50); }
.day-tab.active { border-bottom-color: var(--primary); background: #EEF2FF; border-top-left-radius: 8px; border-top-right-radius: 8px; }
.day-tab.active .day-label { color: var(--primary); }
.day-tab.active .day-date { color: var(--primary); font-weight: 700; }

.day-label { font-size: 0.9rem; color: var(--gray500); font-weight: 600; }
.day-date { font-size: 1.1rem; color: var(--gray800); font-weight: 600; }
.dot-indicator { position: absolute; top: 10px; right: 20%; width: 6px; height: 6px; border-radius: 50%; background: var(--red); }

.timeline-container { display: flex; flex-direction: column; padding: 32px; background: #fff; }
.timeline-header { display: flex; margin-bottom: 16px; padding-left: 200px; position: relative; }
.th-name { position: absolute; left: 0; bottom: 0; font-size: 0.85rem; font-weight: 700; color: var(--gray500); }
.th-hours { display: flex; width: 100%; justify-content: space-between; position: relative; }
.th-hour { 
  font-size: 0.8rem; color: var(--gray400); transform: translateX(-50%); 
  position: relative;
}
/* Grid lines from hour labels */
.th-hour::after {
  content: ''; position: absolute; top: 24px; left: 50%; width: 1px; height: 400px;
  background: var(--gray100); z-index: 0; pointer-events: none;
}

.timeline-body { position: relative; display: flex; flex-direction: column; gap: 16px; }
.timeline-row { display: flex; align-items: center; height: 56px; position: relative; z-index: 2; }

.tl-name-cell { width: 200px; display: flex; align-items: center; gap: 12px; flex-shrink: 0; }
.avatar-initial {
  width: 40px; height: 40px; background: #e0e7ff; color: #4338ca; border-radius: 10px;
  display: flex; align-items: center; justify-content: center; font-weight: 700;
}
.name-info { display: flex; flex-direction: column; }
.g-name { font-weight: 700; font-size: 0.95rem; color: var(--gray900); }
.g-pos { font-size: 0.8rem; color: var(--gray500); }

.tl-track-cell { flex: 1; position: relative; height: 100%; margin-left: -6px; } /* micro adjust */
.empty-bar {
  height: 100%;
  display: flex;
  align-items: center;
  color: var(--gray400);
  font-size: 0.85rem;
  padding-left: 12px;
}

.time-bar-pill {
  position: absolute; height: 40px; border-radius: 20px; top: 8px;
  display: flex; align-items: center; justify-content: space-between; padding: 0 16px;
  color: #fff; font-size: 0.85rem; font-weight: 600;
  box-shadow: 0 2px 6px rgba(0,0,0,0.15); transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
}
.time-bar-pill:hover { transform: translateY(-2px); box-shadow: 0 6px 12px rgba(0,0,0,0.2); z-index: 10; }

.pill-blue { background: linear-gradient(90deg, #3B82F6, #2563EB); }
.pill-green { background: linear-gradient(90deg, #10B981, #059669); }
.pill-gray { background: #94A3B8; }

.bar-time { font-family: monospace; opacity: 0.9; }
.bar-type { font-size: 0.75rem; background: rgba(255,255,255,0.2); padding: 2px 6px; border-radius: 4px; }

/* Core Time Zone in Daily View */
/* 2pm to 4pm is index 6~8 out of 0~12 (8am~8pm) -> 14-16 is 6, 2 hours length */
.core-time-bg { 
  position: absolute; top: 0; bottom: 0;
  background: rgba(255, 200, 0, 0.05); 
  border-left: 2px dashed rgba(245, 158, 11, 0.3); border-right: 2px dashed rgba(245, 158, 11, 0.3);
  z-index: 1; pointer-events: none;
}
.timeline-empty {
  padding: 32px 0;
  text-align: center;
  color: var(--gray500);
  font-size: 0.95rem;
}

.timeline-footer { margin-top: 32px; display: flex; gap: 24px; align-items: center; padding-top: 20px; border-top: 1px solid var(--gray100); }
.legend-item { display: flex; align-items: center; gap: 8px; font-size: 0.9rem; color: var(--gray600); font-weight: 500; }
.pill-sample { width: 24px; height: 12px; border-radius: 6px; }
.pill-sample.blue { background: #3B82F6; }
.pill-sample.green { background: #10B981; }
.pill-sample.gray { background: #94A3B8; }

.core-legend { display: flex; align-items: center; gap: 8px; font-size: 0.9rem; color: var(--gray600); margin-left: auto; }
.core-box { width: 24px; height: 24px; background: rgba(255, 200, 0, 0.1); border: 1px dashed rgba(245, 158, 11, 0.5); border-radius: 4px; }


/* Modal Styles */
.modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid var(--gray100); }
.modal-title { font-size: 1.25rem; font-weight: 700; color: var(--gray900); }

.detail-grid {
  display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 32px;
}
.detail-item { display: flex; flex-direction: column; gap: 8px; }
.detail-item.full { grid-column: span 2; }
.detail-item label { font-size: 0.85rem; color: var(--gray500); font-weight: 600; }
.detail-item .val { font-size: 1rem; color: var(--gray900); font-weight: 500; }
.detail-item .val.highlight { color: var(--primary); font-weight: 700; }
.detail-item .val.box { background: var(--gray50); padding: 12px; border-radius: 8px; border: 1px solid var(--gray200); font-size: 0.95rem; line-height: 1.5; }
.detail-item .val.reject-box { background: #FEF2F2; border-color: #FECACA; color: #991B1B; }

.schedule-pattern-preview { background: var(--gray50); padding: 16px; border-radius: 8px; margin-bottom: 32px; }
.schedule-pattern-preview h4 { font-size: 0.9rem; color: var(--gray600); margin-bottom: 12px; }
.pattern-bar { height: 40px; background: #e5e7eb; border-radius: 20px; overflow: hidden; display: flex; }
.p-segment.work { background: var(--primary); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; font-weight: 600; }

.modal-actions { display: flex; justify-content: flex-end; gap: 12px; padding-top: 20px; border-top: 1px solid var(--gray100); }
.btn-close { padding: 10px 24px; border: 1px solid var(--gray300); background: #fff; border-radius: 6px; font-weight: 600; cursor: pointer; color: var(--gray700); }
.btn-close:hover { background: var(--gray50); }
</style>
