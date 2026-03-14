import axios from 'axios'
import { clearLoginSession, getAccessToken } from '@/utils/auth'

const buildPayrollBaseUrl = () => {
  const fallback =
    typeof window !== 'undefined'
      ? `${window.location.origin}/api/v1`
      : 'http://localhost:8080/api/v1'
  const rawBase = (import.meta.env.VITE_API_URL || fallback).replace(/\/$/, '')
  const payrollSuffixPattern = /\/payroll$/i

  if (payrollSuffixPattern.test(rawBase)) return rawBase
  if (rawBase.endsWith('/api/v1')) return rawBase.replace(/\/api\/v1$/, '/api/payroll')
  if (rawBase.endsWith('/api')) return `${rawBase}/payroll`

  return `${rawBase}/api/payroll`
}

const payrollApi = axios.create({
  baseURL: buildPayrollBaseUrl(),
  timeout: 10000,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
})

payrollApi.interceptors.request.use((config) => {
  const token = getAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

payrollApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      clearLoginSession()
    }
    return Promise.reject(error)
  },
)

export const verifySalaryPassword = (password) =>
  payrollApi.post('/verify-password', { password })

export const getRecentPayrolls = (limit = 6) =>
  payrollApi.get('/recent', { params: { limit } })

export const getPayrollsByYear = (year) =>
  payrollApi.get(`/year/${year}`)

export const getPayrollDetail = (ledgerId) =>
  payrollApi.get(`/details/${ledgerId}`)

export const downloadPayslip = (ledgerId) =>
  payrollApi.get(`/download/${ledgerId}`, { responseType: 'blob' })

export const getAdminPayrollLedgers = (params) =>
  payrollApi.get('/admin/ledgers', { params })

export const getAdminPayrollLedgerSummary = (params) =>
  payrollApi.get('/admin/ledgers/summary', { params })

export const calculateMonthlyPayrolls = (year, month) =>
  payrollApi.post('/admin/calculate', null, { params: { year, month } })

export const finalizeMonthlyPayrolls = (year, month) =>
  payrollApi.post('/admin/finalize', null, { params: { year, month } })

export const sendMonthlyPayrolls = (year, month) =>
  payrollApi.post('/admin/send', null, { params: { year, month } })

export const sendPayrollLedger = (ledgerId) =>
  payrollApi.post(`/admin/send/${ledgerId}`)

export const exportAdminPayrollLedgers = (params, transfer = false) =>
  payrollApi.get(transfer ? '/admin/ledgers/export-transfer' : '/admin/ledgers/export', {
    params,
    responseType: 'blob',
  })

export const searchPayrollEmployees = (params) =>
  payrollApi.get('/admin/employees/search', { params })

export const getSeverancePreview = (employeeId, retirementDate) =>
  payrollApi.get(`/admin/severance/${employeeId}`, { params: { retirementDate } })

export const paySeverance = (employeeId, retirementDate) =>
  payrollApi.post(`/admin/severance/${employeeId}/pay`, null, { params: { retirementDate } })

export const getInsuranceRates = () =>
  payrollApi.get('/admin/insurance-rates')

export const createInsuranceRate = (payload) =>
  payrollApi.post('/admin/insurance-rates', payload)

export const updateInsuranceRate = (insuranceId, payload) =>
  payrollApi.put(`/admin/insurance-rates/${insuranceId}`, payload)

export const getSalarySettingHistory = (employeeId) =>
  payrollApi.get(`/admin/salary-settings/${employeeId}`)

export const createSalarySetting = (employeeId, payload) =>
  payrollApi.post(`/admin/salary-settings/${employeeId}`, payload)

export const updateSalarySetting = (settingId, payload) =>
  payrollApi.put(`/admin/salary-settings/${settingId}`, payload)

export default payrollApi
