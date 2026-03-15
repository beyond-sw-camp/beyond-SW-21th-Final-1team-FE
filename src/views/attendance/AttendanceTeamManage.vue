<template>
  <div class="team-manage-page">
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">팀 일일 근태 현황</h1>
        <p class="page-description">
          같은 부서 팀원의 일일 근태 현황을 확인하고 필요한 경우 출퇴근 시각을 수정할 수 있습니다.
        </p>
      </div>
    </div>

    <div class="inline-alert team-scope">
      현재 로그인한 사용자의 같은 부서 팀원만 조회됩니다. 다른 부서 구성원은 표시되지 않습니다.
    </div>

    <div v-if="pageError" class="inline-alert error">
      {{ pageError }}
    </div>

    <div v-else-if="isPageLoading" class="inline-alert info">
      팀 근태 데이터를 불러오는 중입니다.
    </div>

    <div v-if="saveNotice" class="inline-alert success">
      {{ saveNotice }}
    </div>

    <div v-if="saveError" class="inline-alert error">
      {{ saveError }}
    </div>

    <div class="tab-content">
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
              <option value="early_leave">조퇴</option>
              <option value="absent">결근</option>
              <option value="vacation">휴가</option>
            </select>
          </div>
          <button class="btn-search" :disabled="dailyLoading" @click="fetchDailyRecords">
            {{ dailyLoading ? '조회 중...' : '조회' }}
          </button>
        </div>
        <div class="filter-summary">
          조회 기준일: <strong>{{ filterDate }}</strong>
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
            <tr v-if="filteredDailyRecords.length === 0">
              <td colspan="8" class="empty-row">선택한 날짜에 조회된 팀 근태 기록이 없습니다.</td>
            </tr>
            <tr
              v-for="record in filteredDailyRecords"
              :key="record.id"
              :class="{
                'row-warning': record.status === 'tardy' || record.status === 'early_leave',
                'row-danger': record.status === 'absent',
              }"
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
          <button class="btn-secondary" :disabled="saveLoading" @click="closeEditModal">취소</button>
          <button class="btn-primary" :disabled="saveLoading" @click="saveRecord">
            {{ saveLoading ? '저장 중...' : '저장' }}
          </button>
        </div>
      </div>
    </div>

</div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useAttendanceStore } from '@/store/attendance'

const store = useAttendanceStore()

function toDateKey(value) {
  const year = value.getFullYear()
  const month = String(value.getMonth() + 1).padStart(2, '0')
  const day = String(value.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const filterDate = ref(toDateKey(new Date()))
const filterStatus = ref('all')
const isPageLoading = ref(false)
const dailyLoading = ref(false)
const saveLoading = ref(false)
const pageError = ref('')
const saveNotice = ref('')
const saveError = ref('')
let noticeTimer = null

const statusMap = {
  normal: '정상',
  tardy: '지각',
  absent: '결근',
  vacation: '휴가',
  early_leave: '조퇴',
}

const getStatusLabel = (status) => statusMap[status] || status

const filteredDailyRecords = computed(() => {
  if (filterStatus.value !== 'all') {
    return store.dailyAttendance.filter((record) => record.status === filterStatus.value)
  }
  return store.dailyAttendance
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
  saveError.value = ''
}

const saveRecord = async () => {
  if (!editForm.value.reason.trim()) {
    saveError.value = '수정 사유를 입력해주세요.'
    return
  }

  try {
    saveLoading.value = true
    saveError.value = ''
    await store.updateDailyAttendance({
      targetEmployeeId: editingRecord.value.userId,
      workDate: editingRecord.value.date,
      newCheckInTime: editForm.value.checkIn || null,
      newCheckOutTime: editForm.value.checkOut || null,
      newStatus: editingRecord.value.status.toUpperCase(),
      modifyReason: editForm.value.reason,
    })
    await fetchDailyRecords({ propagate: true })
    saveNotice.value = `${editingRecord.value.name} 팀원의 근태 기록을 수정했습니다.`
    if (noticeTimer) {
      window.clearTimeout(noticeTimer)
    }
    noticeTimer = window.setTimeout(() => {
      saveNotice.value = ''
      noticeTimer = null
    }, 2600)
    closeEditModal()
  } catch (error) {
    saveError.value = error?.response?.data?.message || '근태 기록 수정에 실패했습니다.'
  } finally {
    saveLoading.value = false
  }
}

const fetchDailyRecords = async ({ propagate = false } = {}) => {
  dailyLoading.value = true
  pageError.value = ''
  try {
    await store.fetchAdminDailyAttendanceList({
      startDate: filterDate.value,
      endDate: filterDate.value,
      status: filterStatus.value === 'all' ? null : filterStatus.value,
    })
  } catch (error) {
    pageError.value = error?.response?.data?.message || '일일 근태 현황을 불러오지 못했습니다.'
    if (propagate) {
      throw error
    }
  } finally {
    dailyLoading.value = false
  }
}

onMounted(async () => {
  isPageLoading.value = true
  pageError.value = ''
  try {
    await fetchDailyRecords({ propagate: true })
  } catch (_error) {
    pageError.value = '팀 근태 데이터를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.'
  }
  isPageLoading.value = false
})

onUnmounted(() => {
  if (noticeTimer) {
    window.clearTimeout(noticeTimer)
    noticeTimer = null
  }
})
</script>

<style scoped>
.team-manage-page { padding: 32px; background: var(--background-gray); min-height: 100vh; display: flex; flex-direction: column; gap: 24px; }
.inline-alert { border-radius: 12px; padding: 14px 16px; font-size: 0.95rem; font-weight: 600; }
.inline-alert.info { background: #EFF6FF; color: #1D4ED8; }
.inline-alert.error { background: #FEF2F2; color: #B91C1C; }
.inline-alert.success { background: #ECFDF5; color: #047857; }
.inline-alert.team-scope { background: #F8FAFC; color: #475569; border: 1px solid var(--gray200); }
.page-header { margin-bottom: 8px; }
.page-title { font-size: 1.5rem; font-weight: 700; color: var(--gray900); }
.page-description { color: var(--gray600); font-size: 0.95rem; margin-top: 4px; }

.tab-content { display: flex; flex-direction: column; gap: 20px; }

/* Filter Card */
.filter-card { background: #fff; padding: 20px; border-radius: 12px; border: 1px solid var(--gray200); }
.filter-row { display: flex; align-items: flex-end; gap: 16px; }
.filter-summary { margin-top: 12px; font-size: 0.9rem; color: var(--gray600); }
.filter-summary strong { color: var(--gray900); font-weight: 700; }
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
.data-table tr:hover { background: var(--gray50); }
.empty-row { text-align: center; color: var(--gray500); padding: 36px 20px; }

/* Status Badges */
.status-badge { padding: 4px 10px; border-radius: 20px; font-size: 0.8rem; font-weight: 700; }
.status-badge.normal { background: #ECFDF5; color: #059669; }
.status-badge.tardy { background: #FFFBEB; color: #B45309; }
.status-badge.early_leave { background: #FFF7ED; color: #C2410C; }
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
.btn-secondary:disabled,
.btn-primary:disabled,
.btn-search:disabled { opacity: 0.6; cursor: not-allowed; }
.required { color: var(--red); }
</style>
