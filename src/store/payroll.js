import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import {
  calculateMonthlyPayrolls,
  createInsuranceRate,
  createSalarySetting,
  downloadPayslip,
  exportAdminPayrollLedgers,
  finalizeMonthlyPayrolls,
  getSeverancePreview,
  getAdminPayrollLedgers,
  getInsuranceRates,
  getPayrollDetail,
  getPayrollsByYear,
  getRecentPayrolls,
  getSalarySettingHistory,
  searchPayrollEmployees,
  sendPayrollLedger,
  sendMonthlyPayrolls,
  updateInsuranceRate,
  updateSalarySetting,
  verifySalaryPassword,
} from '@/api/payroll'

const SALARY_AUTH_VERIFIED_AT_KEY = 'salaryAuthVerifiedAt'
const SALARY_AUTH_TTL_MS = 5 * 60 * 1000

const readSalaryVerifiedAt = () => {
  if (typeof window === 'undefined') return 0
  return Number(sessionStorage.getItem(SALARY_AUTH_VERIFIED_AT_KEY) || 0)
}

const isSalaryVerificationAlive = (verifiedAt = readSalaryVerifiedAt()) =>
  Boolean(verifiedAt) && Date.now() - verifiedAt < SALARY_AUTH_TTL_MS

const markSalaryVerified = () => {
  if (typeof window === 'undefined') return
  sessionStorage.setItem(SALARY_AUTH_VERIFIED_AT_KEY, String(Date.now()))
}

const clearSalaryVerified = () => {
  if (typeof window === 'undefined') return
  sessionStorage.removeItem(SALARY_AUTH_VERIFIED_AT_KEY)
}

const formatPaymentDateFromMonth = (targetMonth) => {
  if (!targetMonth) return '-'
  return `${targetMonth}.25`.replaceAll('-', '.')
}

const maskAccountNumber = (accountNumber) => {
  if (!accountNumber) return null
  const normalized = String(accountNumber)
  if (normalized.length <= 4) return normalized
  return `${normalized.slice(0, 3)}-${'*'.repeat(Math.max(normalized.length - 7, 4))}-${normalized.slice(-4)}`
}

const toListItem = (item) => {
  const totalPayment = Number(item?.totalPayment || 0)
  const netPay = Number(item?.netPay || 0)
  return {
    id: item.id,
    targetMonth: item.targetMonth,
    totalPayment,
    netPay,
    deductionAmount: Math.max(totalPayment - netPay, 0),
    paymentDateLabel: formatPaymentDateFromMonth(item.targetMonth),
  }
}

const toDetailModel = (detail) => ({
  ...detail,
  totalPayment: Number(detail?.totalPayment || 0),
  netPay: Number(detail?.netPay || 0),
  totalDeductionAmount: Number(detail?.totalDeductionAmount || 0),
  salaryAmount: Number(detail?.salaryAmount || 0),
  overtimeAmount: Number(detail?.overtimeAmount || 0),
  mealAmount: Number(detail?.mealAmount || 0),
  nationalPensionAmount: Number(detail?.nationalPensionAmount || 0),
  healthInsuranceAmount: Number(detail?.healthInsuranceAmount || 0),
  longTermCareAmount: Number(detail?.longTermCareAmount || 0),
  empInsuranceAmount: Number(detail?.empInsuranceAmount || 0),
  incomeTaxAmount: Number(detail?.incomeTaxAmount || 0),
  localTaxAmount: Number(detail?.localTaxAmount || 0),
  paymentDateLabel: detail?.paymentDate ? detail.paymentDate.replaceAll('-', '.') : '-',
  maskedAccountNumber: maskAccountNumber(detail?.accountNumber),
})

const toLedgerItem = (item) => ({
  ...item,
  salaryAmount: Number(item?.salaryAmount || 0),
  overtimeAmount: Number(item?.overtimeAmount || 0),
  mealAmount: Number(item?.mealAmount || 0),
  totalPayment: Number(item?.totalPayment || 0),
  totalDeductionAmount: Number(item?.totalDeductionAmount || 0),
  netPay: Number(item?.netPay || 0),
})

const normalizeError = (error, fallback) =>
  error?.response?.data?.message || error?.message || fallback

export const usePayrollStore = defineStore('payroll', () => {
  const isSalaryVerified = ref(isSalaryVerificationAlive())
  const recentPayrolls = ref([])
  const payrollsByYear = ref({})
  const selectedPayrollDetail = ref(null)

  const adminLedgerPage = ref({
    content: [],
    page: 1,
    size: 20,
    totalElements: 0,
    totalPages: 0,
    last: true,
  })
  const lastBatchResult = ref(null)
  const lastFinalizeResult = ref(null)
  const lastSendResult = ref(null)
  const insuranceRates = ref([])
  const salarySettingHistory = ref([])
  const employeeSearchPage = ref({
    content: [],
    page: 1,
    size: 20,
    totalElements: 0,
    totalPages: 0,
    last: true,
  })
  const severancePreview = ref(null)

  const latestPayroll = computed(() => recentPayrolls.value[0] || null)

  const syncSalaryVerificationState = () => {
    const nextVerified = isSalaryVerificationAlive()
    isSalaryVerified.value = nextVerified
    if (!nextVerified) {
      selectedPayrollDetail.value = null
    }
  }

  if (typeof window !== 'undefined') {
    window.removeEventListener('session-storage-changed', syncSalaryVerificationState)
    window.addEventListener('session-storage-changed', syncSalaryVerificationState)
  }

  const verifyPassword = async (password) => {
    const { data } = await verifySalaryPassword(password)
    if (data === true) {
      markSalaryVerified()
    } else {
      clearSalaryVerified()
    }
    syncSalaryVerificationState()
    return data === true
  }

  const fetchRecentPayrolls = async (limit = 6) => {
    const { data } = await getRecentPayrolls(limit)
    recentPayrolls.value = Array.isArray(data) ? data.map(toListItem) : []
    return recentPayrolls.value
  }

  const fetchPayrollsByYear = async (year) => {
    const { data } = await getPayrollsByYear(year)
    payrollsByYear.value = {
      ...payrollsByYear.value,
      [year]: Array.isArray(data) ? data.map(toListItem) : [],
    }
    return payrollsByYear.value[year]
  }

  const fetchPayrollDetail = async (ledgerId) => {
    const { data } = await getPayrollDetail(ledgerId)
    selectedPayrollDetail.value = toDetailModel(data)
    return selectedPayrollDetail.value
  }

  const fetchAdminLedgers = async (params) => {
    const { data } = await getAdminPayrollLedgers(params)
    adminLedgerPage.value = {
      ...data,
      content: Array.isArray(data?.content) ? data.content.map(toLedgerItem) : [],
    }
    return adminLedgerPage.value
  }

  const runMonthlyCalculation = async (year, month) => {
    const { data } = await calculateMonthlyPayrolls(year, month)
    lastBatchResult.value = data
    return data
  }

  const runMonthlyFinalize = async (year, month) => {
    const { data } = await finalizeMonthlyPayrolls(year, month)
    lastFinalizeResult.value = data
    return data
  }

  const runMonthlySend = async (year, month) => {
    const { data } = await sendMonthlyPayrolls(year, month)
    lastSendResult.value = data
    return data
  }

  const runLedgerSend = async (ledgerId) => {
    const { data } = await sendPayrollLedger(ledgerId)
    lastSendResult.value = data
    return data
  }

  const downloadPayrollPdf = async (ledgerId) => {
    const response = await downloadPayslip(ledgerId)
    return response.data
  }

  const downloadAdminLedgerExport = async (params, transfer = false) => {
    const response = await exportAdminPayrollLedgers(params, transfer)
    return response.data
  }

  const fetchInsuranceRateList = async () => {
    const { data } = await getInsuranceRates()
    insuranceRates.value = Array.isArray(data) ? data : []
    return insuranceRates.value
  }

  const saveInsuranceRate = async ({ insuranceId, ...payload }) => {
    const response = insuranceId
      ? await updateInsuranceRate(insuranceId, payload)
      : await createInsuranceRate(payload)
    await fetchInsuranceRateList()
    return response.data
  }

  const fetchSalarySettings = async (employeeId) => {
    const { data } = await getSalarySettingHistory(employeeId)
    salarySettingHistory.value = Array.isArray(data) ? data : []
    return salarySettingHistory.value
  }

  const searchEmployees = async (params) => {
    const { data } = await searchPayrollEmployees(params)
    employeeSearchPage.value = {
      ...data,
      content: Array.isArray(data?.content) ? data.content : [],
    }
    return employeeSearchPage.value
  }

  const fetchSeverancePreview = async (employeeId, retirementDate) => {
    const { data } = await getSeverancePreview(employeeId, retirementDate)
    severancePreview.value = data || null
    return severancePreview.value
  }

  const saveSalarySetting = async ({ employeeId, settingId, ...payload }) => {
    if (!employeeId && !settingId) {
      throw new Error('사원 ID가 필요합니다.')
    }

    const response = settingId
      ? await updateSalarySetting(settingId, payload)
      : await createSalarySetting(employeeId, payload)

    const targetEmployeeId = employeeId || response.data?.employeeId
    if (targetEmployeeId) {
      await fetchSalarySettings(targetEmployeeId)
    }
    return response.data
  }

  return {
    adminLedgerPage,
    employeeSearchPage,
    fetchAdminLedgers,
    fetchInsuranceRateList,
    fetchPayrollDetail,
    fetchPayrollsByYear,
    fetchRecentPayrolls,
    fetchSeverancePreview,
    fetchSalarySettings,
    insuranceRates,
    isSalaryVerified,
    lastBatchResult,
    lastFinalizeResult,
    lastSendResult,
    latestPayroll,
    normalizeError,
    payrollsByYear,
    recentPayrolls,
    runLedgerSend,
    runMonthlyCalculation,
    runMonthlyFinalize,
    runMonthlySend,
    salarySettingHistory,
    searchEmployees,
    saveInsuranceRate,
    saveSalarySetting,
    selectedPayrollDetail,
    severancePreview,
    verifyPassword,
    downloadPayrollPdf,
    downloadAdminLedgerExport,
  }
})
