<template>
  <div class="team-manage-page">
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">팀 근태 관리</h1>
        <p class="page-description">
          팀원들의 근태 현황을 모니터링하고, 유연근무 및 휴가 신청을 관리합니다.
        </p>
      </div>
    </div>

    <!-- Tabs -->
    <div class="tabs-container">
      <button 
        class="tab-btn" 
        :class="{ active: currentTab === 'daily' }"
        @click="currentTab = 'daily'"
      >
        일일 근태 현황
      </button>
      <button 
        class="tab-btn" 
        :class="{ active: currentTab === 'flexible' }"
        @click="currentTab = 'flexible'"
      >
        유연근무 신청 관리
      </button>
    </div>

    <!-- Tab 1: Daily Attendance Status -->
    <div v-if="currentTab === 'daily'" class="tab-content">
      <div class="filter-card">
        <div class="filter-row">

          <div class="filter-group">
            <label>날짜</label>
            <input type="date" v-model="filterDate" class="form-input" />
          </div>
          <div class="filter-group">
            <label>상태</label>
            <select class="form-select" v-model="filterStatus">
              <option value="all">전체</option>
              <option value="normal">정상</option>
              <option value="tardy">지각</option>
              <option value="absent">결근</option>
              <option value="vacation">휴가</option>
            </select>
          </div>
          <button class="btn-search" @click="fetchDailyRecords">조회</button>
        </div>
      </div>

      <div class="card table-card">
        <table class="data-table">
          <thead>
            <tr>
              <th>이름</th>
              <th>부서</th>
              <th>일자</th>
              <th>출근 시각</th>
              <th>퇴근 시각</th>
              <th>근무 시간</th>
              <th>상태</th>
              <th>관리</th>
            </tr>
          </thead>
          <tbody>
            <tr 
              v-for="record in filteredDailyRecords" 
              :key="record.id"
              :class="{ 'row-warning': record.status === 'tardy', 'row-danger': record.status === 'absent' }"
              @click="openEditModal(record)"
            >
              <td>
                <div class="user-cell">
                  <div class="avatar-sm">{{ record.name[0] }}</div>
                  <span class="font-bold">{{ record.name }}</span>
                  <span class="sub-text">{{ record.position }}</span>
                </div>
              </td>
              <td>{{ record.dept }}</td>
              <td>{{ record.date }}</td>
              <td>{{ record.checkIn || '-' }}</td>
              <td>{{ record.checkOut || '-' }}</td>
              <td>{{ record.workHours || '-' }}</td>
              <td>
                <span class="status-badge" :class="record.status">
                  {{ getStatusLabel(record.status) }}
                </span>
              </td>
              <td>
                <button class="btn-text" @click.stop="openEditModal(record)">수정</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Tab 2: Flexible Work & Schedule -->
    <div v-if="currentTab === 'flexible'" class="tab-content">
      <!-- Alerts -->
      <div class="alert-box warning" v-if="hasStaffShortage">
        <div class="alert-icon">⚠️</div>
        <div class="alert-text">
          <strong>코어타임 인원 부족 경고 ({{ days[selectedDayIndex]?.label }})</strong>
          <p>{{ days[selectedDayIndex]?.date }} 14:00 - 16:00 구간에 근무 인원이 부족합니다. 승인 시 주의바랍니다.</p>
        </div>
      </div>

      <div class="sub-tabs">
        <button class="sub-tab-btn" :class="{ active: flexViewMode === 'list' }" @click="flexViewMode = 'list'">신청 목록</button>
        <button class="sub-tab-btn" :class="{ active: flexViewMode === 'timeline' }" @click="flexViewMode = 'timeline'">스케줄 뷰 (타임라인)</button>
      </div>

      <!-- List View -->
      <div v-if="flexViewMode === 'list'" class="card">
        <div class="action-bar top-actions">
           <div class="left">
             <span class="count-label">신청 <strong>{{ pendingFlexCount }}</strong>건</span>
           </div>
           <div class="right">
             <button class="btn-approve" @click="bulkApprove" :disabled="selectedFlexIds.length === 0">일괄 승인</button>
             <button class="btn-reject" @click="bulkReject" :disabled="selectedFlexIds.length === 0">일괄 반려</button>
           </div>
        </div>
        <table class="data-table">
          <thead>
            <tr>
              <th width="40"><input type="checkbox" @change="toggleAllFlex" :checked="isAllFlexSelected" /></th>
              <th>이름</th>
              <th>부서</th>
              <th>신청 주간</th>
              <th>유형</th>
              <th>사유</th>
              <th>상태</th>
              <th>상세</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="req in flexibleRequests" :key="req.id">
              <td><input type="checkbox" :value="req.id" v-model="selectedFlexIds" :disabled="req.status !== 'pending'" /></td>
              <td>{{ req.name }} {{ req.position }}</td>
              <td>{{ req.dept }}</td>
              <td>{{ req.period }}</td>
              <td>{{ req.type }}</td>
              <td>{{ req.reason }}</td>
              <td><span class="status-badge" :class="req.status">{{ getFlexStatusLabel(req.status) }}</span></td>
              <td><button class="btn-text">보기</button></td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Timeline View -->
      <div v-if="flexViewMode === 'timeline'" class="card timeline-card">
        <!-- Day Navigation -->
        <div class="day-nav-wrapper">
           <div class="week-title">2026년 2월 3주차 (다음 주 계획)</div>
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
              <!-- Core Time Background (14:00-16:00) -->
              <div class="core-time-bg" 
                   style="left: calc(200px + (14 - 8) * (100% - 200px) / 12); width: calc(2 * (100% - 200px) / 12);">
              </div>
              
              <!-- User Rows -->
              <div class="timeline-row" v-for="user in timelineData" :key="user.id">
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
              <div v-if="timelineData.length === 0" class="timeline-empty">해당 주차의 유연근무 신청이 없습니다.</div>
           </div>
        </div>
      </div>
    </div>

    <!-- Edit Modal (Daily Attendance) -->
    <div v-if="showEditModal" class="modal-overlay" @click.self="closeEditModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>근태 기록 수정</h3>
          <button class="btn-close" @click="closeEditModal">&times;</button>
        </div>
        <div class="modal-body">
          <div class="info-row">
            <span class="label">대상자</span>
            <span class="value">{{ editingRecord.name }} {{ editingRecord.position }}</span>
          </div>
          <div class="info-row">
             <span class="label">일자</span>
             <span class="value">{{ editingRecord.date }}</span>
          </div>
          
          <div class="form-group-row">
             <div class="form-col">
               <label>출근 시각</label>
               <input type="time" v-model="editForm.checkIn" />
             </div>
             <div class="form-col">
               <label>퇴근 시각</label>
               <input type="time" v-model="editForm.checkOut" />
             </div>
          </div>
          
          <div class="form-group">
            <label>수정 사유 <span class="required">*</span></label>
            <textarea v-model="editForm.reason" placeholder="수정 사유를 반드시 입력해주세요." rows="3"></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="closeEditModal">취소</button>
          <button class="btn-primary" @click="saveRecord">저장</button>
        </div>
      </div>
    </div>

  </div>
  <ActionConfirmModal
    v-model="showFlexActionModal"
    :title="flexActionRequiresReason ? '반려 처리' : '승인 처리'"
    :message="`${selectedFlexIds.length}건을 ${flexActionRequiresReason ? '반려' : '승인'}하시겠습니까?`"
    :confirm-text="flexActionRequiresReason ? '반려하기' : '승인하기'"
    :require-reason="flexActionRequiresReason"
    v-model:reason="flexActionReason"
    @confirm="submitFlexAction"
  />
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useAttendanceStore } from '@/store/attendance'
import ActionConfirmModal from '@/components/common/ActionConfirmModal.vue'

const store = useAttendanceStore()

const currentTab = ref('daily')
const flexViewMode = ref('list')
const filterDate = ref(new Date().toISOString().slice(0, 10))
const filterStatus = ref('all')
const showFlexActionModal = ref(false)
const flexActionReason = ref('')
const flexActionMode = ref('approve')

const statusMap = {
  normal: '정상',
  tardy: '지각',
  absent: '결근',
  vacation: '휴가',
  early_leave: '조퇴',
}

const getStatusLabel = (status) => statusMap[status] || status
const getFlexStatusLabel = (status) =>
  ({ pending: '승인 대기', approved: '승인', rejected: '반려' }[status] || status)

const filteredDailyRecords = computed(() => {
  if (filterStatus.value === 'all') {
    return store.dailyAttendance
  }
  return store.dailyAttendance.filter((record) => record.status === filterStatus.value)
})

const showEditModal = ref(false)
const editingRecord = ref(null)
const editForm = ref({ checkIn: '', checkOut: '', reason: '' })

const openEditModal = (record) => {
  editingRecord.value = record
  editForm.value = {
    checkIn: record.checkIn || '',
    checkOut: record.checkOut || '',
    reason: '',
  }
  showEditModal.value = true
}

const closeEditModal = () => {
  showEditModal.value = false
  editingRecord.value = null
}

const saveRecord = async () => {
  if (!editForm.value.reason.trim()) {
    alert('수정 사유를 입력해주세요.')
    return
  }

  try {
    await store.updateDailyAttendance({
      targetEmployeeId: editingRecord.value.userId,
      workDate: editingRecord.value.date,
      newCheckInTime: editForm.value.checkIn || null,
      newCheckOutTime: editForm.value.checkOut || null,
      newStatus: editingRecord.value.status.toUpperCase(),
      modifyReason: editForm.value.reason,
    })
    alert('수정되었습니다.')
    closeEditModal()
  } catch (error) {
    alert(error?.response?.data?.message || '수정에 실패했습니다.')
  }
}

const fetchDailyRecords = async () => {
  await store.fetchAdminDailyAttendanceList({
    startDate: filterDate.value,
    endDate: filterDate.value,
    status: filterStatus.value === 'all' ? null : filterStatus.value,
  })
}

const selectedFlexIds = ref([])
const flexibleRequests = computed(() => store.flexibleWorkPlans)
const overviewDays = computed(() => store.teamWeeklyOverview?.days || [])
const pendingFlexCount = computed(
  () => flexibleRequests.value.filter((record) => record.status === 'pending').length,
)
const isAllFlexSelected = computed(() => {
  const pendingIds = flexibleRequests.value
    .filter((record) => record.status === 'pending')
    .map((record) => record.id)
  return pendingIds.length > 0 && pendingIds.every((id) => selectedFlexIds.value.includes(id))
})

const toggleAllFlex = (event) => {
  if (event.target.checked) {
    selectedFlexIds.value = flexibleRequests.value
      .filter((record) => record.status === 'pending')
      .map((record) => record.id)
    return
  }
  selectedFlexIds.value = []
}

const bulkApprove = async () => {
  if (!selectedFlexIds.value.length) {
    return
  }
  flexActionMode.value = 'approve'
  flexActionReason.value = ''
  showFlexActionModal.value = true
}

const bulkReject = async () => {
  if (!selectedFlexIds.value.length) {
    return
  }
  flexActionMode.value = 'reject'
  flexActionReason.value = ''
  showFlexActionModal.value = true
}

const flexActionRequiresReason = computed(() => flexActionMode.value === 'reject')

const submitFlexAction = async () => {
  if (flexActionRequiresReason.value && !flexActionReason.value.trim()) {
    alert('반려 사유를 입력해주세요.')
    return
  }
  await store.processFlexiblePlans(
    selectedFlexIds.value,
    flexActionMode.value === 'approve',
    flexActionRequiresReason.value ? flexActionReason.value.trim() : '',
  )
  selectedFlexIds.value = []
  showFlexActionModal.value = false
}

const hours = Array.from({ length: 13 }, (_, i) => i + 8)
const selectedDayIndex = ref(0)

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

const parseTime = (timeText) => {
  const [hour, minute] = timeText.split(':').map(Number)
  return hour + minute / 60
}

const mapPlanType = (plan) => {
  const workForm = String(plan.type || '').toUpperCase()
  if (workForm.includes('OFFICE')) return 'normal'
  if (workForm.includes('SHORT')) return 'short'
  return 'flex'
}

const days = computed(() =>
  Array.from({ length: 5 }, (_, idx) => {
    const planDate = overviewDays.value[idx]?.planDate
    const date = planDate ? parseIsoDate(planDate) : new Date()
    return {
      label: ['월', '화', '수', '목', '금'][idx],
      date: formatDateNumber(date),
      fullDate: planDate || toDateKey(date),
      hasIssue: Boolean(overviewDays.value[idx]?.coreTimeShortageRisk),
    }
  }),
)

const timelineData = computed(() => {
  const grouped = new Map()

  overviewDays.value.forEach((day, dayIndex) => {
    ;(day.entries || []).forEach((item) => {
      if (!grouped.has(item.userId)) {
        grouped.set(item.userId, {
          id: item.userId,
          name: item.name,
          position: item.position,
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

const getTimeClass = (day) => {
  if (!day) return 'pill-gray'
  if (day.type === 'normal') return 'pill-blue'
  if (day.type === 'flex') return 'pill-green'
  return 'pill-gray'
}

const getTypeLabel = (type) => ({ normal: '기본', flex: '유연', short: '단축' }[type] || type)

const getBarStyle = (day) => {
  if (!day) return { left: '0%', width: '0%' }
  const start = parseTime(day.start)
  const end = parseTime(day.end)
  const duration = end - start
  const startOffset = start - 8
  return {
    left: `${(startOffset / 12) * 100}%`,
    width: `${(duration / 12) * 100}%`,
  }
}

onMounted(async () => {
  const today = new Date().toISOString().slice(0, 10)
  await Promise.all([fetchDailyRecords(), store.fetchTeamFlexibleWorkPlans(), store.fetchTeamWeeklyOverview(today)])
})
</script>

<style scoped>
.team-manage-page { padding: 32px; background: var(--background-gray); min-height: 100vh; display: flex; flex-direction: column; gap: 24px; }
.page-header { margin-bottom: 8px; }
.page-title { font-size: 1.5rem; font-weight: 700; color: var(--gray900); }
.page-description { color: var(--gray600); font-size: 0.95rem; margin-top: 4px; }

/* Tabs */
.tabs-container { display: flex; gap: 8px; border-bottom: 2px solid var(--gray200); }
.tab-btn { padding: 12px 24px; background: none; border: none; font-size: 1rem; color: var(--gray500); cursor: pointer; font-weight: 600; border-bottom: 2px solid transparent; margin-bottom: -2px; }
.tab-btn.active { color: var(--primary); border-bottom-color: var(--primary); }

.tab-content { display: flex; flex-direction: column; gap: 20px; }

/* Filter Card */
.filter-card { background: #fff; padding: 20px; border-radius: 12px; border: 1px solid var(--gray200); }
.filter-row { display: flex; align-items: flex-end; gap: 16px; }
.filter-group { display: flex; flex-direction: column; gap: 6px; }
.filter-group label { font-size: 0.9rem; font-weight: 600; color: var(--gray700); }
.form-select, .form-input { padding: 10px; border: 1px solid var(--gray300); border-radius: 6px; min-width: 140px; }
.btn-search { background: var(--gray800); color: #fff; border: none; padding: 10px 24px; border-radius: 6px; cursor: pointer; font-weight: 600; align-self: flex-end; }

/* Table Card */
.table-card { background: #fff; border-radius: 12px; border: 1px solid var(--gray200); padding: 0; overflow: hidden; }
.data-table { width: 100%; border-collapse: collapse; }
.data-table th { background: var(--gray50); padding: 14px 20px; text-align: left; font-size: 0.9rem; color: var(--gray600); font-weight: 600; border-bottom: 1px solid var(--gray200); }
.data-table td { padding: 16px 20px; border-bottom: 1px solid var(--gray100); color: var(--gray800); vertical-align: middle; }
.data-table tr.row-warning { background: #FFFBEB; }
.data-table tr.row-danger { background: #FEF2F2; }
.data-table tr:hover { background: var(--gray50); cursor: pointer; }

/* Status Badges */
.status-badge { padding: 4px 10px; border-radius: 20px; font-size: 0.8rem; font-weight: 700; }
.status-badge.normal { background: #ECFDF5; color: #059669; }
.status-badge.tardy { background: #FFFBEB; color: #B45309; }
.status-badge.absent { background: #FEF2F2; color: #B91C1C; }
.status-badge.vacation { background: #EFF6FF; color: #1D4ED8; }
.status-badge.pending { background: #FFF7ED; color: #C2410C; }
.status-badge.approved { background: #ECFDF5; color: #047857; }
.status-badge.rejected { background: #FEF2F2; color: #B91C1C; }

/* User Cell */
.user-cell { display: flex; align-items: center; gap: 10px; }
.avatar-sm { width: 32px; height: 32px; background: #E0E7FF; color: var(--primary); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.8rem; }
.font-bold { font-weight: 600; }
.sub-text { font-size: 0.8rem; color: var(--gray500); }

/* Timeline Styles (Reused) */
.timeline-card { padding: 24px; background: #fff; border-radius: 12px; border: 1px solid var(--gray200); }
.timeline-container { display: flex; flex-direction: column; margin-top: 24px; }
/* ... (Timeline styles similar to previous step) ... */
.day-nav-wrapper { display: flex; flex-direction: column; gap: 16px; border-bottom: 1px solid var(--gray200); padding-bottom: 16px; }
.week-title { font-weight: 700; font-size: 1.1rem; }
.day-tabs { display: flex; gap: 8px; }
.day-tab { flex: 1; padding: 12px; border: 1px solid var(--gray200); border-radius: 8px; background: #fff; display: flex; flex-direction: column; align-items: center; cursor: pointer; position: relative; }
.day-tab:hover { background: var(--gray50); }
.day-tab.active { border-color: var(--primary); background: #EEF2FF; color: var(--primary); }
.day-tab.has-issue .dot-indicator { position: absolute; top: 8px; right: 8px; width: 6px; height: 6px; background: var(--red); border-radius: 50%; }

.timeline-header { display: flex; padding-left: 200px; margin-bottom: 16px; position: relative; }
.th-name { position: absolute; left: 0; bottom: 0; font-weight: 700; color: var(--gray500); }
.th-hours { display: flex; flex: 1; justify-content: space-between; }
.th-hour { font-size: 0.8rem; color: var(--gray400); transform: translateX(-50%); }

.timeline-body { position: relative; display: flex; flex-direction: column; gap: 12px; }
.core-time-bg { position: absolute; top: 0; bottom: 0; background: rgba(255,200,0,0.05); border-left: 1px dashed orange; border-right: 1px dashed orange; z-index: 1; pointer-events: none; }
.timeline-row { display: flex; align-items: center; height: 48px; position: relative; z-index: 2; }
.tl-name-cell { width: 200px; display: flex; gap: 10px; align-items: center; flex-shrink: 0; }
.tl-track-cell { flex: 1; position: relative; height: 100%; }
.empty-bar { height: 100%; display: flex; align-items: center; color: var(--gray400); padding-left: 12px; font-size: 0.85rem; }
.timeline-empty { padding: 24px 0; text-align: center; color: var(--gray500); }

.time-bar-pill { position: absolute; top: 8px; height: 32px; border-radius: 16px; display: flex; align-items: center; justify-content: space-between; padding: 0 12px; color: #fff; font-size: 0.8rem; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
.pill-blue { background: #3B82F6; }
.pill-green { background: #10B981; }
.pill-gray { background: #94A3B8; }

/* Sub Tabs & Alert */
.sub-tabs { display: flex; gap: 12px; margin-bottom: 16px; }
.sub-tab-btn { padding: 8px 16px; border-radius: 20px; border: 1px solid var(--gray300); background: #fff; cursor: pointer; font-size: 0.9rem; }
.sub-tab-btn.active { background: var(--gray800); color: #fff; border-color: var(--gray800); }

.alert-box { background: #FEF2F2; border: 1px solid #FECACA; padding: 16px; border-radius: 8px; display: flex; gap: 12px; margin-bottom: 16px; color: #991B1B; }
.alert-icon { font-size: 1.2rem; }

.action-bar { display: flex; justify-content: space-between; align-items: center; padding: 16px; border-bottom: 1px solid var(--gray100); }
.btn-approve { background: var(--primary); color: #fff; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; margin-right: 8px; }
.btn-approve:disabled { background: var(--gray300); cursor: not-allowed; }
.btn-reject { background: #fff; border: 1px solid var(--red); color: var(--red); padding: 8px 16px; border-radius: 6px; cursor: pointer; }
.btn-reject:disabled { border-color: var(--gray300); color: var(--gray400); cursor: not-allowed; }

/* Modal */
.modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 1000; display: flex; align-items: center; justify-content: center; }
.modal-content { background: #fff; width: 400px; padding: 24px; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); }
.modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.modal-header h3 { font-size: 1.2rem; font-weight: 700; }
.btn-close { background: none; border: none; font-size: 1.5rem; cursor: pointer; }
.info-row { display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 0.95rem; }
.info-row .label { color: var(--gray500); }
.form-group-row { display: flex; gap: 12px; margin-bottom: 16px; }
.form-col { flex: 1; display: flex; flex-direction: column; gap: 6px; }
.form-col input { padding: 10px; border: 1px solid var(--gray300); border-radius: 6px; }
.form-group { display: flex; flex-direction: column; gap: 6px; margin-bottom: 24px; }
.form-group textarea { padding: 10px; border: 1px solid var(--gray300); border-radius: 6px; resize: none; }
.modal-footer { display: flex; justify-content: flex-end; gap: 8px; }
.btn-secondary { background: var(--gray100); color: var(--gray700); border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; }
.required { color: var(--red); }
</style>
