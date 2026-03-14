<template>
  <section class="admin-page">
    <div class="layout">
      <article class="card">
        <h3>직원 인사 정보 변경</h3>

        <div class="employee-picker">
          <p>대상 직원 선택</p>
          <div class="picker-row">
            <button type="button" class="btn-pick" @click="showOrgPicker = true">사원 찾기</button>
            <div class="picked-summary" v-if="selectedEmployeeSummary">
              <strong>{{ selectedEmployeeSummary.employeeName }}</strong>
              <span>
                {{ selectedEmployeeSummary.orgName || '-' }} / {{ selectedEmployeeSummary.jobName || '-' }} /
                {{ selectedEmployeeSummary.rankName || '-' }}
              </span>
            </div>
            <div class="picked-summary empty" v-else>선택된 직원이 없습니다.</div>
          </div>
        </div>

        <div class="form-grid">
          <label>
            소속 팀
            <select v-model="editForm.orgId">
              <option :value="''">선택</option>
              <option v-for="item in options.organizations" :key="item.id" :value="item.id">{{ item.name }}</option>
            </select>
          </label>
          <label>
            직무
            <select v-model="editForm.jobId">
              <option :value="''">선택</option>
              <option v-for="item in options.jobs" :key="item.id" :value="item.id">{{ item.name }}</option>
            </select>
          </label>
          <label>
            직책
            <select v-model="editForm.positionId">
              <option :value="''">선택</option>
              <option v-for="item in options.positions" :key="item.id" :value="item.id">{{ item.name }}</option>
            </select>
          </label>
          <label>
            직급
            <select v-model="editForm.rankId">
              <option :value="''">선택</option>
              <option v-for="item in options.ranks" :key="item.id" :value="item.id">{{ item.name }}</option>
            </select>
          </label>
          <label>
            재직 상태
            <select v-model="editForm.employeeState">
              <option :value="''">선택</option>
              <option value="WORK">재직</option>
              <option value="LEAVE">휴직</option>
              <option value="RESIGN">사직</option>
            </select>
          </label>
          <label>
            근무 형태
            <select v-model="editForm.employType">
              <option :value="''">선택</option>
              <option value="REGULAR">정규직</option>
              <option value="NON_REGULAR">비정규직</option>
              <option value="CONTRACT">계약직</option>
            </select>
          </label>
          <label>
            근무지
            <select v-model="editForm.areaId">
              <option :value="''">선택</option>
              <option v-for="item in options.workingAreas" :key="item.id" :value="item.id">{{ item.name }}</option>
            </select>
          </label>
          <label>
            적용일
            <input v-model="editForm.effectiveFrom" type="date" />
          </label>
          <div class="role-picker span-2">
            <p class="role-picker-title">권한 설정 (복수 선택)</p>
            <div class="role-grid">
              <label v-for="item in selectableRoles" :key="item.roleId" class="role-option">
                <input v-model="editForm.roleIds" type="checkbox" :value="String(item.roleId)" />
                <span>{{ item.roleName }}</span>
              </label>
            </div>
            <p class="role-hint">피평가자 권한은 자동으로 포함됩니다.</p>
          </div>
          <label class="span-2">
            변경 사유
            <input v-model.trim="editForm.reason" type="text" placeholder="변경 사유를 입력하세요 (필수)" maxlength="255" />
          </label>
        </div>

        <p class="helper">변경 시 변경 전 정보와 적용일이 인사기록에 자동 저장됩니다.</p>
        <div class="action-row">
          <button class="btn-ghost" type="button" @click="resetEditForm">초기화</button>
          <button class="btn-primary" type="button" :disabled="isApplying || !canApplyChanges" @click="applyHrChanges">
            {{ isApplying ? '적용 중...' : '변경 적용' }}
          </button>
        </div>
      </article>

      <article class="card current-card">
        <h3>현재 인사 정보</h3>
        <div v-if="currentInfo" class="current-box">
          <p><span>이름</span><strong>{{ currentInfo.employeeName }}</strong></p>
          <p><span>소속 팀</span><strong>{{ currentInfo.orgName || '-' }}</strong></p>
          <p><span>직무</span><strong>{{ currentInfo.jobName || '-' }}</strong></p>
          <p><span>직책</span><strong>{{ currentInfo.positionName || '-' }}</strong></p>
          <p><span>직급</span><strong>{{ currentInfo.rankName || '-' }}</strong></p>
          <p><span>재직 상태</span><strong>{{ currentInfo.employeeStateDescription || '-' }}</strong></p>
          <p><span>근무 형태</span><strong>{{ currentInfo.employTypeDescription || '-' }}</strong></p>
          <p><span>근무지</span><strong>{{ currentInfo.areaName || '-' }}</strong></p>
          <p><span>최종 반영일</span><strong class="font-num">{{ dotDate(currentInfo.effectiveFrom) }}</strong></p>
        </div>
        <div v-else class="current-empty">사원을 선택하면 현재 인사 정보가 표시됩니다.</div>
      </article>
    </div>

    <article class="card history-card">
      <h3>인사기록 관리</h3>
      <div class="filter-row">
        <button
          v-for="type in historyTypeOptions"
          :key="type.value"
          type="button"
          class="filter-chip"
          :class="{ active: selectedHistoryType === type.value }"
          @click="selectedHistoryType = type.value"
        >
          {{ type.label }}
        </button>
      </div>

      <table class="table">
        <thead>
          <tr>
            <th>변경 유형</th>
            <th>대상자</th>
            <th>변경 전</th>
            <th>변경 후</th>
            <th>변경일(적용일)</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in historyRecords" :key="item.hrEventId">
            <td>{{ item.eventTypeDescription || item.eventType }}</td>
            <td>{{ item.employeeName || '-' }}</td>
            <td>{{ formatChangedSide(item, 'before') }}</td>
            <td>{{ formatChangedSide(item, 'after') }}</td>
            <td class="font-num">{{ dotDate(item.effectiveFrom) }}</td>
          </tr>
          <tr v-if="historyRecords.length === 0">
            <td colspan="5" class="empty">조건에 맞는 인사기록이 없습니다.</td>
          </tr>
        </tbody>
      </table>
    </article>

    <EmployeePickerModal v-model="showOrgPicker" @select-member="handlePickedMember" />
  </section>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import EmployeePickerModal from '@/components/org/EmployeePickerModal.vue'
import {
  getAdminHrChangeCurrentInfo,
  getAdminHrChangeEvents,
  getAdminHrChangeOptions,
  updateAdminHrChangeEmployee,
} from '@/api/hr'

const showOrgPicker = ref(false)
const selectedEmployeeId = ref(null)
const selectedEmployeeSummary = ref(null)
const currentInfo = ref(null)
const isApplying = ref(false)

const options = reactive({
  organizations: [],
  jobs: [],
  positions: [],
  ranks: [],
  workingAreas: [],
  roles: [],
})

const editForm = reactive({
  orgId: '',
  jobId: '',
  positionId: '',
  rankId: '',
  employeeState: '',
  employType: '',
  areaId: '',
  effectiveFrom: '',
  roleIds: [],
  reason: '',
})

const historyTypeOptions = [
  { label: '전체', value: '' },
  { label: '발령', value: 'TRANSFER' },
  { label: '조직 변경', value: 'ORG_CHANGE' },
  { label: '직책 변경', value: 'POSITION_CHANGE' },
  { label: '직급 변경', value: 'PROMOTION' },
  { label: '재직 상태 변경', value: 'STATE_CHANGE' },
]
const selectedHistoryType = ref('')
const historyRecords = ref([])
const selectableRoles = computed(() =>
  options.roles.filter((role) => String(role.roleCode || '').toUpperCase() !== 'EVALUATEE'),
)
const evaluateeRoleId = computed(() => {
  const row = options.roles.find((role) => String(role.roleCode || '').toUpperCase() === 'EVALUATEE')
  return row?.roleId ? Number(row.roleId) : null
})

const dotDate = (value) => {
  if (!value) return '-'
  return String(value).slice(0, 10).replaceAll('-', '.')
}

const resetEditFormValues = () => {
  editForm.orgId = ''
  editForm.jobId = ''
  editForm.positionId = ''
  editForm.rankId = ''
  editForm.employeeState = ''
  editForm.employType = ''
  editForm.areaId = ''
  editForm.effectiveFrom = ''
  editForm.roleIds = []
  editForm.reason = ''
}

const normalizeRoleIds = (roleIds) => {
  const excludedRoleId = evaluateeRoleId.value
  return [
    ...new Set(
      (Array.isArray(roleIds) ? roleIds : [])
        .map((id) => Number(id))
        .filter((id) => Number.isInteger(id) && id > 0),
    ),
  ]
    .filter((id) => excludedRoleId == null || id !== excludedRoleId)
    .sort((a, b) => a - b)
}

const normalizeRoleIdsAsStrings = (roleIds) => normalizeRoleIds(roleIds).map((id) => String(id))

const parseChangeMap = (text) => {
  const source = String(text || '').trim()
  if (!source) return {}
  return source
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
    .reduce((acc, part) => {
      const index = part.indexOf(':')
      if (index < 0) return acc
      const key = part.slice(0, index).trim()
      const value = part.slice(index + 1).trim()
      if (!key) return acc
      acc[key] = value || '-'
      return acc
    }, {})
}

const getChangedEntries = (item) => {
  const beforeMap = parseChangeMap(item?.beforeChange)
  const afterMap = parseChangeMap(item?.afterChange)
  const keys = [...new Set([...Object.keys(beforeMap), ...Object.keys(afterMap)])]
  return keys.filter((key) => (beforeMap[key] ?? '-') !== (afterMap[key] ?? '-'))
}

const formatChangedSide = (item, side) => {
  const beforeMap = parseChangeMap(item?.beforeChange)
  const afterMap = parseChangeMap(item?.afterChange)
  const changedKeys = getChangedEntries(item)
  if (changedKeys.length === 0) return '-'
  const targetMap = side === 'before' ? beforeMap : afterMap
  return changedKeys
    .map((key) => `${key}:${targetMap[key] ?? '-'}`)
    .join(', ')
}

const syncFormFromCurrentInfo = () => {
  if (!currentInfo.value) {
    resetEditFormValues()
    return
  }
  editForm.orgId = currentInfo.value.orgId ?? ''
  editForm.jobId = currentInfo.value.jobId ?? ''
  editForm.positionId = currentInfo.value.positionId ?? ''
  editForm.rankId = currentInfo.value.rankId ?? ''
  editForm.employeeState = currentInfo.value.employeeState ?? ''
  editForm.employType = currentInfo.value.employType ?? ''
  editForm.areaId = currentInfo.value.areaId ?? ''
  editForm.effectiveFrom = ''
  editForm.roleIds = normalizeRoleIdsAsStrings(currentInfo.value.roleIds)
  editForm.reason = ''
}

const roleIdsChanged = computed(() => {
  if (!currentInfo.value) return false
  const before = normalizeRoleIds(currentInfo.value.roleIds)
  const after = normalizeRoleIds(editForm.roleIds)
  if (before.length !== after.length) return true
  return before.some((id, idx) => id !== after[idx])
})

const changedFieldCount = computed(() => {
  if (!currentInfo.value) return 0
  let count = 0
  if (Number(editForm.orgId || 0) !== Number(currentInfo.value.orgId || 0)) count++
  if (Number(editForm.jobId || 0) !== Number(currentInfo.value.jobId || 0)) count++
  if (Number(editForm.positionId || 0) !== Number(currentInfo.value.positionId || 0)) count++
  if (Number(editForm.rankId || 0) !== Number(currentInfo.value.rankId || 0)) count++
  if (String(editForm.employeeState || '') !== String(currentInfo.value.employeeState || '')) count++
  if (String(editForm.employType || '') !== String(currentInfo.value.employType || '')) count++
  if (Number(editForm.areaId || 0) !== Number(currentInfo.value.areaId || 0)) count++
  if (roleIdsChanged.value) count++
  return count
})

const hasAnyChange = computed(() => {
  return changedFieldCount.value > 0
})

const canApplyChanges = computed(() => {
  if (!selectedEmployeeId.value) return false
  if (!editForm.effectiveFrom) return false
  if (!hasAnyChange.value) return false
  if (!editForm.reason?.trim()) return false
  return true
})

const loadOptions = async () => {
  const data = await getAdminHrChangeOptions()
  options.organizations = Array.isArray(data?.organizations) ? data.organizations : []
  options.jobs = Array.isArray(data?.jobs) ? data.jobs : []
  options.positions = Array.isArray(data?.positions) ? data.positions : []
  options.ranks = Array.isArray(data?.ranks) ? data.ranks : []
  options.workingAreas = Array.isArray(data?.workingAreas) ? data.workingAreas : []
  options.roles = Array.isArray(data?.roles) ? data.roles : []
}

const loadCurrentInfo = async (employeeId) => {
  const data = await getAdminHrChangeCurrentInfo(employeeId)
  currentInfo.value = data
  syncFormFromCurrentInfo()
}

const loadHistory = async () => {
  const data = await getAdminHrChangeEvents({
    page: 1,
    size: 20,
    eventType: selectedHistoryType.value || undefined,
  })
  historyRecords.value = Array.isArray(data?.content) ? data.content : []
}

const handlePickedMember = async (member) => {
  if (!member?.employeeId) return
  selectedEmployeeId.value = member.employeeId
  selectedEmployeeSummary.value = member
  try {
    await loadCurrentInfo(member.employeeId)
  } catch (error) {
    alert(error?.response?.data?.error?.message || '현재 인사 정보 조회에 실패했습니다.')
  }
}

const applyHrChanges = async () => {
  if (!canApplyChanges.value || !selectedEmployeeId.value || !currentInfo.value) return

  const payload = {
    orgId: Number(editForm.orgId || 0) !== Number(currentInfo.value.orgId || 0) ? Number(editForm.orgId) : null,
    jobId: Number(editForm.jobId || 0) !== Number(currentInfo.value.jobId || 0) ? Number(editForm.jobId) : null,
    positionId:
      Number(editForm.positionId || 0) !== Number(currentInfo.value.positionId || 0)
        ? Number(editForm.positionId)
        : null,
    rankId: Number(editForm.rankId || 0) !== Number(currentInfo.value.rankId || 0) ? Number(editForm.rankId) : null,
    employeeState:
      String(editForm.employeeState || '') !== String(currentInfo.value.employeeState || '')
        ? editForm.employeeState
        : null,
    employType:
      String(editForm.employType || '') !== String(currentInfo.value.employType || '') ? editForm.employType : null,
    areaId: Number(editForm.areaId || 0) !== Number(currentInfo.value.areaId || 0) ? Number(editForm.areaId) : null,
    effectiveFrom: editForm.effectiveFrom,
    reason: editForm.reason.trim(),
    roleIds: roleIdsChanged.value ? normalizeRoleIds(editForm.roleIds) : null,
  }

  isApplying.value = true
  try {
    await updateAdminHrChangeEmployee(selectedEmployeeId.value, payload)
    await Promise.all([loadCurrentInfo(selectedEmployeeId.value), loadHistory()])
    alert('인사 정보 변경이 저장되었습니다.')
  } catch (error) {
    alert(error?.response?.data?.error?.message || '인사 정보 변경 저장에 실패했습니다.')
  } finally {
    isApplying.value = false
  }
}

const resetEditForm = () => {
  syncFormFromCurrentInfo()
}

watch(selectedHistoryType, () => {
  loadHistory()
})

onMounted(async () => {
  try {
    await Promise.all([loadOptions(), loadHistory()])
  } catch (error) {
    alert(error?.response?.data?.error?.message || '초기 데이터 조회에 실패했습니다.')
  }
})
</script>

<style scoped>
.admin-page { width: 100%; max-width: none; min-width: 0; }

.layout { margin-top: 12px; display: grid; grid-template-columns: 1.2fr .8fr; gap: 12px; }
.card {
  background: #fff;
  border: 1px solid var(--gray200);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 16px;
}
.card h3 { margin: 0 0 12px; color: var(--gray800); }

.employee-picker { margin-bottom: 12px; }
.employee-picker p {
  margin: 0 0 6px;
  color: var(--gray600);
  font-size: .8rem;
}
.picker-row { display: flex; align-items: center; gap: 10px; }
.btn-pick {
  height: 34px;
  border: 1px solid var(--gray200);
  border-radius: 8px;
  background: #fff;
  color: var(--gray700);
  font-size: .82rem;
  font-weight: 700;
  padding: 0 12px;
}
.picked-summary {
  min-height: 34px;
  flex: 1;
  border: 1px solid var(--gray100);
  border-radius: 8px;
  padding: 6px 10px;
  background: var(--gray50);
  display: flex;
  flex-direction: column;
}
.picked-summary strong { color: var(--gray800); font-size: .84rem; }
.picked-summary span { color: var(--gray500); font-size: .76rem; }
.picked-summary.empty { color: var(--gray400); justify-content: center; }

.form-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
label { display: grid; gap: 6px; font-size: .8rem; color: var(--gray600); }
label.span-2 { grid-column: span 2; }
input, select {
  height: 36px;
  border: 1px solid var(--gray200);
  border-radius: 8px;
  background: #fff;
  color: var(--gray700);
  padding: 0 10px;
}
.role-picker { border: 1px solid var(--gray100); border-radius: 8px; padding: 10px; background: var(--gray50); }
.role-picker-title { margin: 0 0 8px; color: var(--gray700); font-size: .8rem; font-weight: 700; }
.role-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 6px 10px; }
.role-option { display: flex; align-items: center; gap: 8px; font-size: .8rem; color: var(--gray700); }
.role-option input { width: 14px; height: 14px; }
.role-hint { margin: 8px 0 0; color: var(--gray500); font-size: .76rem; }

.helper { margin: 10px 0 0; color: var(--gray500); font-size: .78rem; }
.helper.warning { color: #dc2626; font-weight: 600; }
.action-row { margin-top: 14px; display: flex; justify-content: flex-end; gap: 8px; }
.btn-primary {
  height: 34px;
  border: none;
  border-radius: 8px;
  background: var(--primary);
  color: #fff;
  padding: 0 12px;
  font-weight: 700;
}
.btn-primary:disabled { opacity: .45; cursor: default; }
.btn-ghost {
  height: 34px;
  border: 1px solid var(--gray200);
  border-radius: 8px;
  background: #fff;
  color: var(--gray600);
  padding: 0 12px;
  font-weight: 700;
}

.current-box {
  border: 1px solid var(--gray100);
  border-radius: 10px;
  background: var(--gray50);
  padding: 10px;
}
.current-empty {
  border: 1px dashed var(--gray200);
  border-radius: 10px;
  background: var(--gray50);
  padding: 16px;
  color: var(--gray500);
  font-size: 0.82rem;
}
.current-box p {
  margin: 5px 0;
  display: flex;
  justify-content: space-between;
  gap: 10px;
  color: var(--gray600);
  font-size: .82rem;
}
.current-box span { color: var(--gray500); }
.current-box strong { color: var(--gray800); }

.history-card { margin-top: 12px; }
.filter-row { display: flex; flex-wrap: wrap; gap: 8px; margin: 10px 0; }
.filter-chip {
  border: 1px solid var(--gray200);
  border-radius: 999px;
  height: 30px;
  padding: 0 10px;
  background: #fff;
  color: var(--gray600);
  font-size: .78rem;
  font-weight: 700;
}
.filter-chip.active {
  background: #E0F2FE;
  border-color: #B9E6FE;
  color: #075985;
}

.table { width: 100%; border-collapse: collapse; font-size: .82rem; }
.table th, .table td {
  border-bottom: 1px solid var(--gray100);
  padding: 10px 8px;
  text-align: left;
}
.table th { color: var(--gray500); }
.empty { text-align: center; color: var(--gray400); }

@media (max-width: 1180px) {
  .layout { grid-template-columns: minmax(0, 1fr); }
}
@media (max-width: 900px) {
  .form-grid { grid-template-columns: minmax(0, 1fr); }
  label.span-2 { grid-column: span 1; }
  .role-grid { grid-template-columns: minmax(0, 1fr); }
}
</style>
