<template>
  <section class="admin-page">
    <div class="kpi-grid">
      <article class="kpi-card" v-for="card in kpiCards" :key="card.label">
        <p class="kpi-label">{{ card.label }}</p>
        <strong class="kpi-value">{{ card.value }}</strong>
        <span class="kpi-note">{{ card.note }}</span>
      </article>
    </div>

    <section class="card filter-card">
      <div class="filter-grid">
        <label class="filter-search">
          이름/사번
          <input v-model.trim="filters.keyword" type="text" placeholder="이름 또는 사번 검색" />
        </label>
        <label>
          조직
          <select v-model="filters.team">
            <option value="">전체</option>
            <option v-for="item in teamOptions" :key="item" :value="item">{{ item }}</option>
          </select>
        </label>
        <label>
          직급
          <select v-model="filters.duty">
            <option value="">전체</option>
            <option v-for="item in dutyOptions" :key="item" :value="item">{{ item }}</option>
          </select>
        </label>
        <label>
          재직 상태
          <select v-model="filters.employmentStatus">
            <option value="">전체</option>
            <option v-for="item in employmentStatusOptions" :key="item" :value="item">{{ item }}</option>
          </select>
        </label>
        <div class="filter-actions">
          <button type="button" class="btn-ghost" @click="resetFilters">초기화</button>
        </div>
      </div>
    </section>

    <section class="card">
      <div class="card-head">
        <h3>사원 목록</h3>
        <span class="count">총 {{ filteredEmployees.length }}명</span>
      </div>

      <div class="table-wrap">
        <table class="list-table">
          <thead>
            <tr>
              <th>사번</th>
              <th>이름</th>
              <th>조직</th>
              <th>직책/직무/직급</th>
              <th>재직 상태</th>
              <th>입사일</th>
              <th>근무 형태</th>
              <th>근무 지역</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="item in pagedEmployees"
              :key="item.employeeId"
              class="row-click"
              @click="openDetail(item.employeeId)"
            >
              <td class="font-num">{{ item.employeeId }}</td>
              <td>{{ item.name }}</td>
              <td>{{ item.position }}</td>
              <td>{{ item.duty }} · {{ item.job }} · {{ item.position }}</td>
              <td>
                <span class="status-badge" :class="statusClass(item.normalizedEmploymentStatus)">
                  {{ item.normalizedEmploymentStatus }}
                </span>
              </td>
              <td class="font-num">{{ item.hireDate }}</td>
              <td>{{ item.workType }}</td>
              <td>{{ item.workRegion }}</td>
            </tr>
            <tr v-if="pagedEmployees.length === 0">
              <td colspan="8" class="empty">조건에 맞는 직원이 없습니다.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="pagination" v-if="totalPages > 1">
        <button type="button" class="page-btn" :disabled="currentPage === 1" @click="currentPage -= 1">이전</button>
        <span class="page-text">{{ currentPage }} / {{ totalPages }}</span>
        <button type="button" class="page-btn" :disabled="currentPage === totalPages" @click="currentPage += 1">다음</button>
      </div>
    </section>

    <BaseModal v-model="showDetailModal" width="860px">
      <section class="detail-modal" v-if="selectedEmployee">
        <div class="card-head detail-head">
          <h3>{{ selectedEmployee.name }} 상세 정보</h3>
          <span class="count">{{ isAdminViewer ? '민감정보 포함' : '민감정보 제외' }}</span>
        </div>

        <div class="detail-sections">
          <article class="sub-card">
            <h4>기본 정보</h4>
            <div class="detail-row"><span>이름</span><strong>{{ selectedEmployee.name }}</strong></div>
            <div class="detail-row"><span>이메일</span><strong>{{ selectedEmployee.email }}</strong></div>
            <div class="detail-row"><span>연락처</span><strong>{{ selectedEmployee.phone }}</strong></div>
            <div class="detail-row"><span>내선번호</span><strong>{{ selectedEmployee.extension }}</strong></div>
            <div class="detail-row"><span>생년월일</span><strong>{{ selectedEmployee.personalInfo?.birthDate || '-' }}</strong></div>
          </article>

          <article class="sub-card">
            <h4>인사 정보</h4>
            <div class="detail-row"><span>조직</span><strong>{{ selectedEmployee.organizationText }}</strong></div>
            <div class="detail-row"><span>직책/직무/직급</span><strong>{{ selectedEmployee.duty }} · {{ selectedEmployee.job }} · {{ selectedEmployee.position }}</strong></div>
            <div class="detail-row"><span>재직 상태</span><strong>{{ selectedEmployee.normalizedEmploymentStatus }}</strong></div>
            <div class="detail-row"><span>입사일</span><strong>{{ selectedEmployee.hireDate }}</strong></div>
            <div class="detail-row"><span>근무 형태</span><strong>{{ selectedEmployee.workType }}</strong></div>
            <div class="detail-row"><span>근무 지역</span><strong>{{ selectedEmployee.workRegion }}</strong></div>
          </article>

          <article class="sub-card" v-if="isAdminViewer && selectedEmployeeSensitiveInfo">
            <h4>민감 정보</h4>
            <div class="detail-row detail-row-sensitive">
              <span>주민번호</span>
              <div class="sensitive-value">
                <strong class="font-num">{{ sensitiveVisible.ssn ? selectedEmployeeSensitiveInfo.ssn : maskSsn(selectedEmployeeSensitiveInfo.ssn) }}</strong>
                <button type="button" class="reveal-btn" @click="toggleSensitive('ssn')">
                  {{ sensitiveVisible.ssn ? '숨기기' : '보기' }}
                </button>
              </div>
            </div>
            <div class="detail-row detail-row-sensitive">
              <span>계좌번호</span>
              <div class="sensitive-value">
                <strong class="font-num">{{ sensitiveVisible.bankAccount ? selectedEmployeeSensitiveInfo.bankAccount : maskBankAccount(selectedEmployeeSensitiveInfo.bankAccount) }}</strong>
                <button type="button" class="reveal-btn" @click="toggleSensitive('bankAccount')">
                  {{ sensitiveVisible.bankAccount ? '숨기기' : '보기' }}
                </button>
              </div>
            </div>
            <div class="detail-row detail-row-sensitive">
              <span>주소</span>
              <div class="sensitive-value">
                <strong>{{ sensitiveVisible.address ? selectedEmployeeSensitiveInfo.address : maskAddress(selectedEmployeeSensitiveInfo.address) }}</strong>
                <button type="button" class="reveal-btn" @click="toggleSensitive('address')">
                  {{ sensitiveVisible.address ? '숨기기' : '보기' }}
                </button>
              </div>
            </div>
          </article>

          <article class="sub-card">
            <h4>역량 정보</h4>
            <div class="scroll-list" v-if="selectedEmployee.skills?.length">
              <div class="chip-item" v-for="(skill, idx) in selectedEmployee.skills" :key="`${selectedEmployee.employeeId}-skill-${idx}`">
                <strong>{{ skill.name }}</strong>
                <span>{{ skill.type }} · {{ skill.issuer }} · {{ skill.date }}</span>
                <div class="item-actions">
                  <button type="button" class="link-btn" @click="openSkillEvidence(skill)">증빙 조회</button>
                </div>
              </div>
            </div>
            <p v-else class="empty-text">등록된 역량 정보가 없습니다.</p>
          </article>

          <article class="sub-card">
            <h4>경력 정보</h4>
            <div class="scroll-list" v-if="selectedEmployee.careers?.length">
              <div class="chip-item" v-for="(career, idx) in selectedEmployee.careers" :key="`${selectedEmployee.employeeId}-career-${idx}`">
                <strong>{{ career.company }}</strong>
                <span>{{ career.role }}</span>
                <span class="font-num">{{ career.period }}</span>
                <div class="item-actions">
                  <button type="button" class="link-btn" @click="openCareerEvidence(career)">증빙 조회</button>
                </div>
              </div>
            </div>
            <p v-else class="empty-text">등록된 경력 정보가 없습니다.</p>
          </article>

          <article class="sub-card sub-card-wide">
            <h4>인사 히스토리</h4>
            <div class="history-list" v-if="selectedEmployeeHistories.length">
              <div
                class="history-item"
                v-for="history in selectedEmployeeHistories"
                :key="history.hr_event_id"
              >
                <div class="history-top">
                  <span class="history-type">{{ history.event_type }}</span>
                  <strong>{{ history.event_title }}</strong>
                </div>
                <div class="history-meta">
                  <span>적용일: {{ history.effective_from }}</span>
                  <span>상태: {{ historyStatusText(history.event_status) }}</span>
                </div>
                <p class="history-change">{{ history.before_value }} → {{ history.after_value }}</p>
              </div>
            </div>
            <p v-else class="empty-text">등록된 인사 히스토리가 없습니다.</p>
          </article>
        </div>

        <div class="detail-actions">
          <button type="button" class="btn-ghost" @click="showDetailModal = false">닫기</button>
        </div>
      </section>
    </BaseModal>
  </section>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import BaseModal from '@/components/common/BaseModal.vue'
import { createHrOrgTreeMock } from '@/mocks/hr/organization'
import { createHrEventsMock } from '@/mocks/hr/hrEvents'
import { AUTH_KEYS, USER_ROLES } from '@/utils/auth'

const PAGE_SIZE = 10
const orgRoot = ref(createHrOrgTreeMock())
const hrEvents = ref(createHrEventsMock())

const upcomingHirePlans = ref([
  { id: 'P-1', name: '신규 입사 예정자 A', plannedDate: '2026.03.04' },
  { id: 'P-2', name: '신규 입사 예정자 B', plannedDate: '2026.03.11' }
])

const normalizeEmploymentStatus = (rawStatus) => {
  const text = String(rawStatus || '')
  if (!text) return '재직'
  if (text.includes('휴직') || text.includes('휴가') || text.includes('연차')) return '휴직'
  if (text.includes('퇴직') || text.includes('퇴사') || text.includes('사직')) return '퇴사'
  return '재직'
}

const collectMembers = (node, trail = []) => {
  if (!node) return []

  const nextTrail = [...trail, node.name]
  const ownMembers = (node.members || []).map((member) => {
    const organizationText = member.hrInfo?.organization || nextTrail.join(' · ')
    const workType = member.hrInfo?.workType || '정규직'
    const workRegion = member.hrInfo?.workRegion || member.workLocation || '서울 강남'
    const rawEmploymentStatus = member.hrInfo?.employmentStatus || member.status || '재직'
    return {
      ...member,
      organization: organizationText,
      organizationText,
      workType,
      workRegion,
      rawEmploymentStatus,
      normalizedEmploymentStatus: normalizeEmploymentStatus(rawEmploymentStatus)
    }
  })

  const childrenMembers = (node.children || []).flatMap((child) => collectMembers(child, nextTrail))
  return [...ownMembers, ...childrenMembers]
}

const allEmployees = ref(collectMembers(orgRoot.value))

const teamOptions = computed(() => [...new Set(allEmployees.value.map((item) => item.organization))])
const dutyOptions = computed(() => [...new Set(allEmployees.value.map((item) => item.duty))])
const employmentStatusOptions = ['재직', '휴직', '퇴사']

const filters = reactive({
  keyword: '',
  team: '',
  duty: '',
  employmentStatus: ''
})

const currentPage = ref(1)
const selectedEmployeeId = ref('')
const showDetailModal = ref(false)
const sensitiveVisible = reactive({
  ssn: false,
  bankAccount: false,
  address: false
})

const filteredEmployees = computed(() => {
  const keyword = filters.keyword.trim().toLowerCase()
  return allEmployees.value.filter((item) => {
    const matchKeyword =
      !keyword ||
      String(item.name).toLowerCase().includes(keyword) ||
      String(item.employeeId).includes(keyword)
    const matchTeam = !filters.team || item.position === filters.team
    const matchDuty = !filters.duty || item.duty === filters.duty
    const matchStatus = !filters.employmentStatus || item.normalizedEmploymentStatus === filters.employmentStatus
    return matchKeyword && matchTeam && matchDuty && matchStatus
  })
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredEmployees.value.length / PAGE_SIZE)))
const pagedEmployees = computed(() => {
  const start = (currentPage.value - 1) * PAGE_SIZE
  return filteredEmployees.value.slice(start, start + PAGE_SIZE)
})

const selectedEmployee = computed(() => {
  if (!selectedEmployeeId.value) return null
  return allEmployees.value.find((item) => item.employeeId === selectedEmployeeId.value) || null
})
const isAdminViewer = computed(() => {
  const role = sessionStorage.getItem(AUTH_KEYS.role) || USER_ROLES.user
  const userId = sessionStorage.getItem(AUTH_KEYS.userId) || ''
  return role === USER_ROLES.admin || userId === 'admin1234'
})
const selectedEmployeeSensitiveInfo = computed(() => {
  const emp = selectedEmployee.value
  if (!emp) return null

  const personal = emp.personalInfo || {}
  const idTail = String(emp.employeeId || '').slice(-4) || '0000'
  const idDigits = idTail.replace(/\D/g, '').padStart(4, '0')
  const backSuffix = `${idDigits}${String((Number(idDigits) % 9) + 1)}${String((Number(idDigits) % 7) + 2)}`
  const fallback = {
    ssn: `950328-1${backSuffix}`,
    bankAccount: `신한 110-${idDigits}-${
      String((Number(idDigits) * 13) % 1000000).padStart(6, '0')
    }`,
    address: `서울시 강남구 테헤란로 ${Number(idTail) % 500 || 127}`
  }

  return {
    ssn: personal.ssn || fallback.ssn,
    bankAccount: personal.bankAccount || fallback.bankAccount,
    address: personal.address || fallback.address
  }
})
const selectedEmployeeHistories = computed(() => {
  if (!selectedEmployee.value?.employeeId) return []
  return hrEvents.value
    .filter((item) => item.employee_id === selectedEmployee.value.employeeId)
    .sort(
      (a, b) =>
        Number(String(b.effective_from || '').replaceAll('.', '')) -
        Number(String(a.effective_from || '').replaceAll('.', ''))
    )
})

const kpiCards = computed(() => [
  {
    label: '전체 인원',
    value: `${allEmployees.value.length}명`,
    note: 'organization.js 기준'
  },
  {
    label: '신규 입사 예정',
    value: `${upcomingHirePlans.value.length}명`,
    note: '예정자 등록 기준'
  },
  {
    label: '최근 인사 변경',
    value: `${hrEvents.value.length}건`,
    note: '인사 히스토리 기준'
  }
])

watch([() => filters.keyword, () => filters.team, () => filters.duty, () => filters.employmentStatus], () => {
  currentPage.value = 1
})

watch(totalPages, (nextTotal) => {
  if (currentPage.value > nextTotal) currentPage.value = nextTotal
})

watch(filteredEmployees, (nextList) => {
  if (nextList.length === 0) {
    selectedEmployeeId.value = ''
    return
  }
  if (!nextList.some((item) => item.employeeId === selectedEmployeeId.value)) {
    selectedEmployeeId.value = nextList[0].employeeId
  }
}, { immediate: true })

const openDetail = (employeeId) => {
  selectedEmployeeId.value = employeeId
  sensitiveVisible.ssn = false
  sensitiveVisible.bankAccount = false
  sensitiveVisible.address = false
  showDetailModal.value = true
}

const resetFilters = () => {
  filters.keyword = ''
  filters.team = ''
  filters.duty = ''
  filters.employmentStatus = ''
  currentPage.value = 1
}

const statusClass = (status) => {
  if (status === '재직') return 'ok'
  if (status === '휴직') return 'hold'
  return 'end'
}
const historyStatusText = (status) => {
  if (status === 'APPROVED') return '완료'
  if (status === 'REJECTED') return '반려'
  return '진행중'
}

const openDataUrl = (url) => {
  if (!url) return
  window.open(url, '_blank', 'noopener,noreferrer')
}

const buildSkillEvidenceFallback = (skill) => {
  const text = `${skill?.name || '역량'} 증빙 더미 파일`
  return `data:text/plain;charset=utf-8,${encodeURIComponent(text)}`
}

const buildCareerEvidenceFallback = (career) => {
  const text = `${career?.company || '경력'} 증빙 더미 파일`
  return `data:text/plain;charset=utf-8,${encodeURIComponent(text)}`
}

const openSkillEvidence = (skill) => {
  openDataUrl(skill?.fileUrl || buildSkillEvidenceFallback(skill))
}

const openCareerEvidence = (career) => {
  openDataUrl(career?.fileUrl || buildCareerEvidenceFallback(career))
}

const toggleSensitive = (field) => {
  if (!(field in sensitiveVisible)) return
  sensitiveVisible[field] = !sensitiveVisible[field]
}

const maskSsn = (value) => {
  const text = String(value || '')
  const [frontRaw, backRaw = ''] = text.split('-')
  const front = (frontRaw || '').replace(/\D/g, '').slice(0, 6).padEnd(6, '*')
  const backFirst = (backRaw || '').replace(/\D/g, '').charAt(0) || '*'
  return `${front}-${backFirst}${'*'.repeat(6)}`
}

const maskBankAccount = (value) => {
  const text = String(value || '').trim()
  if (!text) return '***'
  const parts = text.split(' ')
  if (parts.length <= 1) return '****-****-****'
  return `${parts[0]} ****-****-****`
}

const maskAddress = (value) => {
  const text = String(value || '').trim()
  if (!text) return '주소 비공개'
  const chunks = text.split(' ')
  if (chunks.length <= 2) return `${chunks[0]} ${chunks[1] || ''} ***`.trim()
  return `${chunks[0]} ${chunks[1]} ***`
}
</script>

<style scoped>
.admin-page { width: 100%; max-width: none; min-width: 0; }

.kpi-grid {
  margin-top: 12px;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.kpi-card {
  background: #fff;
  border: 1px solid var(--gray200);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 14px;
  display: grid;
  gap: 4px;
}
.kpi-label { margin: 0; color: var(--gray500); font-size: .8rem; }
.kpi-value { color: var(--gray800); font-size: 1.2rem; }
.kpi-note { color: var(--gray400); font-size: .74rem; }

.card {
  margin-top: 12px;
  background: #fff;
  border: 1px solid var(--gray200);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 16px;
}
.card-head { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 10px; }
.card-head h3 { margin: 0; color: var(--gray800); }
.count { color: var(--gray500); font-size: .82rem; }

.filter-grid {
  display: grid;
  grid-template-columns: minmax(300px, 1.4fr) repeat(3, minmax(180px, 1fr)) auto;
  gap: 10px;
  align-items: end;
}
.filter-grid label { display: grid; gap: 6px; font-size: .8rem; color: var(--gray600); }
.filter-grid input,
.filter-grid select {
  height: 36px;
  border: 1px solid var(--gray200);
  border-radius: 8px;
  padding: 0 10px;
  color: var(--gray700);
  background: #fff;
}
.filter-search { min-width: 0; }
.filter-actions {
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.btn-ghost {
  height: 34px;
  border: 1px solid var(--gray200);
  border-radius: 8px;
  background: #fff;
  color: var(--gray600);
  font-size: .82rem;
  font-weight: 700;
  padding: 0 12px;
}
.btn-ghost:hover { background: var(--gray50); }

.table-wrap { overflow-x: auto; }
.list-table {
  width: 100%;
  border-collapse: collapse;
  font-size: .82rem;
  color: var(--gray700);
}
.list-table th,
.list-table td {
  border-bottom: 1px solid var(--gray100);
  padding: 10px 8px;
  text-align: left;
  white-space: nowrap;
}
.list-table th { color: var(--gray500); font-weight: 700; font-size: .78rem; background: var(--gray50); }
.row-click { cursor: pointer; }
.row-click:hover { background: var(--gray50); }

.status-badge {
  display: inline-flex;
  align-items: center;
  height: 22px;
  padding: 0 8px;
  border-radius: 999px;
  font-size: .72rem;
  font-weight: 700;
}
.status-badge.ok { background: #DCFCE7; color: #16A34A; }
.status-badge.hold { background: #FEF3C7; color: #D97706; }
.status-badge.end { background: #FEE2E2; color: #DC2626; }

.empty { text-align: center; color: var(--gray400); }

.pagination {
  margin-top: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}
.page-btn {
  height: 32px;
  border: 1px solid var(--gray200);
  border-radius: 8px;
  background: #fff;
  color: var(--gray600);
  font-size: .8rem;
  padding: 0 10px;
}
.page-btn:disabled { opacity: .5; cursor: not-allowed; }
.page-text { color: var(--gray500); font-size: .8rem; }

.detail-modal {
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: min(78vh, 820px);
}
.detail-sections {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  padding-right: 6px;
  align-content: start;
}
.sub-card {
  border: 1px solid var(--gray100);
  border-radius: 10px;
  padding: 12px;
  background: #fff;
}
.sub-card-wide { grid-column: 1 / -1; }
.sub-card h4 {
  margin: 0 0 8px;
  color: var(--gray800);
  font-size: .9rem;
}
.detail-row {
  display: grid;
  grid-template-columns: 104px minmax(0, 1fr);
  gap: 8px;
  padding: 4px 0;
  font-size: .82rem;
}
.detail-row span { color: var(--gray500); }
.detail-row strong { color: var(--gray800); word-break: break-word; }
.detail-row-sensitive {
  grid-template-columns: 104px minmax(0, 1fr);
}
.sensitive-value {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  min-width: 0;
}
.reveal-btn {
  height: 26px;
  min-width: 52px;
  border: 1px solid var(--gray200);
  border-radius: 8px;
  background: #fff;
  color: var(--gray600);
  font-size: .74rem;
  font-weight: 700;
  padding: 0 10px;
  flex-shrink: 0;
}
.reveal-btn:hover { background: var(--gray50); }

.scroll-list {
  max-height: 180px;
  overflow-y: auto;
  display: grid;
  gap: 8px;
  padding-right: 2px;
}
.chip-item {
  border: 1px solid var(--gray100);
  border-radius: 8px;
  padding: 8px;
  display: grid;
  gap: 3px;
}
.chip-item strong { color: var(--gray800); font-size: .84rem; }
.chip-item span { color: var(--gray500); font-size: .78rem; }
.item-actions { margin-top: 2px; }
.link-btn {
  border: none;
  background: transparent;
  color: var(--primary);
  font-size: .78rem;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
}
.link-btn:hover { text-decoration: underline; }
.empty-text { margin: 0; color: var(--gray400); font-size: .82rem; }
.history-list {
  max-height: 210px;
  overflow-y: auto;
  display: grid;
  gap: 8px;
  padding-right: 2px;
}
.history-item {
  border: 1px solid var(--gray100);
  border-radius: 8px;
  background: #fff;
  padding: 8px 10px;
}
.history-top {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.history-top strong {
  color: var(--gray800);
  font-size: .84rem;
}
.history-type {
  height: 20px;
  padding: 0 8px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  font-size: .7rem;
  font-weight: 700;
  color: #0369a1;
  background: #e0f2fe;
}
.history-meta {
  margin-top: 5px;
  display: flex;
  gap: 10px;
  color: var(--gray500);
  font-size: .76rem;
}
.history-change {
  margin: 6px 0 0;
  color: var(--gray700);
  font-size: .8rem;
  font-weight: 600;
}
.detail-actions {
  display: flex;
  justify-content: flex-end;
}

@media (max-width: 1200px) {
  .filter-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .filter-actions { justify-content: flex-start; }
}

@media (max-width: 900px) {
  .kpi-grid { grid-template-columns: minmax(0, 1fr); }
  .filter-grid { grid-template-columns: minmax(0, 1fr); }
  .detail-sections { grid-template-columns: minmax(0, 1fr); }
}
</style>
