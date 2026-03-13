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
          <select v-model="filters.orgId">
            <option value="">전체</option>
            <option v-for="item in orgOptions" :key="item.id" :value="item.id">{{ item.name }}</option>
          </select>
        </label>
        <label>
          근무 형태
          <select v-model="filters.employType">
            <option v-for="item in EMPLOY_TYPE_OPTIONS" :key="item.value" :value="item.value">{{ item.label }}</option>
          </select>
        </label>
        <label>
          재직 상태
          <select v-model="filters.employeeState">
            <option v-for="item in EMPLOYEE_STATE_OPTIONS" :key="item.value" :value="item.value">{{ item.label }}</option>
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
        <span class="count">총 {{ totalElements }}명</span>
      </div>

      <div class="table-wrap">
        <table class="list-table">
          <colgroup>
            <col class="col-empno" />
            <col class="col-name" />
            <col class="col-org" />
            <col class="col-role" />
            <col class="col-state" />
            <col class="col-date" />
            <col class="col-type" />
            <col class="col-area" />
          </colgroup>
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
              <td class="font-num">{{ item.employeeNum }}</td>
              <td>{{ item.name }}</td>
              <td>{{ item.orgName }}</td>
              <td>{{ item.duty }} · {{ item.job }} · {{ item.rank }}</td>
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
            <div class="detail-row"><span>사번</span><strong>{{ selectedEmployee.employeeNum || '-' }}</strong></div>
            <div class="detail-row"><span>이름</span><strong>{{ selectedEmployee.name }}</strong></div>
            <div class="detail-row"><span>이메일</span><strong>{{ selectedEmployee.email }}</strong></div>
            <div class="detail-row"><span>연락처</span><strong>{{ selectedEmployee.phone }}</strong></div>
            <div class="detail-row"><span>내선번호</span><strong>{{ selectedEmployee.extensionNum || '-' }}</strong></div>
            <div class="detail-row"><span>생년월일</span><strong>{{ selectedEmployee.birthDate || '-' }}</strong></div>
          </article>

          <article class="sub-card">
            <h4>인사 정보</h4>
            <div class="detail-row"><span>조직</span><strong>{{ selectedEmployee.orgName || '-' }}</strong></div>
            <div class="detail-row"><span>직책/직무/직급</span><strong>{{ selectedEmployee.positionName || '-' }} · {{ selectedEmployee.jobName || '-' }} · {{ selectedEmployee.rankName || '-' }}</strong></div>
            <div class="detail-row"><span>재직 상태</span><strong>{{ selectedEmployee.employeeStateDescription || '-' }}</strong></div>
            <div class="detail-row"><span>입사일</span><strong>{{ selectedEmployee.hireDate }}</strong></div>
            <div class="detail-row"><span>입사 유형</span><strong>{{ selectedEmployee.recruitTypeDescription || '-' }}</strong></div>
            <div class="detail-row"><span>근무 형태</span><strong>{{ selectedEmployee.employTypeDescription || '-' }}</strong></div>
            <div class="detail-row"><span>근무 지역</span><strong>{{ selectedEmployee.areaName || '-' }}</strong></div>
          </article>

          <article class="sub-card" v-if="isAdminViewer && selectedEmployeeSensitiveInfo">
            <h4>민감 정보</h4>
            <div class="detail-row detail-row-sensitive">
              <span>주민번호</span>
              <div class="sensitive-value">
                <strong class="font-num">{{ selectedEmployeeSensitiveInfo.ssn }}</strong>
              </div>
            </div>
            <div class="detail-row detail-row-sensitive">
              <span>계좌번호</span>
              <div class="sensitive-value">
                <strong class="font-num">{{ selectedEmployeeSensitiveInfo.bankAccount }}</strong>
              </div>
            </div>
            <div class="detail-row detail-row-sensitive">
              <span>은행명</span>
              <div class="sensitive-value">
                <strong>{{ selectedEmployee.bankName || '-' }}</strong>
              </div>
            </div>
            <div class="detail-row detail-row-sensitive">
              <span>주소</span>
              <div class="sensitive-value">
                <strong>{{ selectedEmployeeSensitiveInfo.address }}</strong>
              </div>
            </div>
          </article>

          <article class="sub-card">
            <h4>역량 정보</h4>
            <div class="scroll-list" v-if="selectedEmployee.skills?.length">
              <div class="chip-item" v-for="(skill, idx) in selectedEmployee.skills" :key="`${selectedEmployee.employeeId}-skill-${idx}`">
                <strong>{{ skill.skillName }}</strong>
                <span>{{ skill.category || '-' }} · {{ skill.acquisitionDate || '-' }} · {{ skill.licenseNumber || '-' }}</span>
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
                <strong>{{ career.companyName }}</strong>
                <span>{{ career.orgName || '-' }}</span>
                <span class="font-num">{{ career.startDate || '-' }} ~ {{ career.endDate || '현재' }}</span>
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
                :key="history.hrEventId"
              >
                <div class="history-top">
                  <span class="history-type">{{ history.eventTypeDescription || history.eventType }}</span>
                  <strong>{{ history.eventTitle }}</strong>
                </div>
                <div class="history-meta">
                  <span>적용일: {{ history.effectiveFrom }}</span>
                  <span>상태: {{ history.eventStatusDescription || historyStatusText(history.eventStatus) }}</span>
                </div>
                <p class="history-change">{{ history.beforeChange || '-' }} → {{ history.afterChange || '-' }}</p>
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
import { computed, onMounted, reactive, ref, watch } from 'vue'
import BaseModal from '@/components/common/BaseModal.vue'
import {
  getAdminEmployeeCareerEvidence,
  getAdminEmployeeDetail,
  getAdminEmployees,
  getAdminEmployeeSkillEvidence,
  getOrganizationTree,
} from '@/api/hr'
import { AUTH_KEYS, USER_ROLES } from '@/utils/auth'

const EMPLOYEE_STATE_OPTIONS = [
  { value: '', label: '전체' },
  { value: 'WORK', label: '재직' },
  { value: 'LEAVE', label: '휴직' },
  { value: 'RESIGN', label: '사직' },
]

const EMPLOY_TYPE_OPTIONS = [
  { value: '', label: '전체' },
  { value: 'REGULAR', label: '정규직' },
  { value: 'NON_REGULAR', label: '비정규직' },
  { value: 'CONTRACT', label: '계약직' },
]

const filters = reactive({
  keyword: '',
  orgId: '',
  employType: '',
  employeeState: '',
})

const currentPage = ref(1)
const totalPages = ref(1)
const totalElements = ref(0)
const allEmployees = ref([])
const showDetailModal = ref(false)
const selectedEmployee = ref(null)
const orgOptions = ref([])
const latestEmployeeListRequestId = ref(0)

const selectedEmployeeHistories = computed(() => selectedEmployee.value?.hrHistories || [])
const isAdminViewer = computed(() => {
  const role = sessionStorage.getItem(AUTH_KEYS.role) || USER_ROLES.user
  const roleCodes = JSON.parse(sessionStorage.getItem(AUTH_KEYS.roleCodes) || '[]')
  return (
    role === USER_ROLES.admin ||
    roleCodes.includes('HR_ADMIN_MASTER') ||
    roleCodes.includes('HR_ADMIN_PAYROLL') ||
    roleCodes.includes('ROLE_HR_ADMIN_MASTER') ||
    roleCodes.includes('ROLE_HR_ADMIN_PAYROLL')
  )
})

const selectedEmployeeSensitiveInfo = computed(() => {
  if (!selectedEmployee.value) return null
  return {
    ssn: selectedEmployee.value.residentNumberMasked || '-',
    bankAccount: selectedEmployee.value.accountNumberMasked || '-',
    address: selectedEmployee.value.address || '-',
  }
})

const pagedEmployees = computed(() =>
  allEmployees.value.map((row) => ({
    ...row,
    name: row.employeeName,
    duty: row.positionName || '-',
    job: row.jobName || '-',
    rank: row.rankName || '-',
    orgName: row.orgName || '-',
    normalizedEmploymentStatus: normalizeEmployeeStateText(row.employeeStateDescription),
    workType: row.employTypeDescription || '-',
    workRegion: row.areaName || '-',
    hireDate: normalizeDate(row.hireDate),
  })),
)

const kpiCards = computed(() => [
  { label: '전체 인원', value: `${totalElements.value}명`, note: '전 사원 목록 기준' },
  { label: '신규 입사 예정', value: '-', note: '백엔드 미제공' },
  { label: '최근 인사 변경', value: '-', note: '백엔드 미제공' },
])

const flattenOrgs = (node, bucket = []) => {
  if (!node) return bucket
  const id = node.id ?? node.orgId
  const name = node.name ?? node.orgName
  if (id != null && name) bucket.push({ id, name })
  ;(node.children || []).forEach((child) => flattenOrgs(child, bucket))
  return bucket
}

const normalizeDate = (value) => {
  if (!value) return '-'
  const text = String(value)
  if (text.includes('.')) return text
  if (text.includes('T')) return text.slice(0, 10).replaceAll('-', '.')
  return text.replaceAll('-', '.')
}

const normalizeEmployeeStateText = (value) => {
  const text = String(value || '').trim()
  if (!text) return '-'
  if (text === '퇴사') return '사직'
  return text
}

const loadOrgOptions = async () => {
  try {
    const raw = await getOrganizationTree()
    const flat = Array.isArray(raw)
      ? raw
          .map((item) => ({ id: item?.orgId ?? item?.id, name: item?.orgName ?? item?.name }))
          .filter((item) => item.id != null && item.name)
      : flattenOrgs(raw, [])
    orgOptions.value = [...new Map(flat.map((item) => [String(item.id), item])).values()].sort((a, b) =>
      String(a.name).localeCompare(String(b.name), 'ko'),
    )
  } catch (_error) {
    orgOptions.value = []
  }
}

const loadEmployees = async (page = 1) => {
  const requestId = latestEmployeeListRequestId.value + 1
  latestEmployeeListRequestId.value = requestId
  try {
    const payload = await getAdminEmployees({
      page,
      keyword: filters.keyword || undefined,
      orgId: filters.orgId ? Number(filters.orgId) : undefined,
      employType: filters.employType || undefined,
      employeeState: filters.employeeState || undefined,
    })
    if (requestId !== latestEmployeeListRequestId.value) return
    const content = Array.isArray(payload?.content) ? payload.content : []
    allEmployees.value = content
    currentPage.value = Number(payload?.currentPage || page || 1)
    totalPages.value = Math.max(1, Number(payload?.totalPages || 1))
    totalElements.value = Number(payload?.totalElements || content.length || 0)
  } catch (error) {
    if (requestId !== latestEmployeeListRequestId.value) return
    allEmployees.value = []
    currentPage.value = 1
    totalPages.value = 1
    totalElements.value = 0
    alert(error?.response?.data?.error?.message || '사원 목록 조회에 실패했습니다.')
  }
}

const resetFilters = () => {
  filters.keyword = ''
  filters.orgId = ''
  filters.employType = ''
  filters.employeeState = ''
}

const openDetail = async (employeeId) => {
  try {
    const detail = await getAdminEmployeeDetail(employeeId)
    selectedEmployee.value = {
      ...detail,
      name: detail?.employeeName,
      hireDate: normalizeDate(detail?.hireDate),
      birthDate: normalizeDate(detail?.birthDate),
      skills: Array.isArray(detail?.skills) ? detail.skills : [],
      careers: Array.isArray(detail?.careers) ? detail.careers : [],
      hrHistories: (detail?.hrHistories || []).map((item) => ({
        ...item,
        effectiveFrom: normalizeDate(item?.effectiveFrom),
        effectiveTo: normalizeDate(item?.effectiveTo),
      })),
    }
    showDetailModal.value = true
  } catch (error) {
    alert(error?.response?.data?.error?.message || '사원 상세 조회에 실패했습니다.')
  }
}

const historyStatusText = (status) => {
  if (status === 'APPLIED') return '완료'
  if (status === 'FAILED') return '실패'
  return '대기'
}

const openDataUrl = (url) => {
  if (!url) return
  window.open(url, '_blank', 'noopener,noreferrer')
}

const openSkillEvidence = async (skill) => {
  if (!selectedEmployee.value?.employeeId || !skill?.skillId) return
  try {
    const data = await getAdminEmployeeSkillEvidence(selectedEmployee.value.employeeId, skill.skillId)
    openDataUrl(data?.fileUrl)
  } catch (error) {
    alert(error?.response?.data?.error?.message || '역량 증빙 조회에 실패했습니다.')
  }
}

const openCareerEvidence = async (career) => {
  if (!selectedEmployee.value?.employeeId || !career?.careerId) return
  try {
    const data = await getAdminEmployeeCareerEvidence(selectedEmployee.value.employeeId, career.careerId)
    openDataUrl(data?.fileUrl)
  } catch (error) {
    alert(error?.response?.data?.error?.message || '경력 증빙 조회에 실패했습니다.')
  }
}

const statusClass = (status) => {
  if (status === '재직') return 'ok'
  if (status === '휴직') return 'hold'
  if (status === '사직' || status === '퇴사') return 'end'
  return ''
}

watch(
  [() => filters.keyword, () => filters.orgId, () => filters.employType, () => filters.employeeState],
  () => {
    if (currentPage.value !== 1) {
      currentPage.value = 1
      return
    }
    loadEmployees(1)
  },
)

watch(currentPage, (nextPage, prevPage) => {
  if (nextPage === prevPage) return
  loadEmployees(nextPage)
})

onMounted(async () => {
  await Promise.all([loadOrgOptions(), loadEmployees(1)])
})
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
  table-layout: fixed;
  font-size: .82rem;
  color: var(--gray700);
}
.list-table col.col-empno { width: 150px; }
.list-table col.col-name { width: 105px; }
.list-table col.col-org { width: 130px; }
.list-table col.col-role { width: 275px; }
.list-table col.col-state { width: 110px; }
.list-table col.col-date { width: 130px; }
.list-table col.col-type { width: 110px; }
.list-table col.col-area { width: 130px; }
.list-table th,
.list-table td {
  border-bottom: 1px solid var(--gray100);
  padding: 10px 8px;
  text-align: left;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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
