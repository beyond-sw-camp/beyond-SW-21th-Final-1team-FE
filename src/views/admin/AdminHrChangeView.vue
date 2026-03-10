<template>
  <section class="admin-page">
    <div class="layout">
      <article class="card">
        <h3>직원 인사 정보 변경</h3>

        <div class="employee-picker">
          <p>대상 직원 선택</p>
          <div class="picker-row">
            <button type="button" class="btn-pick" @click="showOrgPicker = true">사원 찾기</button>
            <div class="picked-summary" v-if="selectedEmployee">
              <strong>{{ selectedEmployee.name }}</strong>
              <span>{{ selectedEmployee.team }} / {{ selectedEmployee.job }} / {{ selectedEmployee.grade }}</span>
            </div>
            <div class="picked-summary empty" v-else>선택된 직원이 없습니다.</div>
          </div>
        </div>

        <div class="form-grid">
          <label>
            소속 팀
            <select v-model="editForm.team">
              <option v-for="item in teamOptions" :key="item" :value="item">{{ item }}</option>
            </select>
          </label>
          <label>
            직무
            <select v-model="editForm.job">
              <option v-for="item in jobOptions" :key="item" :value="item">{{ item }}</option>
            </select>
          </label>
          <label>
            직책
            <select v-model="editForm.position">
              <option v-for="item in positionOptions" :key="item" :value="item">{{ item }}</option>
            </select>
          </label>
          <label>
            직급
            <select v-model="editForm.grade">
              <option v-for="item in gradeOptions" :key="item" :value="item">{{ item }}</option>
            </select>
          </label>
          <label>
            재직 상태
            <select v-model="editForm.employmentStatus">
              <option v-for="item in employmentStatusOptions" :key="item" :value="item">{{ item }}</option>
            </select>
          </label>
          <label>
            근무 형태
            <select v-model="editForm.workType">
              <option v-for="item in workTypeOptions" :key="item" :value="item">{{ item }}</option>
            </select>
          </label>
          <label>
            근무지
            <select v-model="editForm.workLocation">
              <option v-for="item in workLocationOptions" :key="item" :value="item">{{ item }}</option>
            </select>
          </label>
          <label>
            적용일
            <input v-model="editForm.effectiveDate" type="date" />
          </label>
        </div>

        <p class="helper">변경 시 변경 전 정보와 적용일이 인사기록에 자동 저장됩니다.</p>

        <div class="action-row">
          <button class="btn-ghost" type="button" @click="resetEditForm">초기화</button>
          <button class="btn-primary" type="button" :disabled="!canApplyChanges" @click="applyHrChanges">
            변경 적용
          </button>
        </div>

        <p v-if="resultMessage" class="result-msg">{{ resultMessage }}</p>
      </article>

      <article class="card current-card">
        <h3>현재 인사 정보</h3>
        <div v-if="selectedEmployee" class="current-box">
          <p><span>이름</span><strong>{{ selectedEmployee.name }}</strong></p>
          <p><span>소속 팀</span><strong>{{ selectedEmployee.team }}</strong></p>
          <p><span>직무</span><strong>{{ selectedEmployee.job }}</strong></p>
          <p><span>직책</span><strong>{{ selectedEmployee.position }}</strong></p>
          <p><span>직급</span><strong>{{ selectedEmployee.grade }}</strong></p>
          <p><span>재직 상태</span><strong>{{ selectedEmployee.employmentStatus }}</strong></p>
          <p><span>근무 형태</span><strong>{{ selectedEmployee.workType }}</strong></p>
          <p><span>근무지</span><strong>{{ selectedEmployee.workLocation }}</strong></p>
          <p><span>최종 반영일</span><strong class="font-num">{{ selectedEmployee.lastAppliedDate || '-' }}</strong></p>
        </div>
        <div v-else class="current-empty">사원을 선택하면 현재 인사 정보가 표시됩니다.</div>
      </article>
    </div>

    <article class="card history-card">
      <h3>인사기록 관리</h3>
      <div class="filter-row">
        <button
          v-for="type in historyTypeOptions"
          :key="type"
          type="button"
          class="filter-chip"
          :class="{ active: selectedHistoryType === type }"
          @click="selectedHistoryType = type"
        >
          {{ type }}
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
            <th>처리자</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in filteredHistory" :key="item.id">
            <td>{{ item.changeType }}</td>
            <td>{{ item.employeeName }}</td>
            <td>{{ item.beforeValue }}</td>
            <td>{{ item.afterValue }}</td>
            <td class="font-num">{{ item.effectiveDate }}</td>
            <td>{{ item.processor }}</td>
          </tr>
          <tr v-if="filteredHistory.length === 0">
            <td colspan="6" class="empty">조건에 맞는 인사기록이 없습니다.</td>
          </tr>
        </tbody>
      </table>
    </article>

    <EmployeePickerModal v-model="showOrgPicker" @select-member="handlePickedMember" />
  </section>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import EmployeePickerModal from '@/components/org/EmployeePickerModal.vue'

const teamOptions = ['모바일1팀', '개발1팀', '개발2팀', '디자인팀', 'QA팀', '인사팀', '영업1팀', '영업2팀']
const jobOptions = ['백엔드 개발', '프론트엔드 개발', '모바일 개발', 'QA엔지니어', '디자인', '기획', '인사 운영']
const positionOptions = ['팀원', '선임', '파트장', '팀장', '실장', '본부장']
const gradeOptions = ['사원', '주임', '대리', '과장', '차장', '부장']
const employmentStatusOptions = ['재직', '휴직', '사직', '퇴직']
const workTypeOptions = ['정규직', '계약직', '인턴', '파견']
const workLocationOptions = ['서울 강남', '서울 여의도', '판교', '부산', '대전']

const employeesById = reactive({
  E001: {
    employeeId: 'E001',
    name: '박민수',
    team: '개발2팀',
    job: '백엔드 개발',
    position: '파트장',
    grade: '차장',
    employmentStatus: '재직',
    workType: '정규직',
    workLocation: '판교',
    lastAppliedDate: '2026.02.15'
  },
  E002: {
    employeeId: 'E002',
    name: '김봉식',
    team: '모바일1팀',
    job: '백엔드 개발',
    position: '팀장',
    grade: '과장',
    employmentStatus: '재직',
    workType: '정규직',
    workLocation: '서울 강남',
    lastAppliedDate: '2026.02.14'
  },
  E003: {
    employeeId: 'E003',
    name: '최수빈',
    team: '모바일1팀',
    job: '모바일 개발',
    position: '팀원',
    grade: '사원',
    employmentStatus: '휴직',
    workType: '정규직',
    workLocation: '서울 강남',
    lastAppliedDate: '2026.02.13'
  }
})

const historyRecords = ref([
  {
    id: 'HR-001',
    changeType: '직급 변경',
    employeeName: '박민수',
    beforeValue: '과장',
    afterValue: '차장',
    effectiveDate: '2026.02.15',
    processor: '인사팀 관리자'
  },
  {
    id: 'HR-002',
    changeType: '발령',
    employeeName: '김봉식',
    beforeValue: '개발2팀',
    afterValue: '모바일1팀',
    effectiveDate: '2026.02.14',
    processor: '인사팀 관리자'
  },
  {
    id: 'HR-003',
    changeType: '휴직',
    employeeName: '최수빈',
    beforeValue: '재직',
    afterValue: '휴직',
    effectiveDate: '2026.02.13',
    processor: '인사팀 관리자'
  }
])

const historyTypeOptions = ['전체', '재직', '휴직', '사직', '퇴직', '발령', '직급 변경']
const selectedHistoryType = ref('전체')

const showOrgPicker = ref(false)
const selectedEmployeeId = ref('')
const editForm = reactive({
  team: '',
  job: '',
  position: '',
  grade: '',
  employmentStatus: '',
  workType: '',
  workLocation: '',
  effectiveDate: ''
})
const resultMessage = ref('')

const selectedEmployee = computed(() => employeesById[selectedEmployeeId.value] || null)

const toDotDate = (dateText) => (dateText ? dateText.replaceAll('-', '.') : '')
const normalizeStatus = (value) => {
  if (['재직', '휴직', '사직', '퇴직'].includes(value)) return value
  return '재직'
}

const normalizeByOptions = (value, options, fallback) => {
  return options.includes(value) ? value : fallback
}

const changeTypeOf = (field, afterValue) => {
  if (field === 'grade') return '직급 변경'
  if (field === 'employmentStatus') return afterValue
  return '발령'
}
const fieldLabelMap = {
  team: '소속 팀',
  job: '직무',
  position: '직책',
  grade: '직급',
  employmentStatus: '재직 상태',
  workType: '근무 형태',
  workLocation: '근무지'
}

const syncFormFromSelected = () => {
  if (!selectedEmployee.value) {
    editForm.team = ''
    editForm.job = ''
    editForm.position = ''
    editForm.grade = ''
    editForm.employmentStatus = ''
    editForm.workType = ''
    editForm.workLocation = ''
    editForm.effectiveDate = ''
    resultMessage.value = ''
    return
  }
  editForm.team = selectedEmployee.value.team
  editForm.job = selectedEmployee.value.job
  editForm.position = selectedEmployee.value.position
  editForm.grade = selectedEmployee.value.grade
  editForm.employmentStatus = selectedEmployee.value.employmentStatus
  editForm.workType = selectedEmployee.value.workType
  editForm.workLocation = selectedEmployee.value.workLocation
  editForm.effectiveDate = ''
  resultMessage.value = ''
}

watch(
  selectedEmployeeId,
  () => {
    syncFormFromSelected()
  },
  { immediate: true }
)

const canApplyChanges = computed(() => {
  if (!selectedEmployee.value) return false
  return [
    editForm.team,
    editForm.job,
    editForm.position,
    editForm.grade,
    editForm.employmentStatus,
    editForm.workType,
    editForm.workLocation,
    editForm.effectiveDate
  ].every((value) => String(value).trim().length > 0)
})

const filteredHistory = computed(() => {
  if (selectedHistoryType.value === '전체') return historyRecords.value
  return historyRecords.value.filter((item) => item.changeType === selectedHistoryType.value)
})

const addHistory = (field, beforeValue, afterValue, effectiveDate) => {
  const emp = selectedEmployee.value
  if (!emp) return
  historyRecords.value.unshift({
    id: `HR-${Date.now()}-${field}`,
    changeType: changeTypeOf(field, afterValue),
    employeeName: emp.name,
    beforeValue,
    afterValue,
    effectiveDate: toDotDate(effectiveDate),
    processor: '인사팀 관리자'
  })
}

const applyHrChanges = () => {
  if (!selectedEmployee.value || !canApplyChanges.value) return

  const emp = selectedEmployee.value
  const fields = ['team', 'job', 'position', 'grade', 'employmentStatus', 'workType', 'workLocation']
  const pendingChanges = fields
    .map((field) => {
      const before = emp[field]
      const after = editForm[field]
      if (before === after) return null
      return { field, label: fieldLabelMap[field] || field, before, after }
    })
    .filter(Boolean)

  if (pendingChanges.length === 0) {
    resultMessage.value = '변경된 항목이 없어 적용할 내용이 없습니다.'
    return
  }

  const confirmMessage = [
    '변경하시겠습니까?',
    '',
    `${emp.name} 사원 인사 정보 변경`,
    `적용일: ${toDotDate(editForm.effectiveDate)}`,
    '',
    ...pendingChanges.map((item) => `${item.label}: ${item.before} -> ${item.after}`)
  ].join('\n')

  if (!window.confirm(confirmMessage)) return

  let changedCount = 0

  pendingChanges.forEach((item) => {
    addHistory(item.field, item.before, item.after, editForm.effectiveDate)
    emp[item.field] = item.after
    changedCount += 1
  })

  if (changedCount > 0) {
    emp.lastAppliedDate = toDotDate(editForm.effectiveDate)
  }
  resultMessage.value =
    changedCount > 0
      ? `${emp.name}의 인사 정보 ${changedCount}건이 적용되었습니다.`
      : '변경된 항목이 없어 적용할 내용이 없습니다.'
}

const resetEditForm = () => {
  selectedEmployeeId.value = ''
  syncFormFromSelected()
}

const normalizeJob = (value) => {
  const map = {
    백엔드개발자: '백엔드 개발',
    프론트엔드개발자: '프론트엔드 개발',
    QA엔지니어: 'QA엔지니어',
    QA: 'QA엔지니어',
    품질보증: 'QA엔지니어'
  }
  const key = String(value || '').replaceAll(' ', '')
  return map[key] || value
}

const dutyToGrade = (duty) => {
  const map = {
    사원: '사원',
    주임: '주임',
    대리: '대리',
    과장: '과장',
    차장: '차장',
    부장: '부장',
    팀장: '과장',
    파트장: '대리'
  }
  return map[duty] || '사원'
}

const handlePickedMember = (member) => {
  if (!member?.employeeId) return

  const normalizedJob = normalizeJob(member.job)
  const normalizedDuty = normalizeByOptions(member.duty, positionOptions, '팀원')
  const statusFromHr = String(member.hrInfo?.employmentStatus || '')
    .replace('근무', '')
    .replace('연차', '재직')
    .trim()

  const mapped = {
    employeeId: member.employeeId,
    name: member.name || '이름 없음',
    team: normalizeByOptions(member.position, teamOptions, '모바일1팀'),
    job: normalizeByOptions(normalizedJob, jobOptions, '백엔드 개발'),
    position: normalizedDuty,
    grade: normalizeByOptions(dutyToGrade(member.duty), gradeOptions, '사원'),
    employmentStatus: normalizeStatus(statusFromHr),
    workType: normalizeByOptions(member.hrInfo?.workType, workTypeOptions, '정규직'),
    workLocation: normalizeByOptions(member.hrInfo?.workRegion || member.workLocation, workLocationOptions, '서울 강남'),
    lastAppliedDate: toDotDate(member.hireDate) || ''
  }

  employeesById[mapped.employeeId] = mapped
  selectedEmployeeId.value = mapped.employeeId
}
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
input, select {
  height: 36px;
  border: 1px solid var(--gray200);
  border-radius: 8px;
  background: #fff;
  color: var(--gray700);
  padding: 0 10px;
}

.helper { margin: 10px 0 0; color: var(--gray500); font-size: .78rem; }
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
.result-msg {
  margin: 10px 0 0;
  color: #0369a1;
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 8px;
  padding: 8px 10px;
  font-size: .8rem;
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
}
</style>
