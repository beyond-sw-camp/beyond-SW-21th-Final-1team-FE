<template>
  <div class="admin-salary-page">
    <div class="page-header">
      <div>
        <h1 class="page-title">급여 관리</h1>
        <p class="page-description">payroll 모듈의 실제 급여 계산, 대장, 설정, 보험요율 API를 관리합니다.</p>
      </div>
    </div>

    <div class="tabs-container">
      <button class="tab-btn" :class="{ active: currentTab === 'monthly' }" @click="currentTab = 'monthly'">월 급여 관리</button>
      <button class="tab-btn" :class="{ active: currentTab === 'employee' }" @click="currentTab = 'employee'">사원별 급여 설정</button>
      <button class="tab-btn" :class="{ active: currentTab === 'settings' }" @click="openSettingsTab">환경 설정</button>
      <button class="tab-btn" :class="{ active: currentTab === 'severance' }" @click="currentTab = 'severance'">퇴직금 정산</button>
    </div>

    <div v-if="pageError" class="page-error">{{ pageError }}</div>
    <div v-if="pageNotice" class="page-notice">{{ pageNotice }}</div>

    <section v-if="currentTab === 'monthly'" class="section-container">
      <div class="card control-bar">
        <div class="control-group">
          <label>귀속년월</label>
          <input v-model="targetMonth" type="month" class="month-input" />
        </div>
        <div class="status-badge" :class="monthStatus">
          {{ monthStatusLabel }}
        </div>
        <div class="control-actions">
          <button class="btn-secondary" :disabled="ledgerLoading" @click="reloadMonthlyData">조회</button>
          <button class="btn-primary" :disabled="actionLoading" @click="runCalculation">일괄 급여 계산</button>
          <button class="btn-warning" :disabled="actionLoading || monthStatus === 'initial'" @click="finalizeSalary">급여 마감</button>
          <button class="btn-outline" :disabled="actionLoading || monthStatus !== 'closed'" @click="sendPayStubs">명세서 발송 처리</button>
          <button class="btn-secondary" :disabled="exportLoading" @click="downloadLedgerCsv(false)">대장 CSV</button>
          <button class="btn-secondary" :disabled="exportLoading" @click="downloadLedgerCsv(true)">이체 CSV</button>
        </div>
      </div>

      <div class="card result-summary">
        <div class="summary-box">
          <span class="label">대상 건수</span>
          <strong>{{ ledgerPage.totalElements }}</strong>
        </div>
        <div class="summary-box">
          <span class="label">계산 결과</span>
          <strong>{{ lastBatchSummary }}</strong>
        </div>
        <div class="summary-box">
          <span class="label">마감 결과</span>
          <strong>{{ lastFinalizeSummary }}</strong>
        </div>
        <div class="summary-box">
          <span class="label">발송 결과</span>
          <strong>{{ lastSendSummary }}</strong>
        </div>
      </div>

      <div class="card ledger-card">
        <div class="card-header">
          <h3>{{ targetMonth }} 급여 대장</h3>
          <span class="count">총 {{ ledgerPage.totalElements }}건</span>
        </div>

        <div v-if="ledgerLoading" class="empty-state">급여 대장을 불러오는 중입니다.</div>
        <div v-else-if="!ledgerRows.length" class="empty-state">해당 월 급여 대장이 없습니다.</div>
        <div v-else class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>사번</th>
                <th>이름</th>
                <th>부서</th>
                <th>직급</th>
                <th class="text-right">기본급</th>
                <th class="text-right">식대</th>
                <th class="text-right">연장수당</th>
                <th class="text-right">지급총액</th>
                <th class="text-right">공제총액</th>
                <th class="text-right">실지급액</th>
                <th>마감</th>
                <th>발송</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in ledgerRows" :key="item.id">
                <td>{{ item.employeeId }}</td>
                <td>{{ item.employeeName }}</td>
                <td>{{ item.departmentName || '-' }}</td>
                <td>{{ item.positionName || '-' }}</td>
                <td class="text-right">{{ formatNumber(item.salaryAmount) }}</td>
                <td class="text-right">{{ formatNumber(item.mealAmount) }}</td>
                <td class="text-right">{{ formatNumber(item.overtimeAmount) }}</td>
                <td class="text-right font-bold">{{ formatNumber(item.totalPayment) }}</td>
                <td class="text-right">{{ formatNumber(item.totalDeductionAmount) }}</td>
                <td class="text-right font-bold text-primary">{{ formatNumber(item.netPay) }}</td>
                <td>
                  <span class="badge" :class="item.isFinalized === 'Y' ? 'success' : 'pending'">
                    {{ item.isFinalized === 'Y' ? '완료' : '미완료' }}
                  </span>
                </td>
                <td>
                  <div class="send-cell">
                    <span>{{ item.sendStatusDescription || '-' }}</span>
                    <button
                      class="btn-tiny primary"
                      :disabled="actionLoading || item.isFinalized !== 'Y' || item.isSent === 'Y'"
                      @click="sendSinglePayStub(item)"
                    >
                      개별 발송
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <section v-else-if="currentTab === 'employee'" class="section-container employee-settings">
      <div class="card employee-search-card">
        <div class="control-group search-group">
          <label>사원 검색</label>
          <input
            v-model="employeeKeyword"
            type="text"
            class="month-input employee-id-input"
            placeholder="사번, 이름, 부서로 검색"
            @keyup.enter="searchEmployees"
          />
          <button class="btn-secondary" :disabled="employeeLoading" @click="searchEmployees">검색</button>
        </div>
        <p class="helper-text">payroll 모듈 검색 API로 사원을 찾은 뒤 선택하면 급여 설정 이력과 저장 폼이 자동으로 채워집니다.</p>
      </div>

      <div class="employee-grid">
        <div class="card">
          <div class="card-header">
            <h3>검색 결과</h3>
            <span class="count">총 {{ employeeSearchResults.length }}건</span>
          </div>
          <div v-if="employeeLoading" class="empty-state">사원을 검색하는 중입니다.</div>
          <div v-else-if="!employeeSearchResults.length" class="empty-state">검색된 사원이 없습니다.</div>
          <div v-else class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>사번</th>
                  <th>이름</th>
                  <th>부서</th>
                  <th>직급</th>
                  <th>상태</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in employeeSearchResults" :key="item.employeeId">
                  <td>{{ item.employeeNum }}</td>
                  <td>{{ item.employeeName }}</td>
                  <td>{{ item.departmentName || '-' }}</td>
                  <td>{{ item.positionName || '-' }}</td>
                  <td>{{ item.employState }}</td>
                  <td>
                    <button class="btn-tiny primary" @click="selectEmployee(item)">선택</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <h3>급여 설정 이력</h3>
            <span class="count">총 {{ salarySettings.length }}건</span>
          </div>
          <div v-if="employeeLoading" class="empty-state">급여 설정 이력을 불러오는 중입니다.</div>
          <div v-else-if="!salarySettings.length" class="empty-state">조회된 급여 설정이 없습니다.</div>
          <div v-else class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>기본급</th>
                  <th>식대</th>
                  <th>적용 시작일</th>
                  <th>적용 종료일</th>
                  <th>계좌 정보</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in salarySettings" :key="item.id">
                  <td>{{ item.id }}</td>
                  <td>{{ formatNumber(item.baseSalary) }}</td>
                  <td>{{ formatNumber(item.mealAllowance) }}</td>
                  <td>{{ item.applyStartDate }}</td>
                  <td>{{ item.applyEndDate || '-' }}</td>
                  <td>{{ item.bankName || '-' }} / {{ item.maskedAccountNumber || '-' }}</td>
                  <td>
                    <button class="btn-tiny primary" @click="editSalarySetting(item)">수정</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <h3>{{ salaryForm.settingId ? '급여 설정 수정' : '급여 설정 등록' }}</h3>
          </div>
          <p class="helper-text" v-if="selectedEmployee">
            선택된 사원: {{ selectedEmployee.employeeName }} ({{ selectedEmployee.employeeNum }}) / {{ selectedEmployee.departmentName || '-' }}
          </p>
          <div class="form-grid">
            <div class="form-group">
              <label>사원 ID</label>
              <input v-model="salaryForm.employeeId" type="number" min="1" :readonly="!!salaryForm.settingId" />
            </div>
            <div class="form-group">
              <label>기본급</label>
              <input v-model="salaryForm.baseSalary" type="number" min="0" />
            </div>
            <div class="form-group">
              <label>식대</label>
              <input v-model="salaryForm.mealAllowance" type="number" min="0" />
            </div>
            <div class="form-group">
              <label>적용 시작일</label>
              <input v-model="salaryForm.applyStartDate" type="date" />
            </div>
            <div class="form-group">
              <label>적용 종료일</label>
              <input v-model="salaryForm.applyEndDate" type="date" />
            </div>
          </div>
          <div class="form-actions">
            <button class="btn-secondary" @click="resetSalaryForm">초기화</button>
            <button class="btn-save" :disabled="savingEmployeeSetting" @click="saveEmployeeSalary">
              {{ savingEmployeeSetting ? '저장 중...' : '저장' }}
            </button>
          </div>
        </div>
      </div>
    </section>

    <section v-else-if="currentTab === 'settings'" class="section-container settings-grid">
      <div class="card">
        <div class="card-header">
          <h3>보험 요율 목록</h3>
          <span class="count">총 {{ insuranceRates.length }}건</span>
        </div>
        <div v-if="settingsLoading" class="empty-state">보험 요율을 불러오는 중입니다.</div>
        <div v-else-if="!insuranceRates.length" class="empty-state">등록된 보험 요율이 없습니다.</div>
        <div v-else class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>적용 연도</th>
                <th>국민연금</th>
                <th>건강보험</th>
                <th>장기요양</th>
                <th>고용보험</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in insuranceRates" :key="item.insuranceId">
                <td>{{ item.applyYear }}</td>
                <td>{{ formatRate(item.nationalPensionRate) }}</td>
                <td>{{ formatRate(item.healthInsuranceRate) }}</td>
                <td>{{ formatRate(item.longTermCareRate) }}</td>
                <td>{{ formatRate(item.empInsuranceRate) }}</td>
                <td>
                  <button class="btn-tiny primary" @click="editRate(item)">수정</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <h3>{{ rateForm.insuranceId ? '보험 요율 수정' : '보험 요율 등록' }}</h3>
        </div>
        <div class="form-grid">
          <div class="form-group">
            <label>적용 연도</label>
            <input v-model="rateForm.applyYear" type="number" min="2000" max="2100" />
          </div>
          <div class="form-group">
            <label>국민연금</label>
            <input v-model="rateForm.nationalPensionRate" type="number" step="0.0001" min="0" max="1" />
          </div>
          <div class="form-group">
            <label>건강보험</label>
            <input v-model="rateForm.healthInsuranceRate" type="number" step="0.0001" min="0" max="1" />
          </div>
          <div class="form-group">
            <label>장기요양</label>
            <input v-model="rateForm.longTermCareRate" type="number" step="0.0001" min="0" max="1" />
          </div>
          <div class="form-group">
            <label>고용보험</label>
            <input v-model="rateForm.empInsuranceRate" type="number" step="0.0001" min="0" max="1" />
          </div>
        </div>
        <div class="form-actions">
          <button class="btn-secondary" @click="resetRateForm">초기화</button>
          <button class="btn-save" :disabled="savingRate" @click="saveRate">
            {{ savingRate ? '저장 중...' : '요율 저장' }}
          </button>
        </div>
      </div>
    </section>

    <section v-else class="section-container">
      <div class="card employee-search-card">
        <div class="control-group search-group">
          <label>사원 검색</label>
          <input
            v-model="severanceKeyword"
            type="text"
            class="month-input employee-id-input"
            placeholder="사번, 이름, 부서로 검색"
            @keyup.enter="searchSeveranceEmployees"
          />
          <button class="btn-secondary" :disabled="severanceLoading" @click="searchSeveranceEmployees">검색</button>
        </div>
        <div class="control-group">
          <label>퇴직일</label>
          <input v-model="retirementDate" type="date" class="month-input" />
          <button
            class="btn-primary"
            :disabled="severanceLoading || !selectedSeveranceEmployee || !retirementDate"
            @click="calculateSeverance"
          >
            계산
          </button>
        </div>
      </div>

      <div class="employee-grid">
        <div class="card">
          <div class="card-header">
            <h3>퇴직금 대상 사원</h3>
            <span class="count">총 {{ employeeSearchResults.length }}건</span>
          </div>
          <div v-if="severanceLoading && !severancePreview" class="empty-state">사원을 조회하는 중입니다.</div>
          <div v-else-if="!employeeSearchResults.length" class="empty-state">검색된 사원이 없습니다.</div>
          <div v-else class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>사번</th>
                  <th>이름</th>
                  <th>부서</th>
                  <th>직급</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="item in employeeSearchResults"
                  :key="`severance-${item.employeeId}`"
                  :class="{ selected: selectedSeveranceEmployee?.employeeId === item.employeeId }"
                >
                  <td>{{ item.employeeNum }}</td>
                  <td>{{ item.employeeName }}</td>
                  <td>{{ item.departmentName || '-' }}</td>
                  <td>{{ item.positionName || '-' }}</td>
                  <td>
                    <button class="btn-tiny primary" @click="selectSeveranceEmployee(item)">선택</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <h3>퇴직금 예상 결과</h3>
          </div>
          <div v-if="!severancePreview" class="empty-state">
            사원을 선택하고 퇴직일을 입력한 뒤 계산을 실행하세요.
          </div>
          <div v-else class="severance-preview">
            <div class="summary-boxes">
              <div class="summary-box">
                <span class="label">예상 퇴직금</span>
                <strong>{{ formatNumber(severancePreview.estimatedSeveranceAmount) }}원</strong>
              </div>
              <div class="summary-box">
                <span class="label">평균 월임금</span>
                <strong>{{ formatNumber(severancePreview.averageMonthlyWage) }}원</strong>
              </div>
              <div class="summary-box">
                <span class="label">근속연수</span>
                <strong>{{ severancePreview.serviceYears }}년</strong>
              </div>
            </div>

            <div class="detail-grid">
              <div><span class="detail-label">사원</span><strong>{{ severancePreview.employeeName }} ({{ severancePreview.employeeNum }})</strong></div>
              <div><span class="detail-label">부서/직급</span><strong>{{ severancePreview.departmentName || '-' }} / {{ severancePreview.positionName || '-' }}</strong></div>
              <div><span class="detail-label">입사일</span><strong>{{ severancePreview.hireDate }}</strong></div>
              <div><span class="detail-label">퇴직일</span><strong>{{ severancePreview.retirementDate }}</strong></div>
              <div><span class="detail-label">근속일수</span><strong>{{ severancePreview.serviceDays }}일</strong></div>
              <div><span class="detail-label">참조월</span><strong>{{ severancePreview.referenceStartMonth }} ~ {{ severancePreview.referenceEndMonth }}</strong></div>
              <div><span class="detail-label">급여계좌</span><strong>{{ severancePreview.bankName || '-' }} / {{ severancePreview.maskedAccountNumber || '-' }}</strong></div>
              <div><span class="detail-label">지급대상</span><strong>{{ severancePreview.eligible ? '예' : '아니오' }}</strong></div>
            </div>

            <p class="helper-text">{{ severancePreview.note }}</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { usePayrollStore } from '@/store/payroll'

const payrollStore = usePayrollStore()

const toMonthKey = (value = new Date()) => {
  const year = value.getFullYear()
  const month = String(value.getMonth() + 1).padStart(2, '0')
  return `${year}-${month}`
}

const currentTab = ref('monthly')
const targetMonth = ref(toMonthKey())
const pageError = ref('')
const pageNotice = ref('')
const ledgerLoading = ref(false)
const actionLoading = ref(false)
const exportLoading = ref(false)
const employeeLoading = ref(false)
const savingEmployeeSetting = ref(false)
const settingsLoading = ref(false)
const savingRate = ref(false)
const employeeIdInput = ref('')
const employeeKeyword = ref('')
const severanceKeyword = ref('')
const severanceLoading = ref(false)
const retirementDate = ref('')
const selectedEmployee = ref(null)
const selectedSeveranceEmployee = ref(null)

const salaryForm = reactive({
  settingId: null,
  employeeId: '',
  baseSalary: '',
  mealAllowance: '',
  applyStartDate: '',
  applyEndDate: '',
})

const rateForm = reactive({
  insuranceId: null,
  applyYear: new Date().getFullYear(),
  nationalPensionRate: '',
  healthInsuranceRate: '',
  longTermCareRate: '',
  empInsuranceRate: '',
})

const ledgerPage = computed(() => payrollStore.adminLedgerPage)
const ledgerRows = computed(() => payrollStore.adminLedgerPage.content || [])
const insuranceRates = computed(() => payrollStore.insuranceRates)
const salarySettings = computed(() => payrollStore.salarySettingHistory)
const employeeSearchResults = computed(() => payrollStore.employeeSearchPage.content || [])
const severancePreview = computed(() => payrollStore.severancePreview)

const monthStatus = computed(() => {
  if (!ledgerRows.value.length) return 'initial'
  return ledgerRows.value.every((item) => item.isFinalized === 'Y') ? 'closed' : 'calculated'
})

const monthStatusLabel = computed(() => {
  if (monthStatus.value === 'initial') return '정산 대기'
  if (monthStatus.value === 'calculated') return '계산 완료'
  return '마감 완료'
})

const lastBatchSummary = computed(() => {
  const result = payrollStore.lastBatchResult
  if (!result) return '-'
  return `${result.calculatedCount}건 계산 / ${result.skippedCount}건 건너뜀 / ${result.failedCount}건 실패`
})

const lastFinalizeSummary = computed(() => {
  const result = payrollStore.lastFinalizeResult
  if (!result) return '-'
  return `${result.finalizedCount}건 마감 / 이미 마감 ${result.alreadyFinalizedCount}건`
})

const lastSendSummary = computed(() => {
  const result = payrollStore.lastSendResult
  if (!result) return '-'
  return result.message || `${result.sentCount}건 발송 처리`
})

const getYearMonth = () => {
  const [year, month] = targetMonth.value.split('-').map(Number)
  return { year, month }
}

const formatNumber = (value) => Number(value || 0).toLocaleString('ko-KR')
const formatRate = (value) => `${(Number(value || 0) * 100).toFixed(3)}%`
const getErrorMessage = payrollStore.normalizeError

const downloadBlob = (blobData, filename, type) => {
  const blob = new Blob([blobData], { type })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}

const reloadMonthlyData = async () => {
  ledgerLoading.value = true
  pageError.value = ''

  try {
    const { year, month } = getYearMonth()
    await payrollStore.fetchAdminLedgers({ year, month, page: 1, size: 100 })
  } catch (error) {
    pageError.value = getErrorMessage(error, '급여 대장을 불러오지 못했습니다.')
  } finally {
    ledgerLoading.value = false
  }
}

const runCalculation = async () => {
  actionLoading.value = true
  pageError.value = ''
  pageNotice.value = ''

  try {
    const { year, month } = getYearMonth()
    const result = await payrollStore.runMonthlyCalculation(year, month)
    await reloadMonthlyData()
    pageNotice.value = `${targetMonth.value} 급여 계산 완료: ${result.calculatedCount}건 계산, ${result.failedCount}건 실패`
  } catch (error) {
    pageError.value = getErrorMessage(error, '월 급여 계산에 실패했습니다.')
  } finally {
    actionLoading.value = false
  }
}

const finalizeSalary = async () => {
  actionLoading.value = true
  pageError.value = ''
  pageNotice.value = ''

  try {
    const { year, month } = getYearMonth()
    const result = await payrollStore.runMonthlyFinalize(year, month)
    await reloadMonthlyData()
    pageNotice.value = `${result.finalizedCount}건 급여가 마감됐습니다.`
  } catch (error) {
    pageError.value = getErrorMessage(error, '급여 마감에 실패했습니다.')
  } finally {
    actionLoading.value = false
  }
}

const sendPayStubs = async () => {
  actionLoading.value = true
  pageError.value = ''
  pageNotice.value = ''

  try {
    const { year, month } = getYearMonth()
    const result = await payrollStore.runMonthlySend(year, month)
    await reloadMonthlyData()
    pageNotice.value = result.message || `${result.sentCount}건의 명세서 발송 처리를 완료했습니다.`
  } catch (error) {
    pageError.value = getErrorMessage(error, '명세서 발송 처리에 실패했습니다.')
  } finally {
    actionLoading.value = false
  }
}

const sendSinglePayStub = async (item) => {
  if (!item?.id || actionLoading.value) return

  actionLoading.value = true
  pageError.value = ''
  pageNotice.value = ''

  try {
    const result = await payrollStore.runLedgerSend(item.id)
    await reloadMonthlyData()
    pageNotice.value = result.message || `${item.employeeName} 명세서 발송 요청을 등록했습니다.`
  } catch (error) {
    pageError.value = getErrorMessage(error, '개별 명세서 발송 처리에 실패했습니다.')
  } finally {
    actionLoading.value = false
  }
}

const downloadLedgerCsv = async (transfer) => {
  exportLoading.value = true
  pageError.value = ''

  try {
    const { year, month } = getYearMonth()
    const blobData = await payrollStore.downloadAdminLedgerExport({ year, month }, transfer)
    const suffix = transfer ? 'transfer' : 'ledger'
    downloadBlob(blobData, `payroll-${suffix}-${targetMonth.value}.csv`, 'text/csv;charset=utf-8')
  } catch (error) {
    pageError.value = getErrorMessage(error, 'CSV 다운로드에 실패했습니다.')
  } finally {
    exportLoading.value = false
  }
}

const resetSalaryForm = () => {
  salaryForm.settingId = null
  salaryForm.employeeId = employeeIdInput.value || ''
  salaryForm.baseSalary = ''
  salaryForm.mealAllowance = ''
  salaryForm.applyStartDate = ''
  salaryForm.applyEndDate = ''
}

const searchEmployees = async () => {
  employeeLoading.value = true
  pageError.value = ''
  pageNotice.value = ''

  try {
    await payrollStore.searchEmployees({
      keyword: employeeKeyword.value.trim() || null,
      page: 1,
      size: 20,
    })
  } catch (error) {
    pageError.value = getErrorMessage(error, '사원 검색에 실패했습니다.')
  } finally {
    employeeLoading.value = false
  }
}

const loadEmployeeSettings = async () => {
  if (!employeeIdInput.value) return
  employeeLoading.value = true
  pageError.value = ''
  pageNotice.value = ''

  try {
    await payrollStore.fetchSalarySettings(Number(employeeIdInput.value))
    resetSalaryForm()
    pageNotice.value = `사원 ${employeeIdInput.value}의 급여 설정 이력을 불러왔습니다.`
  } catch (error) {
    pageError.value = getErrorMessage(error, '급여 설정 이력을 불러오지 못했습니다.')
  } finally {
    employeeLoading.value = false
  }
}

const selectEmployee = async (item) => {
  selectedEmployee.value = item
  employeeIdInput.value = String(item.employeeId)
  salaryForm.employeeId = String(item.employeeId)
  await loadEmployeeSettings()
}

const editSalarySetting = (item) => {
  salaryForm.settingId = item.id
  salaryForm.employeeId = item.employeeId
  salaryForm.baseSalary = item.baseSalary
  salaryForm.mealAllowance = item.mealAllowance
  salaryForm.applyStartDate = item.applyStartDate
  salaryForm.applyEndDate = item.applyEndDate || ''
}

const saveEmployeeSalary = async () => {
  savingEmployeeSetting.value = true
  pageError.value = ''
  pageNotice.value = ''

  try {
    const payload = {
      settingId: salaryForm.settingId,
      employeeId: Number(salaryForm.employeeId),
      baseSalary: Number(salaryForm.baseSalary),
      mealAllowance: Number(salaryForm.mealAllowance),
      applyStartDate: salaryForm.applyStartDate,
      applyEndDate: salaryForm.applyEndDate || null,
    }
    await payrollStore.saveSalarySetting(payload)
    employeeIdInput.value = String(payload.employeeId)
    resetSalaryForm()
    pageNotice.value = '급여 설정을 저장했습니다.'
  } catch (error) {
    pageError.value = getErrorMessage(error, '급여 설정 저장에 실패했습니다.')
  } finally {
    savingEmployeeSetting.value = false
  }
}

const resetRateForm = () => {
  rateForm.insuranceId = null
  rateForm.applyYear = new Date().getFullYear()
  rateForm.nationalPensionRate = ''
  rateForm.healthInsuranceRate = ''
  rateForm.longTermCareRate = ''
  rateForm.empInsuranceRate = ''
}

const openSettingsTab = async () => {
  currentTab.value = 'settings'
  if (!insuranceRates.value.length) {
    settingsLoading.value = true
    try {
      await payrollStore.fetchInsuranceRateList()
    } catch (error) {
      pageError.value = getErrorMessage(error, '보험 요율을 불러오지 못했습니다.')
    } finally {
      settingsLoading.value = false
    }
  }
}

const editRate = (item) => {
  rateForm.insuranceId = item.insuranceId
  rateForm.applyYear = item.applyYear
  rateForm.nationalPensionRate = item.nationalPensionRate
  rateForm.healthInsuranceRate = item.healthInsuranceRate
  rateForm.longTermCareRate = item.longTermCareRate
  rateForm.empInsuranceRate = item.empInsuranceRate
  currentTab.value = 'settings'
}

const saveRate = async () => {
  savingRate.value = true
  pageError.value = ''
  pageNotice.value = ''

  try {
    await payrollStore.saveInsuranceRate({
      insuranceId: rateForm.insuranceId,
      applyYear: Number(rateForm.applyYear),
      nationalPensionRate: Number(rateForm.nationalPensionRate),
      healthInsuranceRate: Number(rateForm.healthInsuranceRate),
      longTermCareRate: Number(rateForm.longTermCareRate),
      empInsuranceRate: Number(rateForm.empInsuranceRate),
    })
    resetRateForm()
    pageNotice.value = '보험 요율을 저장했습니다.'
  } catch (error) {
    pageError.value = getErrorMessage(error, '보험 요율 저장에 실패했습니다.')
  } finally {
    savingRate.value = false
  }
}

const searchSeveranceEmployees = async () => {
  severanceLoading.value = true
  pageError.value = ''
  pageNotice.value = ''

  try {
    await payrollStore.searchEmployees({
      keyword: severanceKeyword.value.trim() || null,
      page: 1,
      size: 20,
    })
  } catch (error) {
    pageError.value = getErrorMessage(error, '퇴직금 대상 사원 검색에 실패했습니다.')
  } finally {
    severanceLoading.value = false
  }
}

const selectSeveranceEmployee = (item) => {
  selectedSeveranceEmployee.value = item
}

const calculateSeverance = async () => {
  if (!selectedSeveranceEmployee.value?.employeeId || !retirementDate.value) return

  severanceLoading.value = true
  pageError.value = ''
  pageNotice.value = ''

  try {
    await payrollStore.fetchSeverancePreview(
      selectedSeveranceEmployee.value.employeeId,
      retirementDate.value,
    )
    pageNotice.value = `${selectedSeveranceEmployee.value.employeeName}의 예상 퇴직금을 계산했습니다.`
  } catch (error) {
    pageError.value = getErrorMessage(error, '퇴직금 계산에 실패했습니다.')
  } finally {
    severanceLoading.value = false
  }
}

onMounted(async () => {
  await reloadMonthlyData()
})
</script>

<style scoped>
.admin-salary-page {
  min-height: 100vh;
  padding: 32px;
  background: var(--background-gray);
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.page-title {
  margin: 0 0 6px;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--gray900);
}

.page-description {
  margin: 0;
  color: var(--gray600);
}

.tabs-container {
  display: flex;
  gap: 8px;
  border-bottom: 2px solid var(--gray200);
}

.tab-btn {
  padding: 12px 20px;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
  color: var(--gray500);
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
}

.tab-btn.active {
  color: var(--primary);
  border-bottom-color: var(--primary);
}

.section-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.card {
  background: #fff;
  border: 1px solid var(--gray200);
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.02);
  padding: 24px;
}

.page-error,
.page-notice {
  padding: 12px 14px;
  border-radius: 8px;
  font-size: 0.92rem;
}

.page-error {
  color: #b91c1c;
  background: #fef2f2;
  border: 1px solid #fecaca;
}

.page-notice {
  color: #0f766e;
  background: #ecfeff;
  border: 1px solid #a5f3fc;
}

.control-bar,
.result-summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.control-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.search-group {
  flex: 1;
}

.control-group label,
.form-group label {
  font-weight: 600;
  color: var(--gray700);
}

.month-input,
.form-group input {
  padding: 10px 12px;
  border: 1px solid var(--gray300);
  border-radius: 6px;
  font-size: 0.95rem;
}

.employee-id-input {
  min-width: 180px;
}

.control-actions,
.form-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.btn-primary,
.btn-secondary,
.btn-warning,
.btn-outline,
.btn-save,
.btn-tiny {
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}

.btn-primary,
.btn-save {
  background: var(--primary);
  color: #fff;
  border: none;
  padding: 10px 18px;
}

.btn-secondary {
  background: var(--gray100);
  color: var(--gray700);
  border: 1px solid var(--gray300);
  padding: 10px 18px;
}

.btn-warning {
  background: #f59e0b;
  color: #fff;
  border: none;
  padding: 10px 18px;
}

.btn-outline {
  background: #fff;
  color: var(--primary);
  border: 1px solid var(--primary);
  padding: 10px 18px;
}

.btn-tiny {
  border: none;
  padding: 6px 10px;
  font-size: 0.82rem;
  color: #fff;
}

.btn-tiny.primary {
  background: var(--primary);
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.status-badge {
  padding: 6px 16px;
  border-radius: 999px;
  font-size: 0.9rem;
  font-weight: 700;
}

.status-badge.initial {
  background: #f3f4f6;
  color: var(--gray600);
}

.status-badge.calculated {
  background: #e0f2fe;
  color: #0284c7;
}

.status-badge.closed {
  background: #ecfdf5;
  color: #059669;
}

.summary-box {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 160px;
}

.summary-box .label {
  font-size: 0.85rem;
  color: var(--gray500);
}

.summary-box strong {
  color: var(--gray900);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.count {
  color: var(--gray500);
  font-size: 0.9rem;
}

.table-responsive {
  overflow: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.92rem;
}

.data-table th,
.data-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid var(--gray100);
}

.data-table th {
  background: var(--gray50);
  color: var(--gray600);
  font-weight: 600;
}

.text-right {
  text-align: right !important;
}

.font-bold {
  font-weight: 700;
}

.text-primary {
  color: var(--primary);
}

.badge {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  padding: 4px 10px;
  font-size: 0.78rem;
  font-weight: 700;
}

.badge.success {
  background: #dcfce7;
  color: #166534;
}

.badge.pending {
  background: #fef3c7;
  color: #92400e;
}

.send-cell {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.empty-state {
  padding: 40px;
  text-align: center;
  color: var(--gray500);
}

.helper-text {
  margin: 10px 0 0;
  color: var(--gray500);
  font-size: 0.9rem;
}

.employee-grid,
.settings-grid {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 20px;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.data-table tbody tr.selected {
  background: #eef6ff;
}

.severance-preview {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.summary-boxes {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px 16px;
}

.detail-grid > div {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.detail-label {
  color: var(--gray500);
  font-size: 0.86rem;
}

@media (max-width: 1200px) {
  .employee-grid,
  .settings-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .admin-salary-page {
    padding: 20px;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .detail-grid,
  .summary-boxes {
    grid-template-columns: 1fr;
  }
}
</style>
