<template>
  <div class="attendance-manage">
    <!-- Header -->
    <div class="page-header">
      <div class="header-content">
        <h2 class="page-title">근태 관리</h2>
        <p class="page-desc">팀원들의 근태 현황을 확인하고 관리할 수 있습니다.</p>
      </div>
    </div>

    <!-- Tabs -->
    <div class="tabs-container">
      <button 
        class="tab-btn" 
        :class="{ active: currentTab === 'daily' }"
        @click="currentTab = 'daily'"
      >
        📅 일별 근태 현황
      </button>
      <button 
        class="tab-btn" 
        :class="{ active: currentTab === 'approval' }"
        @click="currentTab = 'approval'"
      >
        ✅ 휴가 승인 관리
      </button>
    </div>

    <!-- Tab 1: Daily Attendance Grid -->
    <div v-show="currentTab === 'daily'" class="tab-content">
      <!-- Filters -->
      <div class="filter-card">
        <div class="filter-row">

          <div class="filter-group">
            <label>기간</label>
            <div class="date-range-row">
              <input type="date" v-model="filters.startDate" class="date-input" />
              <span class="tilde">~</span>
              <input type="date" v-model="filters.endDate" class="date-input" />
            </div>
          </div>
          <div class="filter-group">
            <label>근태 상태</label>
            <select v-model="filters.status" class="select-input">
              <option value="">전체 상태</option>
              <option value="normal">정상</option>
              <option value="late">지각</option>
              <option value="absent">결근</option>
              <option value="leave">휴가</option>
            </select>
          </div>
          <button class="btn-search" @click="fetchData">조회</button>
        </div>
      </div>

      <!-- Data Grid -->
      <div class="data-card">
        <div class="card-header">
          <span class="total-count">총 <strong>{{ filteredList.length }}</strong>건</span>
          <div class="actions">
            <button class="btn-excel">엑셀 다운로드</button>
          </div>
        </div>
        
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>사원명</th>
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
                v-for="item in filteredList" 
                :key="item.id"
                :class="{ 'row-alert': isAbnormal(item.status) }"
              >
                <td>
                  <div class="user-cell">
                    <div class="avatar">{{ item.name[0] }}</div>
                    <div class="user-info">
                      <span class="name">{{ item.name }}</span>
                      <span class="position">{{ item.position }}</span>
                    </div>
                  </div>
                </td>
                <td>개발팀</td>
                <td>{{ item.date }}</td>
                <td>{{ item.checkIn || '-' }}</td>
                <td>{{ item.checkOut || '-' }}</td>
                <td>{{ item.workHours || '-' }}</td>
                <td>
                  <span class="status-badge" :class="getStatusClass(item.status)">
                    {{ getStatusLabel(item.status) }}
                  </span>
                </td>
                <td>
                  <button class="btn-edit" @click="openEditModal(item)">수정</button>
                </td>
              </tr>
              <tr v-if="filteredList.length === 0">
                <td colspan="8" class="empty-cell">데이터가 없습니다.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Tab 2: Leave Approval -->
    <div v-show="currentTab === 'approval'" class="tab-content">
      <div class="data-card">
        <div class="card-header">
          <h3 class="card-subtitle">휴가 신청 내역</h3>
          <div class="actions">
            <!-- Bulk Actions -->
            <button 
              class="btn-approve" 
              :disabled="selectedLeaveIds.length === 0"
              @click="handleBulkLeaveApprove"
            >
              승인
            </button>
            <button 
              class="btn-reject" 
              :disabled="selectedLeaveIds.length === 0"
              @click="handleBulkLeaveReject"
            >
              반려
            </button>
          </div>
        </div>
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th width="40"><input type="checkbox" @change="toggleAllLeave" :checked="isAllLeaveSelected"/></th>
                <th>사원명</th>
                <th>부서</th>
                <th>신청 휴가</th>
                <th>기간</th>
                <th>일수</th>
                <th>사유</th>
                <th>상태</th>
                <th>신청일</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="leave in sortedLeaveList" :key="leave.id">
                <td>
                   <input 
                    type="checkbox" 
                    :value="leave.id" 
                    v-model="selectedLeaveIds" 
                    :disabled="leave.status !== 'pending'"
                  />
                </td>
                <td>
                  <div class="user-cell">
                    <div class="avatar blue">{{ leave.name[0] }}</div>
                    <div class="user-info">
                      <span class="name">{{ leave.name }}</span>
                      <span class="position">{{ leave.position }}</span>
                    </div>
                  </div>
                </td>
                <td>{{ leave.deptName }}</td>
                <td><span class="tag-gray">{{ leave.type }}</span></td>
                <td>{{ leave.period }}</td>
                <td>{{ leave.days }}일</td>
                <td>{{ leave.reason }}</td>
                <td>
                  <span class="status-badge" :class="getApprStatusClass(leave.status)">
                    {{ getApprStatusLabel(leave.status) }}
                  </span>
                </td>
                <td>{{ leave.appliedAt }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Edit Modal (Daily) -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>근태 데이터 수정</h3>
          <button class="close-btn" @click="closeModal">×</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>사원명</label>
            <input type="text" :value="selectedItem.name" disabled class="disabled-input" />
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>출근 시각</label>
              <input type="time" v-model="editForm.checkIn" />
            </div>
            <div class="form-group">
              <label>퇴근 시각</label>
              <input type="time" v-model="editForm.checkOut" />
            </div>
          </div>
          <div class="form-group">
            <label>상태 변경</label>
            <select v-model="editForm.status">
              <option value="normal">정상</option>
              <option value="late">지각</option>
              <option value="absent">결근</option>
              <option value="leave">휴가</option>
            </select>
          </div>
          <div class="form-group">
            <label class="required">수정 사유</label>
            <textarea 
              v-model="editForm.reason" 
              placeholder="수정 사유를 반드시 입력해주세요."
              rows="3"
            ></textarea>
            <p v-if="errors.reason" class="error-text">사유는 필수 입력입니다.</p>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" @click="closeModal">취소</button>
          <button class="btn-save" @click="saveChanges">저장</button>
        </div>
      </div>
    </div>

     <!-- Reject Modal (Leave) -->
    <div v-if="showRejectModal" class="modal-overlay" @click.self="closeRejectModal">
      <div class="modal-content sm">
        <div class="modal-header">
          <h3>반려 사유 입력</h3>
          <button class="close-btn" @click="closeRejectModal">×</button>
        </div>
        <div class="modal-body">
           <div class="info-text mb-4">
             선택하신 {{ selectedLeaveIds.length }}건의 휴가 신청을 반려합니다.
           </div>
           <div class="form-group">
            <label class="required">반려 사유</label>
            <textarea v-model="rejectReason" rows="3" placeholder="반려 사유를 입력하세요."></textarea>
           </div>
        </div>
        <div class="modal-footer">
           <button class="btn-cancel" @click="closeRejectModal">취소</button>
           <button class="btn-save red-btn" @click="submitReject">반려하기</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAttendanceStore } from '@/store/attendance'

const store = useAttendanceStore()
const currentTab = ref('daily')

// --- State (Daily) ---
const filters = ref({
  dept: '',
  startDate: '',
  endDate: '',
  status: ''
})

const appliedFilters = ref({
  startDate: '',
  endDate: '',
  status: ''
})

const showModal = ref(false)
const selectedItem = ref(null)
const editForm = ref({
  checkIn: '',
  checkOut: '',
  status: '',
  reason: ''
})
const errors = ref({})

// --- State (Leave) ---
const selectedLeaveIds = ref([])
const showRejectModal = ref(false)
const rejectReason = ref('')

// --- Computed (Daily) ---
const filteredList = computed(() => {
  return store.dailyAttendance.filter(item => {
    // Status Filter
    if (appliedFilters.value.status && item.status !== appliedFilters.value.status) return false
    
    // Date Range Filter
    if (appliedFilters.value.startDate && item.date < appliedFilters.value.startDate) return false
    if (appliedFilters.value.endDate && item.date > appliedFilters.value.endDate) return false
    
    return true
  })
})

const isAbnormal = (status) => ['late', 'absent'].includes(status)

const getStatusLabel = (status) => {
  const map = { normal: '정상', late: '지각', absent: '결근', leave: '휴가' }
  return map[status] || status
}

const getStatusClass = (status) => {
  const map = { normal: 'badge-green', late: 'badge-red', absent: 'badge-gray', leave: 'badge-blue' }
  return map[status] || ''
}

// --- Computed (Leave) ---
// Sort by pending first for better admin UX
const sortedLeaveList = computed(() => {
  return [...store.leaveRequests].sort((a, b) => {
    if (a.status === 'pending' && b.status !== 'pending') return -1
    if (a.status !== 'pending' && b.status === 'pending') return 1
    return 0
  })
})

const getApprStatusLabel = (s) => ({ pending: '대기', approved: '승인', rejected: '반려' }[s])
const getApprStatusClass = (s) => ({ pending: 'badge-warning', approved: 'badge-green', rejected: 'badge-red' }[s])

const isAllLeaveSelected = computed(() => {
  const pending = sortedLeaveList.value.filter(l => l.status === 'pending')
  return pending.length > 0 && selectedLeaveIds.value.length === pending.length
})

// --- Methods (Daily) ---
const fetchData = () => {
  appliedFilters.value = { ...filters.value }
  console.log('Fetching data with filters:', appliedFilters.value)
}

const openEditModal = (item) => {
  selectedItem.value = item
  editForm.value = {
    checkIn: item.checkIn || '',
    checkOut: item.checkOut || '',
    status: item.status,
    reason: ''
  }
  errors.value = {}
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  selectedItem.value = null
}

const saveChanges = () => {
  if (!editForm.value.reason.trim()) {
    errors.value.reason = true
    return
  }
  
  store.updateDailyAttendance(selectedItem.value.id, {
    checkIn: editForm.value.checkIn || null,
    checkOut: editForm.value.checkOut || null,
    status: editForm.value.status
  })
  
  alert('수정되었습니다.')
  closeModal()
}

// --- Methods (Leave) ---
const toggleAllLeave = (e) => {
  if (e.target.checked) {
    selectedLeaveIds.value = sortedLeaveList.value.filter(l => l.status === 'pending').map(l => l.id)
  } else {
    selectedLeaveIds.value = []
  }
}

const handleBulkLeaveApprove = () => {
  if (!confirm(`${selectedLeaveIds.value.length}건을 승인하시겠습니까?`)) return
  
  selectedLeaveIds.value.forEach(id => {
    store.updateLeaveStatus(id, 'approved')
  })
  
  selectedLeaveIds.value = []
}

const handleBulkLeaveReject = () => {
  rejectReason.value = ''
  showRejectModal.value = true
}

const closeRejectModal = () => {
  showRejectModal.value = false
}

const submitReject = () => {
  if (!rejectReason.value.trim()) {
    alert('반려 사유를 입력해주세요.')
    return
  }
  
  selectedLeaveIds.value.forEach(id => {
    store.updateLeaveStatus(id, 'rejected', rejectReason.value)
  })
  
  selectedLeaveIds.value = []
  showRejectModal.value = false
  alert('반려 처리되었습니다.')
}
</script>

<style scoped>
.attendance-manage {
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.page-header {
  display: flex; justify-content: space-between; align-items: flex-end;
}
.page-title { font-size: 1.5rem; font-weight: 700; color: var(--gray900); margin-bottom: 4px; }
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
.tab-content { display: flex; flex-direction: column; gap: 20px; }


/* Filter Card */
.filter-card {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  border: 1px solid var(--gray200);
  box-shadow: 0 4px 12px rgba(0,0,0,0.03);
  transition: transform 0.2s, box-shadow 0.2s;
}
.filter-card:hover {
  box-shadow: 0 6px 16px rgba(0,0,0,0.05);
  transform: translateY(-1px);
}
.filter-row {
  display: flex; gap: 24px; align-items: flex-end; flex-wrap: wrap;
}
.filter-group {
  display: flex; flex-direction: column; gap: 8px; flex: 1; min-width: 180px;
}
.filter-group label {
  font-size: 0.85rem; font-weight: 700; color: var(--gray700);
  text-transform: uppercase; letter-spacing: 0.03em;
}
.date-range-row {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
}
.select-input, .date-input {
  padding: 10px 14px;
  border: 1px solid var(--gray300);
  border-radius: 8px;
  font-size: 0.95rem;
  color: var(--gray800);
  width: 100%;
  transition: border-color 0.2s, box-shadow 0.2s;
  background: #fff;
}
.select-input:focus, .date-input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(var(--primary-rgb), 0.1);
}

.tilde { margin: 0 4px; padding-top: 10px; color: var(--gray400); font-weight: 700; }
.btn-search {
  padding: 10px 24px;
  background: var(--primary);
  color: #fff;
  border: none;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
  margin-left: auto;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  transition: all 0.2s;
}
.btn-search:hover {
  background: #4338ca;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.15);
}

/* Data Card */
.data-card {
  background: #fff;
  border-radius: 12px;
  border: 1px solid var(--gray200);
  display: flex; flex-direction: column;
  min-height: 500px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.03);
  overflow: hidden;
}
.card-header {
  padding: 20px 24px;
  border-bottom: 1px solid var(--gray100);
  display: flex; justify-content: space-between; align-items: center;
  background: #fff;
}
.card-subtitle { font-size: 1.1rem; font-weight: 700; color: var(--gray900); }
.total-count { font-size: 0.95rem; color: var(--gray600); font-weight: 500; }
.total-count strong { color: var(--primary); font-weight: 700; }
.btn-excel {
  padding: 8px 16px;
  border: 1px solid var(--gray300);
  background: #fff;
  border-radius: 6px;
  font-size: 0.9rem;
  color: var(--gray700);
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
  display: flex; align-items: center; gap: 6px;
}
.btn-excel:hover {
  background: var(--gray50);
  border-color: var(--gray400);
  color: var(--gray900);
}

.actions { display: flex; gap: 12px; }
.btn-approve { 
  background: var(--primary); color: #fff; border: none; padding: 8px 18px; 
  border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 0.9rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1); transition: all 0.2s;
}
.btn-approve:hover { background: #4338ca; transform: translateY(-1px); }
.btn-approve:disabled { background: var(--gray300); cursor: not-allowed; transform: none; box-shadow: none; }

.btn-reject { 
  background: #fff; border: 1px solid var(--gray300); color: var(--red); 
  padding: 8px 18px; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 0.9rem;
  transition: all 0.2s;
}
.btn-reject:hover { background: #FEF2F2; border-color: #FECACA; }
.btn-reject:disabled { color: var(--gray400); border-color: var(--gray200); cursor: not-allowed; background: #fff; }


/* Table */
.data-table { width: 100%; border-collapse: collapse; }
.data-table th {
  background: var(--gray50);
  padding: 16px 24px;
  text-align: left;
  font-size: 0.85rem;
  color: var(--gray600);
  font-weight: 700;
  border-bottom: 1px solid var(--gray200);
  text-transform: uppercase;
  letter-spacing: 0.03em;
}
.data-table td {
  padding: 16px 24px;
  border-bottom: 1px solid var(--gray100);
  font-size: 0.95rem;
  color: var(--gray800);
  vertical-align: middle;
  transition: background 0.1s;
}
.data-table tr:hover td { background: var(--gray50); }
.user-cell { display: flex; align-items: center; gap: 12px; }
.avatar {
  width: 36px; height: 36px; background: #E0E7FF; color: var(--primary);
  border-radius: 50%; display: flex; align-items: center; justify-content: center;
  font-size: 0.9rem; font-weight: 700; box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}
.avatar.blue { background: #DBEAFE; color: #1E40AF; }
.user-info { display: flex; flex-direction: column; gap: 2px; }
.name { font-weight: 700; font-size: 0.95rem; color: var(--gray900); }
.position { font-size: 0.8rem; color: var(--gray500); }

.status-badge {
  padding: 6px 10px; border-radius: 6px; font-size: 0.85rem; font-weight: 700;
  display: inline-block; min-width: 60px; text-align: center;
}
.badge-green { background: #DCFCE7; color: #166534; }
.badge-red { background: #FEE2E2; color: #991B1B; }
.badge-gray { background: #F3F4F6; color: #4B5563; }
.badge-blue { background: #EFF6FF; color: #1E40AF; }
.badge-warning { background: #FFF7ED; color: #C2410C; }

.tag-gray { background: var(--gray100); padding: 4px 8px; border-radius: 4px; font-size: 0.85rem; color: var(--gray700); font-weight: 600; }

.row-alert { background: #FEF2F2 !important; }
.row-alert td { border-bottom-color: #FECACA; }
.row-alert:hover td { background: #FEE2E2 !important; }

.btn-edit {
  border: 1px solid var(--gray300); background: #fff;
  padding: 6px 12px; border-radius: 6px; font-size: 0.85rem; cursor: pointer;
  color: var(--gray600); font-weight: 600; transition: all 0.2s;
}
.btn-edit:hover { border-color: var(--gray400); color: var(--gray900); background: var(--gray50); }

/* Modal */
.modal-overlay {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.5);
  backdrop-filter: blur(4px);
  z-index: 1000;
  display: flex; align-items: center; justify-content: center;
}
.modal-content {
  background: #fff;
  width: 480px;
  border-radius: 16px;
  box-shadow: 0 20px 50px rgba(0,0,0,0.15);
  overflow: hidden;
  border: 1px solid rgba(0,0,0,0.05);
}
.modal-content.sm { width: 400px; }

.modal-header {
  padding: 20px 24px; border-bottom: 1px solid var(--gray100);
  display: flex; justify-content: space-between; align-items: center;
  background: var(--gray50);
}
.modal-header h3 { font-size: 1.15rem; font-weight: 700; color: var(--gray900); }
.close-btn { background: none; border: none; font-size: 1.5rem; cursor: pointer; color: var(--gray400); transition: color 0.2s; }
.close-btn:hover { color: var(--gray600); }

.modal-body { padding: 24px; display: flex; flex-direction: column; gap: 20px; }
.form-group label { display: block; font-size: 0.9rem; font-weight: 600; margin-bottom: 8px; color: var(--gray700); }
.required::after { content: '*'; color: var(--red); margin-left: 2px; }
.form-group input, .form-group select, .form-group textarea {
  width: 100%; padding: 12px; border: 1px solid var(--gray300);
  border-radius: 8px; font-size: 0.95rem; transition: border-color 0.2s;
}
.form-group input:focus, .form-group select:focus, .form-group textarea:focus {
  outline: none; border-color: var(--primary); box-shadow: 0 0 0 3px rgba(var(--primary-rgb), 0.1);
}
.disabled-input { background: var(--gray100); color: var(--gray500); cursor: not-allowed; }
.form-row { display: flex; gap: 16px; }
.form-row .form-group { flex: 1; }
.error-text { color: var(--red); font-size: 0.85rem; margin-top: 6px; font-weight: 500; }
.info-text { font-size: 1rem; color: var(--gray800); line-height: 1.5; }
.mb-4 { margin-bottom: 24px; }

.modal-footer {
  padding: 20px 24px; background: var(--gray50);
  display: flex; justify-content: flex-end; gap: 12px; border-top: 1px solid var(--gray100);
}
.btn-cancel {
  padding: 10px 20px; border: 1px solid var(--gray300); background: #fff;
  border-radius: 8px; cursor: pointer; font-weight: 600; color: var(--gray700);
  transition: all 0.2s;
}
.btn-cancel:hover { background: var(--gray100); color: var(--gray900); }
.btn-save {
  padding: 10px 20px; background: var(--primary); color: #fff;
  border: none; border-radius: 8px; font-weight: 600; cursor: pointer;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1); transition: all 0.2s;
}
.btn-save:hover { background: #4338ca; transform: translateY(-1px); }
.red-btn { background: var(--red); }
.red-btn:hover { background: #B91C1C; }

</style>
