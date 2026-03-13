<template>
  <div class="inq-wrap">
    <!-- ═══ 필터 바 ═══ -->
    <div class="inq-card">
      <div class="filter-bar">
        <div class="filter-left">
          <div v-if="isPerformanceManager" class="filter-select-wrap">
            <User :size="14" class="filter-icon" />
            <select v-model="filterEmployee" class="filter-select">
              <option value="">전체 팀원</option>
              <option
                v-for="employee in employeeOptions"
                :key="employee.employeeId"
                :value="String(employee.employeeId)"
              >
                {{ employee.employeeName }}
              </option>
            </select>
          </div>
          <div class="filter-select-wrap">
            <Filter :size="14" class="filter-icon" />
            <select v-model="filterStatus" class="filter-select">
              <option value="">전체 상태</option>
              <option value="진행중">진행중</option>
              <option value="완료">완료</option>
              <option value="대기">대기</option>
            </select>
          </div>
          <input v-model="filterMonth" type="month" class="filter-month" />
        </div>
        <div class="filter-search-wrap" :class="{ 'filter-search-wrap--manager': isPerformanceManager }">
          <select v-if="isPerformanceManager" v-model="searchField" class="filter-search-mode">
            <option value="title">제목</option>
            <option value="coreTask">핵심 업무</option>
          </select>
          <Search :size="14" class="filter-icon" />
          <input
            v-model="searchText"
            type="text"
            :placeholder="isPerformanceManager && searchField === 'coreTask' ? '핵심 업무 검색' : '성과 제목 검색'"
            class="filter-search"
          />
        </div>
      </div>

      <!-- ═══ 테이블 ═══ -->
      <div class="table-wrap">
        <table class="inq-table">
          <thead>
            <tr>
              <th>유형</th>
              <th class="col-title">제목</th>
              <th>기간</th>
              <th>상태</th>
              <th>달성률</th>
              <th class="col-core">핵심 업무</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in paginatedItems" :key="item.id" @click="openDetail(item)">
              <td>
                <span class="badge" :class="item.type === 'Team' ? 'badge-blue' : 'badge-green'">
                  {{ item.type === 'Team' ? '팀 성과' : '개인 성과' }}
                </span>
              </td>
              <td class="td-title">{{ item.title }}</td>
              <td class="td-date">{{ item.date }}</td>
              <td>
                <span class="badge" :class="statusClass(item.status)">{{ item.status }}</span>
              </td>
              <td>
                <div class="progress-cell">
                  <div class="progress-bar">
                    <div class="progress-fill" :style="{ width: item.progress + '%' }"></div>
                  </div>
                  <span class="progress-text">{{ item.progress }}%</span>
                </div>
              </td>
              <td class="td-core">{{ item.coreTask || '-' }}</td>
            </tr>
            <tr v-if="filteredItems.length === 0">
              <td colspan="6" class="td-empty">{{ loadError || '검색 결과가 없습니다.' }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="totalPages > 1" class="pagination-bar">
        <button class="page-btn" :disabled="currentPage === 1" @click="currentPage--">이전</button>
        <span class="page-status">{{ currentPage }} / {{ totalPages }}</span>
        <button class="page-btn" :disabled="currentPage === totalPages" @click="currentPage++">다음</button>
      </div>
    </div>

    <!-- ═══ 상세/결과 모달 ═══ -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="selectedItem" class="modal-overlay" @click.self="selectedItem = null">
          <div class="modal-card">
            <!-- 모달 헤더 -->
            <div class="modal-header">
              <div>
                <div class="modal-badges">
                  <span class="badge" :class="selectedItem.type === 'Team' ? 'badge-blue' : 'badge-green'">
                    {{ selectedItem.type === 'Team' ? '팀 성과' : '개인 성과' }}
                  </span>
                  <span class="badge" :class="statusClass(selectedItem.status)">{{ selectedItem.status }}</span>
                </div>
                <h3 class="modal-title">{{ selectedItem.title }}</h3>
              </div>
              <button class="close-btn" @click="selectedItem = null">
                <X :size="18" />
              </button>
            </div>

            <!-- 탭 -->
            <div class="modal-tabs">
              <button class="modal-tab" :class="{ active: modalTab === 'detail' }" @click="modalTab = 'detail'">
                성과 상세 조회
              </button>
              <button class="modal-tab" :class="{ active: modalTab === 'result' }" @click="modalTab = 'result'">
                성과 결과 등록
              </button>
            </div>

            <!-- 모달 콘텐츠 -->
            <div class="modal-body">
              <!-- 상세 조회 -->
              <template v-if="modalTab === 'detail'">
                <div class="detail-grid">
                  <div class="detail-item">
                    <span class="detail-label">기간</span>
                    <span class="detail-value">{{ selectedItem.date }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">현재 달성률</span>
                    <div class="detail-progress">
                      <div class="progress-bar lg">
                        <div class="progress-fill" :style="{ width: selectedItem.progress + '%' }"></div>
                      </div>
                      <span class="progress-pct">{{ selectedItem.progress }}%</span>
                    </div>
                  </div>
                </div>

                <div class="detail-section">
                  <span class="detail-label">목표 상세 내용</span>
                  <div class="detail-box">
                    <p>본 프로젝트의 주요 목표는 다음과 같습니다:</p>
                    <ul>
                      <li>기존 레거시 시스템의 기술 부채 해결</li>
                      <li>API 응답 속도 50% 이상 개선</li>
                      <li>코드 커버리지 80% 달성 및 유지보수성 향상</li>
                    </ul>
                  </div>
                </div>

                <div class="detail-section">
                  <span class="detail-label">중간 점검 코멘트</span>
                  <div class="detail-alert info">
                    <AlertCircle :size="16" />
                    <p>현재 진행 상황이 목표 대비 10% 지연되고 있습니다. 3월 말까지 핵심 모듈 리팩토링을 완료해야 합니다.</p>
                  </div>
                </div>
              </template>

              <!-- 결과 등록 -->
              <template v-else>
                <div class="detail-alert warn">
                  <AlertCircle :size="16" />
                  <div>
                    <strong>결과 등록 시 유의사항</strong>
                    <p>최종 결과는 수정이 불가능할 수 있습니다. 증빙 자료를 반드시 첨부해주세요.</p>
                  </div>
                </div>

                <div class="result-template-chip" :class="isTeamResult ? 'chip-team' : 'chip-individual'">
                  {{ isTeamResult ? '팀 성과 결과 보고서' : '개인 성과 결과 보고서' }}
                </div>

                <div class="result-group">
                  <label class="result-label">{{ isTeamResult ? '팀 목표 최종 달성률' : '개인 목표 최종 달성률' }}</label>
                  <div class="range-wrap">
                    <input v-model="resultProgress" type="range" min="0" max="100" class="range-input" />
                    <span class="range-value">{{ resultProgress }}%</span>
                  </div>
                </div>

                <div class="result-group">
                  <label class="result-label">{{ isTeamResult ? '팀 성과 요약' : '개인 성과 요약' }}</label>
                  <textarea
                    v-model="resultSummary"
                    rows="4"
                    class="result-textarea"
                    :placeholder="isTeamResult ? '팀 단위 성과와 핵심 수치를 입력하세요.' : '개인 기여 성과와 핵심 수치를 입력하세요.'"
                  ></textarea>
                </div>

                <div v-if="isTeamResult" class="result-group">
                  <label class="result-label">특이점</label>
                  <input v-model="resultNote" type="text" class="result-input" placeholder="성과 수행 중 특이사항을 입력하세요." />
                </div>

                <div v-else class="result-row">
                  <div class="result-group">
                    <label class="result-label">성장 포인트</label>
                    <input v-model="growthPoint" type="text" class="result-input" placeholder="이번 성과를 통해 성장한 점" />
                  </div>
                  <div class="result-group">
                    <label class="result-label">개선 사항</label>
                    <input v-model="improvementPoint" type="text" class="result-input" placeholder="이전 보다 개선된 사항" />
                  </div>
                </div>

                <div class="result-group">
                  <label class="result-label">증빙 자료 첨부</label>
                  <input
                    ref="fileInput"
                    type="file"
                    class="sr-only"
                    multiple
                    accept=".pdf,.xlsx,.xls,.doc,.docx"
                    @change="handleFileChange"
                  />
                  <div
                    class="upload-zone"
                    role="button"
                    tabindex="0"
                    @click="openFilePicker"
                    @keydown.enter.prevent="openFilePicker"
                    @keydown.space.prevent="openFilePicker"
                  >
                    <Upload :size="24" />
                    <span class="upload-main">클릭하여 파일 업로드</span>
                    <span class="upload-sub">PDF, XLSX, DOCX (파일당 최대 50MB)</span>
                  </div>
                  <div v-if="selectedFiles.length > 0" class="upload-file-list">
                    <div
                      v-for="file in selectedFiles"
                      :key="`${file.name}-${file.size}-${file.lastModified}`"
                      class="upload-file-item"
                    >
                      <span class="upload-file-name">{{ file.name }}</span>
                      <button type="button" class="upload-file-remove" @click="removeFile(file)">삭제</button>
                    </div>
                  </div>
                </div>
              </template>
            </div>

            <!-- 모달 푸터 -->
            <div class="modal-footer">
              <template v-if="modalTab === 'detail'">
                <button class="btn-outline" @click="handleEdit">수정</button>
                <button class="btn-primary" @click="modalTab = 'result'">결과 등록하러 가기</button>
              </template>
              <template v-else>
                <button class="btn-outline" @click="modalTab = 'detail'">이전</button>
                <button class="btn-primary" :disabled="isSubmitting || isSubmissionLocked" @click="submitResult">
                  <CheckCircle :size="14" /> {{ isSubmitting ? '제출 중...' : '최종 결과 제출' }}
                </button>
              </template>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { Search, Filter, X, Upload, CheckCircle, AlertCircle, User } from 'lucide-vue-next'
import { getPerformanceInquiryItems, getPerformanceInquiryTeamMembers, updatePerformanceResult } from '@/api/performance'
import { AUTH_KEYS, USER_ROLES, isAdminRole, isEvaluatorRole, sessionRoleCodesRef, sessionRoleRef } from '@/utils/auth'

const selectedItem = ref(null)
const modalTab = ref('detail')
const fileInput = ref(null)
const selectedFiles = ref([])
const resultProgress = ref(85)
const resultSummary = ref('')
const resultNote = ref('')
const growthPoint = ref('')
const improvementPoint = ref('')
const isSubmitting = ref(false)

const filterStatus = ref('')
const filterEmployee = ref('')
const filterMonth = ref('')
const searchText = ref('')
const searchField = ref('title')
const currentPage = ref(1)
const pageSize = 12

const normalizeItem = (item) => ({
  ...item,
  type: item.type === 'TEAM' ? 'Team' : item.type === 'PERSONAL' ? 'Personal' : item.type,
})

const items = ref([])
const teamMemberOptions = ref([])
const loadError = ref('')
let inquiryRequestSeq = 0
const userId = computed(() => sessionStorage.getItem(AUTH_KEYS.userId) || '')
const userName = computed(() => sessionStorage.getItem(AUTH_KEYS.userName) || '')
const userRole = computed(() => sessionRoleRef.value || USER_ROLES.user)
const isPerformanceManager = computed(() =>
  isEvaluatorRole(sessionRoleCodesRef.value) || isAdminRole(sessionRoleCodesRef.value, userRole.value))
const currentEmployeeId = computed(() => sessionStorage.getItem(AUTH_KEYS.employeeId) || '')

const visibleItems = computed(() => {
  if (isPerformanceManager.value) return items.value

  return items.value.filter((item) => {
    if (currentEmployeeId.value) return String(item.employeeId || '') === String(currentEmployeeId.value)
    return item.employeeName === userName.value
  })
})

const employeeOptions = computed(() => teamMemberOptions.value)

const filteredItems = computed(() => {
  return visibleItems.value.filter((item) => {
    if (filterStatus.value && item.status !== filterStatus.value) return false
    if (filterMonth.value) {
      const [year, month] = filterMonth.value.split('-')
      if (!item.date?.includes(`${year}.${month}`) && !item.date?.includes(`${year}-${month}`)) return false
    }
    if (searchText.value) {
      const keyword = searchText.value.trim()
      const targetText = searchField.value === 'coreTask' ? (item.coreTask || '') : (item.title || '')
      if (!targetText.includes(keyword)) return false
    }
    return true
  })
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredItems.value.length / pageSize)))

const paginatedItems = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredItems.value.slice(start, start + pageSize)
})

const isTeamResult = computed(() => selectedItem.value?.type === 'Team' || selectedItem.value?.type === '팀 성과')
const isSubmissionLocked = computed(() => selectedItem.value?.status === '대기')

const normalizeSelectedFiles = (files = []) => files.filter((file, index, array) =>
  array.findIndex((item) =>
    item.name === file.name &&
    item.size === file.size &&
    item.lastModified === file.lastModified) === index)

function statusClass(status) {
  if (status === '완료') return 'badge-gray'
  if (status === '진행중') return 'badge-blue-light'
  return 'badge-yellow'
}

function openDetail(item) {
  selectedItem.value = item
  modalTab.value = 'detail'
  selectedFiles.value = []
  resultProgress.value = Number(item.progress) || 0
  resultSummary.value = ''
  resultNote.value = ''
  growthPoint.value = ''
  improvementPoint.value = ''
}

function openFilePicker() {
  fileInput.value?.click()
}

function handleFileChange(event) {
  const files = Array.from(event.target?.files || [])
  if (!files.length) return

  const oversizedFiles = files.filter((file) => file.size > 50 * 1024 * 1024)
  const validFiles = files.filter((file) => file.size <= 50 * 1024 * 1024)

  if (oversizedFiles.length > 0) {
    alert(`50MB를 초과한 파일은 업로드할 수 없습니다: ${oversizedFiles.map((file) => file.name).join(', ')}`)
  }

  if (validFiles.length > 0) {
    const mergedFiles = [...selectedFiles.value, ...validFiles]
    selectedFiles.value = normalizeSelectedFiles(mergedFiles)
  }
  event.target.value = ''
}

function removeFile(targetFile) {
  selectedFiles.value = selectedFiles.value.filter(
    (file) => !(
      file.name === targetFile.name &&
      file.size === targetFile.size &&
      file.lastModified === targetFile.lastModified
    ),
  )
}

function handleEdit() {
  alert('상세 항목을 확인한 뒤 결과 등록 탭에서 수정 내용을 제출할 수 있습니다.')
}

async function submitResult() {
  if (isSubmitting.value) return
  if (!selectedItem.value) return
  if (isSubmissionLocked.value) return
  const normalizedFiles = normalizeSelectedFiles(selectedFiles.value)
  selectedFiles.value = normalizedFiles
  if (!normalizedFiles.length) {
    alert('증빙 자료를 한 개 이상 첨부해주세요.')
    openFilePicker()
    return
  }
  if (!resultSummary.value.trim()) {
    alert('성과 요약을 입력해주세요.')
    return
  }
  const target = items.value.find((item) => item.id === selectedItem.value.id)
  if (!target) return
  isSubmitting.value = true
  try {
    await updatePerformanceResult(selectedItem.value.id, {
      progress: Number(resultProgress.value) || 0,
      resultSummary: resultSummary.value,
      resultNote: resultNote.value,
      growthPoint: growthPoint.value,
      improvementPoint: improvementPoint.value,
    }, normalizedFiles)
    target.progress = Number(resultProgress.value) || 0
    target.status = '대기'
    target.achievement = resultSummary.value
    selectedItem.value = target
    modalTab.value = 'detail'
    selectedFiles.value = []
    alert('결과가 등록되었고 평가자 승인 대기 상태로 변경되었습니다.')
  } catch (_error) {
    alert('성과 결과 등록에 실패했습니다.')
  } finally {
    isSubmitting.value = false
  }
}

async function loadInquiryItems(sequence = ++inquiryRequestSeq) {
  try {
    loadError.value = ''
    const params = {}
    if (isPerformanceManager.value && filterEmployee.value) {
      params.targetEmployeeId = filterEmployee.value
    }
    const response = await getPerformanceInquiryItems(params)
    if (sequence !== inquiryRequestSeq) return
    items.value = Array.isArray(response) ? response.map((item) => normalizeItem(item)) : []
  } catch (error) {
    if (sequence !== inquiryRequestSeq) return
    items.value = []
    selectedItem.value = null
    loadError.value = error?.response?.data?.error?.message || '성과 조회 API 호출에 실패했습니다.'
  }
}

async function loadTeamMembers() {
  if (!isPerformanceManager.value) return
  try {
    const response = await getPerformanceInquiryTeamMembers()
    teamMemberOptions.value = Array.isArray(response)
      ? response.map((member) => ({
          employeeId: member.employeeId ?? member.id,
          employeeName: member.employeeName ?? member.name,
          orgName: member.organizationName ?? member.orgName ?? member.department ?? '',
        }))
          .filter((member) => member.employeeId && member.employeeName)
      : []
  } catch (_error) {
    console.error('Failed to load team members for performance inquiry.', _error)
    teamMemberOptions.value = []
    alert(_error?.response?.data?.error?.message || '팀원 목록을 불러오지 못했습니다.')
  }
}

watch(filterEmployee, () => {
  if (!isPerformanceManager.value) return
  inquiryRequestSeq += 1
  currentPage.value = 1
  loadInquiryItems(inquiryRequestSeq)
})

watch(isPerformanceManager, (isManager) => {
  if (!isManager) return
  loadTeamMembers()
  loadInquiryItems()
})

watch([filterStatus, filterMonth, searchText, searchField], () => {
  currentPage.value = 1
})

watch(filteredItems, () => {
  if (currentPage.value > totalPages.value) {
    currentPage.value = totalPages.value
  }
})

onMounted(async () => {
  await loadTeamMembers()
  await loadInquiryItems()
})
</script>

<style scoped>
/* ════════════════════════════════
   레이아웃
   ════════════════════════════════ */
.inq-wrap {
  display: flex;
  flex-direction: column;
  min-height: 0;
  height: 100%;
}

.inq-card {
  background: #fff;
  border: 1px solid var(--gray200);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* ════════════════════════════════
   필터 바
   ════════════════════════════════ */
.filter-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  padding: 16px 20px;
  border-bottom: 1px solid var(--gray100);
}

.filter-left {
  display: flex;
  gap: 10px;
}

.filter-select-wrap,
.filter-search-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.filter-search-mode {
  height: 34px;
  padding: 0 10px;
  margin-right: 8px;
  background: var(--gray50);
  border: 1px solid var(--gray200);
  border-radius: var(--radius-xs);
  font-size: 0.8rem;
  color: var(--gray700);
  font-family: var(--font);
}

.filter-icon {
  position: absolute;
  left: 10px;
  color: var(--gray400);
  pointer-events: none;
}

.filter-search-wrap--manager .filter-icon {
  left: 102px;
}

.filter-select {
  padding: 8px 12px 8px 32px;
  background: var(--gray50);
  border: 1px solid var(--gray200);
  border-radius: var(--radius-xs);
  font-size: 0.82rem;
  font-family: var(--font);
  color: var(--gray700);
  appearance: none;
  cursor: pointer;
  transition: all var(--transition);
}

.filter-select:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px var(--accent);
}

.filter-month {
  padding: 8px 12px;
  background: var(--gray50);
  border: 1px solid var(--gray200);
  border-radius: var(--radius-xs);
  font-size: 0.82rem;
  font-family: var(--font);
  color: var(--gray700);
  transition: all var(--transition);
}

.filter-month:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px var(--accent);
}

.filter-search {
  padding: 8px 12px 8px 32px;
  width: 240px;
  background: var(--gray50);
  border: 1px solid var(--gray200);
  border-radius: var(--radius-xs);
  font-size: 0.82rem;
  color: var(--gray700);
  transition: all var(--transition);
}

.filter-search:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px var(--accent);
}

.filter-search::placeholder {
  color: var(--gray400);
}

/* ════════════════════════════════
   테이블
   ════════════════════════════════ */
.table-wrap {
  flex: 1;
  overflow-y: auto;
}

.pagination-bar {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  padding: 14px 20px;
  border-top: 1px solid var(--gray100);
  background: #fff;
}

.page-btn {
  min-width: 64px;
  height: 34px;
  padding: 0 12px;
  border: 1px solid var(--gray200);
  border-radius: var(--radius-xs);
  background: var(--gray50);
  color: var(--gray700);
  font-size: 0.82rem;
  cursor: pointer;
}

.page-btn:disabled {
  opacity: 0.45;
  cursor: default;
}

.page-status {
  min-width: 52px;
  text-align: center;
  font-size: 0.82rem;
  color: var(--gray600);
}

.inq-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.inq-table thead {
  position: sticky;
  top: 0;
  z-index: 5;
  background: var(--gray50);
}

.inq-table th {
  padding: 12px 20px;
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--gray500);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  white-space: nowrap;
}

.inq-table td {
  padding: 14px 20px;
  font-size: 0.9rem;
  border-bottom: 1px solid var(--gray100);
}

.inq-table tbody tr {
  cursor: pointer;
  transition: background var(--transition);
}

.inq-table tbody tr:hover {
  background: var(--accent);
}

.col-title {
  width: 35%;
}

.col-core {
  width: 24%;
}

.td-title {
  font-weight: 600;
  color: var(--gray800);
}

.td-date {
  color: var(--gray500);
  font-size: 0.82rem;
  white-space: nowrap;
}

.td-core {
  color: var(--gray600);
  font-size: 0.82rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 280px;
}

.td-empty {
  text-align: center;
  padding: 48px 20px;
  color: var(--gray400);
  font-size: 0.88rem;
}

/* 뱃지 */
.badge {
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  border-radius: 12px;
  font-size: 0.72rem;
  font-weight: 700;
  white-space: nowrap;
}

.badge-blue { background: #dbeafe; color: #1e40af; }
.badge-green { background: #dcfce7; color: #166534; }
.badge-blue-light { background: #eff6ff; color: #3b82f6; }
.badge-gray { background: var(--gray100); color: var(--gray700); }
.badge-yellow { background: #fef9c3; color: #a16207; }

/* 프로그레스 */
.progress-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.progress-bar {
  width: 80px;
  height: 5px;
  background: var(--gray100);
  border-radius: 3px;
  overflow: hidden;
}

.progress-bar.lg {
  width: 120px;
  height: 7px;
}

.progress-fill {
  height: 100%;
  border-radius: 3px;
  background: var(--primary);
  transition: width 0.5s ease;
}

.progress-text {
  font-family: var(--font-num);
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--gray500);
}

.action-btn {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-xs);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--gray400);
  background: transparent;
  transition: all var(--transition);
}

.action-btn:hover {
  color: var(--primary);
  background: var(--accent);
}

/* ════════════════════════════════
   모달
   ════════════════════════════════ */
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.modal-card {
  background: #fff;
  border-radius: var(--radius);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  width: 100%;
  max-width: 680px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 헤더 */
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 24px 28px 16px;
}

.modal-badges {
  display: flex;
  gap: 6px;
  margin-bottom: 10px;
}

.modal-title {
  font-size: 1.2rem;
  font-weight: 800;
  color: var(--gray800);
}

.close-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--gray400);
  background: transparent;
  transition: all var(--transition);
  flex-shrink: 0;
}

.close-btn:hover {
  background: var(--gray100);
  color: var(--gray700);
}

/* 탭 */
.modal-tabs {
  display: flex;
  gap: 0;
  padding: 0 28px;
  border-bottom: 1px solid var(--gray200);
}

.modal-tab {
  padding: 10px 16px;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--gray500);
  background: transparent;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
  transition: all var(--transition);
}

.modal-tab:hover {
  color: var(--gray700);
}

.modal-tab.active {
  color: var(--primary);
  border-bottom-color: var(--primary);
}

/* 바디 */
.modal-body {
  padding: 24px 28px;
  overflow-y: auto;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* 상세 조회 */
.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.detail-label {
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--gray400);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.detail-value {
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--gray700);
}

.detail-progress {
  display: flex;
  align-items: center;
  gap: 10px;
}

.progress-pct {
  font-family: var(--font-num);
  font-size: 0.9rem;
  font-weight: 800;
  color: var(--primary);
}

.detail-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.detail-box {
  background: var(--gray50);
  border: 1px solid var(--gray100);
  border-radius: var(--radius-sm);
  padding: 16px 18px;
  font-size: 0.85rem;
  color: var(--gray700);
  line-height: 1.6;
}

.detail-box ul {
  padding-left: 18px;
  margin-top: 8px;
}

.detail-box li {
  list-style: disc;
  margin-bottom: 4px;
  color: var(--gray600);
}

.detail-alert {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 14px 16px;
  border-radius: var(--radius-sm);
  font-size: 0.82rem;
  line-height: 1.5;
}

.detail-alert svg {
  flex-shrink: 0;
  margin-top: 1px;
}

.detail-alert.info {
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  color: #1e40af;
}

.detail-alert.warn {
  background: #fefce8;
  border: 1px solid #fde68a;
  color: #92400e;
}

.detail-alert.warn strong {
  display: block;
  font-size: 0.82rem;
  margin-bottom: 2px;
}

.detail-alert.warn p {
  font-size: 0.78rem;
  margin-top: 2px;
}

/* 결과 등록 */
.result-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.result-template-chip {
  display: inline-flex;
  align-items: center;
  align-self: flex-start;
  padding: 5px 10px;
  border-radius: 999px;
  font-size: 0.76rem;
  font-weight: 700;
  letter-spacing: 0.01em;
}

.chip-team {
  background: #eff6ff;
  color: #1d4ed8;
  border: 1px solid #bfdbfe;
}

.chip-individual {
  background: #ecfdf5;
  color: #047857;
  border: 1px solid #a7f3d0;
}

.result-label {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--gray700);
}

.range-wrap {
  display: flex;
  align-items: center;
  gap: 12px;
}

.range-input {
  flex: 1;
  height: 6px;
  appearance: none;
  background: var(--gray200);
  border-radius: 3px;
  outline: none;
  cursor: pointer;
}

.range-input::-webkit-slider-thumb {
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--primary);
  border: 3px solid #fff;
  box-shadow: 0 1px 4px rgba(0,0,0,0.15);
  cursor: pointer;
}

.range-value {
  font-family: var(--font-num);
  font-size: 0.88rem;
  font-weight: 800;
  color: var(--primary);
  background: var(--accent);
  border: 1px solid var(--accent2);
  border-radius: var(--radius-xs);
  padding: 4px 10px;
  min-width: 50px;
  text-align: center;
}

.result-textarea,
.result-input,
.result-select {
  width: 100%;
  padding: 10px 14px;
  background: #fff;
  border: 1px solid var(--gray200);
  border-radius: var(--radius-xs);
  font-size: 0.85rem;
  font-family: var(--font);
  color: var(--gray700);
  transition: all var(--transition);
}

.result-textarea {
  resize: none;
}

.result-textarea:focus,
.result-input:focus,
.result-select:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px var(--accent);
  outline: none;
}

.result-textarea::placeholder,
.result-input::placeholder {
  color: var(--gray400);
}

.result-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

/* 업로드 */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.upload-zone {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 28px;
  border: 2px dashed var(--gray200);
  border-radius: var(--radius-sm);
  color: var(--gray400);
  cursor: pointer;
  transition: all var(--transition);
}

.upload-zone:hover {
  border-color: var(--primary);
  background: var(--accent);
  color: var(--primary);
}

.upload-main {
  font-size: 0.85rem;
  font-weight: 600;
  margin-top: 6px;
}

.upload-sub {
  font-size: 0.72rem;
  color: var(--gray300);
  margin-top: 2px;
}

.upload-zone:hover .upload-sub {
  color: var(--gray400);
}

.upload-file-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 12px;
}

.upload-file-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 12px;
  border: 1px solid var(--gray200);
  border-radius: var(--radius-xs);
  background: var(--gray50);
}

.upload-file-name {
  color: var(--gray700);
  font-size: 0.8rem;
  word-break: break-all;
}

.upload-file-remove {
  border: none;
  background: transparent;
  color: #dc2626;
  font-size: 0.75rem;
  font-weight: 700;
  cursor: pointer;
}

/* 푸터 */
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 16px 28px;
  border-top: 1px solid var(--gray100);
  background: var(--gray50);
}

.btn-outline {
  padding: 10px 22px;
  border-radius: var(--radius-xs);
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--gray700);
  background: #fff;
  border: 1px solid var(--gray200);
  transition: all var(--transition);
}

.btn-outline:hover {
  background: var(--gray50);
  border-color: var(--gray300);
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 22px;
  border-radius: var(--radius-xs);
  font-size: 0.85rem;
  font-weight: 700;
  color: #fff;
  background: var(--primary);
  box-shadow: 0 2px 8px rgba(8, 145, 178, 0.25);
  transition: all var(--transition);
}

.btn-primary:hover {
  background: var(--primary-dark);
  box-shadow: 0 4px 14px rgba(8, 145, 178, 0.35);
}

/* ── 모달 애니메이션 ── */
.modal-enter-active { transition: all 0.25s ease; }
.modal-leave-active { transition: all 0.2s ease; }
.modal-enter-from { opacity: 0; }
.modal-leave-to { opacity: 0; }
.modal-enter-from .modal-card { transform: scale(0.95) translateY(10px); opacity: 0; }
.modal-leave-to .modal-card { transform: scale(0.97); opacity: 0; }
.modal-enter-active .modal-card { transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1); }
.modal-leave-active .modal-card { transition: all 0.15s ease; }
</style>
