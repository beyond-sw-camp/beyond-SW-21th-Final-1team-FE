<template>
  <div class="salary-dashboard">
    <div v-if="!isVerified" class="password-overlay">
      <div class="login-card">
        <div class="icon-lock">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
        </div>
        <h2>급여 명세서 조회</h2>
        <p class="desc">개인 정보 보호를 위해 비밀번호를 입력해주세요.</p>

        <form class="login-form" @submit.prevent="verifyPassword">
          <div class="input-group">
            <input
              v-model="password"
              type="password"
              placeholder="비밀번호를 입력하세요"
              :disabled="verifying"
            />
          </div>
          <p v-if="passwordError" class="form-error">{{ passwordError }}</p>
          <button type="submit" class="btn-submit" :disabled="verifying || !password.trim()">
            {{ verifying ? '확인 중...' : '확인' }}
          </button>
        </form>
      </div>
    </div>

    <div v-if="isVerified" class="content-wrap">
      <div v-if="pageError" class="page-error">
        {{ pageError }}
      </div>

      <div v-if="isLoading && !selectedDetail" class="page-empty">
        급여 정보를 불러오는 중입니다.
      </div>

      <template v-else>
        <div class="top-row">
          <div class="card salary-card">
            <div class="card-header-row">
              <div class="date-info">
                <span class="icon-calendar">📅</span>
                <span>{{ currentPayrollLabel }}</span>
              </div>
              <span class="status-badge">
                {{ selectedDetail ? '조회 가능' : '명세서 없음' }}
              </span>
            </div>

            <div v-if="selectedDetail" class="salary-display">
              <div class="amount-main">{{ formatCurrency(selectedDetail.netPay) }}</div>
              <div class="sub-info">
                실수령액
                <span v-if="selectedDetail.totalPayment !== null">
                  (세전 {{ formatCurrency(selectedDetail.totalPayment) }})
                </span>
              </div>
            </div>
            <div v-else class="page-empty compact-empty">
              선택한 급여 명세서가 없습니다.
            </div>

            <div v-if="selectedDetail" class="salary-actions">
              <div class="detail-row">
                <div class="detail-item">
                  <span class="label">기본급</span>
                  <span class="value">{{ formatCurrency(selectedDetail.salaryAmount) }}</span>
                </div>
                <div class="divider"></div>
                <div class="detail-item">
                  <span class="label">식대</span>
                  <span class="value">{{ formatCurrency(selectedDetail.mealAmount) }}</span>
                </div>
                <div class="divider"></div>
                <div class="detail-item">
                  <span class="label">연장수당</span>
                  <span class="value">{{ formatCurrency(selectedDetail.overtimeAmount) }}</span>
                </div>
              </div>

              <div class="account-summary">
                <span>{{ selectedDetail.paymentDateLabel }}</span>
                <span>{{ selectedDetail.bankName || '-' }} / {{ selectedDetail.maskedAccountNumber || '-' }}</span>
              </div>

              <button class="btn-download" :disabled="downloading || !selectedDetail" @click="handleDownload">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                {{ downloading ? '다운로드 중...' : '명세서 다운로드' }}
              </button>
            </div>
          </div>

          <div class="card deduction-card">
            <div class="card-header-row">
              <span class="card-title">공제 내역</span>
              <span class="total-deduction">
                {{ selectedDetail ? `- ${formatCurrency(selectedDetail.totalDeductionAmount)}` : '-' }}
              </span>
            </div>

            <div v-if="selectedDetail" class="deduction-list">
              <div v-for="item in deductionItems" :key="item.label" class="d-item">
                <span class="label">{{ item.label }}</span>
                <span class="value">{{ formatNumber(item.value) }}</span>
              </div>
            </div>
            <div v-else class="page-empty compact-empty">
              공제 정보를 표시할 명세서가 없습니다.
            </div>

            <div v-if="selectedDetail" class="donut-chart-placeholder">
              <div class="donut-chart" :style="donutStyle">
                <div class="donut-center">
                  <span class="percent">{{ deductionRateLabel }}</span>
                  <span class="text">공제율</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="bottom-row">
          <div class="card history-card">
            <div class="card-header-row">
              <span class="card-title">급여 내역</span>
              <div class="filter-tabs">
                <button
                  v-for="tab in filterTabs"
                  :key="tab.key"
                  class="tab"
                  :class="{ active: selectedFilter === tab.key }"
                  :disabled="historyLoading"
                  @click="selectFilter(tab.key)"
                >
                  {{ tab.label }}
                </button>
              </div>
            </div>

            <div v-if="historyLoading" class="page-empty">
              급여 목록을 불러오는 중입니다.
            </div>
            <div v-else-if="!historyItems.length" class="page-empty">
              조회된 급여 내역이 없습니다.
            </div>
            <div v-else class="history-table-container">
              <table class="history-table">
                <thead>
                  <tr>
                    <th>지급일</th>
                    <th>귀속월</th>
                    <th>지급총액</th>
                    <th>공제총액</th>
                    <th>실수령액</th>
                    <th>명세서</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="item in historyItems"
                    :key="item.id"
                    :class="{ selected: selectedLedgerId === item.id }"
                    @click="selectPayroll(item.id)"
                  >
                    <td>{{ item.paymentDateLabel }}</td>
                    <td>{{ item.targetMonth }}</td>
                    <td>{{ formatNumber(item.totalPayment) }}</td>
                    <td class="text-red">-{{ formatNumber(item.deductionAmount) }}</td>
                    <td class="text-blue">{{ formatNumber(item.netPay) }}</td>
                    <td>
                      <button
                        class="btn-icon"
                        type="button"
                        :disabled="downloading || (detailLoading && selectedLedgerId === item.id)"
                        @click.stop="downloadPayslipById(item.id)"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/>
                          <polyline points="13 2 13 9 20 9"/>
                        </svg>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { usePayrollStore } from '@/store/payroll'

const password = ref('')
const passwordError = ref('')
const pageError = ref('')
const verifying = ref(false)
const isLoading = ref(false)
const historyLoading = ref(false)
const detailLoading = ref(false)
const downloading = ref(false)
const selectedFilter = ref('recent')
const selectedLedgerId = ref(null)
const payrollStore = usePayrollStore()

const currentYear = new Date().getFullYear()
const filterTabs = [
  { key: 'recent', label: '최근 6개월' },
  { key: String(currentYear), label: `${currentYear}년` },
  { key: String(currentYear - 1), label: `${currentYear - 1}년` },
]

const historyItems = computed(() => {
  if (selectedFilter.value === 'recent') {
    return payrollStore.recentPayrolls
  }
  return payrollStore.payrollsByYear[selectedFilter.value] || []
})

const selectedDetail = computed(() => payrollStore.selectedPayrollDetail)
const isVerified = computed(() => payrollStore.isSalaryVerified)

const deductionItems = computed(() => {
  if (!selectedDetail.value) return []

  return [
    { label: '국민연금', value: selectedDetail.value.nationalPensionAmount },
    { label: '건강보험', value: selectedDetail.value.healthInsuranceAmount },
    { label: '장기요양', value: selectedDetail.value.longTermCareAmount },
    { label: '고용보험', value: selectedDetail.value.empInsuranceAmount },
    { label: '소득세', value: selectedDetail.value.incomeTaxAmount },
    { label: '지방소득세', value: selectedDetail.value.localTaxAmount },
  ]
})

const deductionRate = computed(() => {
  if (!selectedDetail.value?.totalPayment) return 0
  const totalPayment = Number(selectedDetail.value.totalPayment)
  const totalDeduction = Number(selectedDetail.value.totalDeductionAmount || 0)
  if (!totalPayment) return 0
  return Math.max(0, Math.min(100, Math.round((totalDeduction / totalPayment) * 1000) / 10))
})

const deductionRateLabel = computed(() => `${deductionRate.value.toFixed(1)}%`)

const donutStyle = computed(() => ({
  background: `conic-gradient(var(--red) 0% ${deductionRate.value}%, var(--gray200) ${deductionRate.value}% 100%)`
}))

const currentPayrollLabel = computed(() => {
  if (!selectedDetail.value?.yearMonth) return '급여 명세서'
  return `${formatTargetMonth(selectedDetail.value.yearMonth)} 급여 명세서`
})

const getErrorMessage = payrollStore.normalizeError

const formatCurrency = (value) => {
  const amount = Number(value || 0)
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
    maximumFractionDigits: 0,
  }).format(amount)
}

const formatNumber = (value) => {
  const amount = Number(value || 0)
  return new Intl.NumberFormat('ko-KR', { maximumFractionDigits: 0 }).format(amount)
}

const formatTargetMonth = (targetMonth) => {
  if (!targetMonth) return '-'
  const [year, month] = targetMonth.split('-')
  return `${year}년 ${Number(month)}월`
}

const fetchRecentPayrolls = async () => {
  return payrollStore.fetchRecentPayrolls(6)
}

const fetchPayrollsByYear = async (year) => {
  return payrollStore.fetchPayrollsByYear(year)
}

const fetchPayrollDetail = async (ledgerId) => {
  await payrollStore.fetchPayrollDetail(ledgerId)
  selectedLedgerId.value = ledgerId
}

const ensureHistoryLoaded = async (filterKey) => {
  if (filterKey === 'recent') {
    if (!payrollStore.recentPayrolls.length) {
      await fetchRecentPayrolls()
    }
    return payrollStore.recentPayrolls
  }

  if (!payrollStore.payrollsByYear[filterKey]) {
    await fetchPayrollsByYear(filterKey)
  }
  return payrollStore.payrollsByYear[filterKey] || []
}

const loadDashboard = async () => {
  isLoading.value = true
  historyLoading.value = true
  pageError.value = ''

  try {
    const items = await fetchRecentPayrolls()
    if (items.length > 0) {
      await fetchPayrollDetail(items[0].id)
    } else {
      payrollStore.selectedPayrollDetail = null
      selectedLedgerId.value = null
    }
  } finally {
    isLoading.value = false
    historyLoading.value = false
  }
}

const verifyPassword = async () => {
  if (!password.value.trim() || verifying.value) return

  verifying.value = true
  passwordError.value = ''

  try {
    const verified = await payrollStore.verifyPassword(password.value.trim())
    if (!verified) {
      passwordError.value = '비밀번호가 올바르지 않습니다.'
      return
    }

    password.value = ''
    await loadDashboard()
  } catch (error) {
    passwordError.value = getErrorMessage(error, '비밀번호 확인에 실패했습니다.')
  } finally {
    verifying.value = false
  }
}

const selectFilter = async (filterKey) => {
  if (historyLoading.value || selectedFilter.value === filterKey) return

  historyLoading.value = true
  pageError.value = ''
  selectedFilter.value = filterKey

  try {
    const items = await ensureHistoryLoaded(filterKey)
    if (items.length > 0) {
      await fetchPayrollDetail(items[0].id)
    } else {
      payrollStore.selectedPayrollDetail = null
      selectedLedgerId.value = null
    }
  } catch (error) {
    pageError.value = getErrorMessage(error, '급여 목록을 불러오지 못했습니다.')
  } finally {
    historyLoading.value = false
  }
}

const selectPayroll = async (ledgerId) => {
  if (!ledgerId || detailLoading.value) return

  detailLoading.value = true
  pageError.value = ''

  try {
    await fetchPayrollDetail(ledgerId)
  } catch (error) {
    pageError.value = getErrorMessage(error, '급여 상세를 불러오지 못했습니다.')
  } finally {
    detailLoading.value = false
  }
}

const downloadPayslipById = async (ledgerId) => {
  if (!ledgerId || downloading.value) return
  downloading.value = true
  pageError.value = ''

  try {
    const fileData = await payrollStore.downloadPayrollPdf(ledgerId)
    const blob = new Blob([fileData], { type: 'application/pdf' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `payslip_${ledgerId}.pdf`
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  } catch (error) {
    pageError.value = getErrorMessage(error, '명세서 다운로드에 실패했습니다.')
  } finally {
    downloading.value = false
  }
}

const handleDownload = async () => {
  if (!selectedDetail.value?.id) return
  await downloadPayslipById(selectedDetail.value.id)
}
</script>

<style scoped>
.salary-dashboard {
  height: calc(100vh - var(--header-h) - 48px);
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow: hidden;
  position: relative;
}

.content-wrap {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 16px;
  min-height: 0;
}

.password-overlay {
  position: absolute;
  inset: 0;
  background: #F3F4F6;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-card {
  width: 100%;
  max-width: 400px;
  padding: 40px;
  text-align: center;
  background: white;
  border: 1px solid var(--gray200);
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
}

.icon-lock {
  width: 80px;
  height: 80px;
  margin: 0 auto 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #E8F5FE;
  border-radius: 50%;
}

.salary-dashboard h2 {
  margin-bottom: 8px;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--gray900);
}

.desc {
  margin-bottom: 32px;
  font-size: 0.95rem;
  color: var(--gray500);
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.input-group input {
  width: 100%;
  padding: 14px 16px;
  font-size: 1rem;
  border: 1px solid var(--gray300);
  border-radius: 8px;
  outline: none;
  transition: border-color 0.2s;
}

.input-group input:focus {
  border-color: var(--primary);
}

.btn-submit {
  width: 100%;
  padding: 14px;
  font-size: 1rem;
  font-weight: 600;
  color: white;
  cursor: pointer;
  background: var(--primary);
  border: none;
  border-radius: 8px;
  transition: background-color 0.2s;
}

.btn-submit:disabled,
.btn-download:disabled,
.tab:disabled,
.btn-icon:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-submit:hover:not(:disabled) {
  background: var(--primary-dark);
}

.form-error,
.page-error {
  padding: 12px 14px;
  font-size: 0.9rem;
  color: #c62828;
  background: #fdecec;
  border: 1px solid #f4b4b4;
  border-radius: 8px;
}

.page-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 160px;
  color: var(--gray500);
  background: #fff;
  border: 1px dashed var(--gray200);
  border-radius: 12px;
}

.compact-empty {
  min-height: 120px;
}

.card {
  padding: 24px;
  background: #fff;
  border: 1px solid var(--gray200);
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
}

.card-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  gap: 12px;
}

.card-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--gray800);
}

.top-row {
  display: flex;
  gap: 16px;
  flex: 0 0 auto;
}

.salary-card {
  flex: 1.5;
  display: flex;
  flex-direction: column;
}

.deduction-card {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.date-info {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--gray800);
}

.status-badge {
  padding: 4px 12px;
  font-size: 0.9rem;
  font-weight: 700;
  color: #00C853;
  background: #E6F7ED;
  border-radius: 20px;
}

.salary-display {
  margin: 20px 0;
  text-align: center;
}

.amount-main {
  font-size: 3.5rem;
  font-weight: 800;
  letter-spacing: -1px;
  color: var(--gray900);
}

.sub-info {
  margin-top: 8px;
  font-size: 1rem;
  color: var(--gray500);
}

.salary-actions {
  margin-top: auto;
}

.detail-row {
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 16px 24px;
  margin-bottom: 16px;
  background: var(--gray50);
  border-radius: 12px;
}

.detail-item {
  text-align: center;
}

.detail-item .label {
  display: block;
  margin-bottom: 4px;
  font-size: 0.85rem;
  color: var(--gray500);
}

.detail-item .value {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--gray800);
}

.divider {
  width: 1px;
  height: 24px;
  background: var(--gray300);
}

.account-summary {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
  font-size: 0.9rem;
  color: var(--gray500);
}

.btn-download {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px;
  font-size: 1rem;
  font-weight: 600;
  color: white;
  cursor: pointer;
  background: var(--primary);
  border: none;
  border-radius: 8px;
  transition: opacity 0.2s;
}

.btn-download:hover:not(:disabled) {
  opacity: 0.9;
}

.deduction-list {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px 20px;
  margin-bottom: 16px;
}

.d-item {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
}

.d-item .label {
  color: var(--gray500);
}

.d-item .value {
  font-weight: 600;
  color: var(--gray800);
}

.donut-chart-placeholder {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 10px;
}

.donut-chart {
  position: relative;
  width: 140px;
  height: 140px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.donut-chart::before {
  content: '';
  position: absolute;
  width: 100px;
  height: 100px;
  background: #fff;
  border-radius: 50%;
}

.donut-center {
  position: relative;
  z-index: 1;
  text-align: center;
}

.donut-center .percent {
  display: block;
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--gray800);
}

.donut-center .text {
  font-size: 0.8rem;
  color: var(--gray500);
}

.total-deduction {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--red);
}

.bottom-row {
  flex: 1;
  display: flex;
  min-height: 0;
}

.history-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 0;
  overflow: hidden;
}

.history-card .card-header-row {
  padding: 20px 24px;
  margin-bottom: 0;
  border-bottom: 1px solid var(--gray100);
}

.filter-tabs {
  display: flex;
  gap: 8px;
}

.tab {
  padding: 6px 12px;
  font-size: 0.85rem;
  color: var(--gray600);
  cursor: pointer;
  background: #fff;
  border: 1px solid var(--gray200);
  border-radius: 6px;
}

.tab.active {
  color: white;
  background: var(--primary);
  border-color: var(--primary);
}

.history-table-container {
  flex: 1;
  overflow-y: auto;
}

.history-table {
  width: 100%;
  border-collapse: collapse;
}

.history-table th {
  position: sticky;
  top: 0;
  padding: 12px 24px;
  font-size: 0.85rem;
  font-weight: 600;
  text-align: left;
  color: var(--gray500);
  background: var(--gray50);
}

.history-table td {
  padding: 16px 24px;
  font-size: 0.95rem;
  color: var(--gray800);
  border-bottom: 1px solid var(--gray100);
}

.history-table tr {
  cursor: pointer;
}

.history-table tr:hover {
  background: var(--gray50);
}

.history-table tr.selected {
  background: #eef6ff;
}

.text-red {
  color: var(--red) !important;
}

.text-blue {
  font-weight: 700;
  color: var(--primary) !important;
}

.btn-icon {
  padding: 4px;
  color: var(--gray400);
  cursor: pointer;
  background: none;
  border: none;
  border-radius: 4px;
}

.btn-icon:hover:not(:disabled) {
  color: var(--gray600);
  background: var(--gray100);
}

@media (max-width: 1100px) {
  .salary-dashboard {
    height: auto;
    min-height: calc(100vh - var(--header-h) - 48px);
    overflow: visible;
  }

  .top-row {
    flex-direction: column;
  }

  .account-summary {
    flex-direction: column;
    gap: 6px;
  }
}

@media (max-width: 768px) {
  .amount-main {
    font-size: 2.4rem;
  }

  .detail-row,
  .filter-tabs,
  .card-header-row {
    flex-wrap: wrap;
  }

  .deduction-list {
    grid-template-columns: 1fr;
  }

  .history-table th,
  .history-table td {
    padding: 12px 14px;
  }
}
</style>
