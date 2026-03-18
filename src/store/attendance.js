import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import {
  clockIn as clockInRequest,
  clockOut as clockOutRequest,
  getAttendanceRecords,
  getAttendanceWeeklySummary,
  getAttendanceCalendar,
  getRequestHistory,
  getRequestHistoryCounts,
  getVacationHistory,
  getAttendanceSummary,
  getAdminDailyAttendanceRecords,
  getLeaveBalance,
  getLeaveGrantHistory,
  getLeaveStatusCounts,
  getMyOvertimeRequests,
  getOvertimeStatusCounts,
  getMyBusinessTripRequests,
  getBusinessTripStatusCounts,
  getMyWeeklyWorkSchedules,
  getWeeklyWorkScheduleStatusCounts,
  processLeave,
  getTeamWeeklyWorkSchedules,
  getTeamWeeklyOverview,
  processWeeklyWorkSchedule,
  modifyAttendanceByAdmin,
} from '@/api/attendance'
import { getAdminVacationList, processApproval } from '@/api/approval'

const CURRENT_USER_ID = 'me'

const formatDate = (value) => (value ? String(value).slice(0, 10) : '')
const formatDateTime = (value) => (value ? String(value).replace('T', ' ').slice(0, 16) : '')
const formatTime = (value) => (value ? String(value).slice(0, 5) : null)
const toDateKey = (value) => {
  const year = value.getFullYear()
  const month = String(value.getMonth() + 1).padStart(2, '0')
  const day = String(value.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const createBatchProcessError = (message, failures) => {
  const error = new Error(message)
  error.failures = failures
  return error
}

const calculateWorkHours = (checkInTime, checkOutTime) => {
  if (!checkInTime || !checkOutTime) return '0h'
  const [h1, m1] = String(checkInTime).slice(0, 5).split(':').map(Number)
  const [h2, m2] = String(checkOutTime).slice(0, 5).split(':').map(Number)
  let diff = (h2 * 60 + m2) - (h1 * 60 + m1)
  if (diff < 0) {
    diff += 24 * 60
  }
  if (diff === 0) return '0h'
  return `${Math.floor(diff / 60)}h ${String(diff % 60).padStart(2, '0')}m`
}

const mapRequestStatus = (value) => {
  const normalized = String(value || '').toUpperCase()
  if (normalized === 'APPROVED') return 'approved'
  if (normalized === 'REJECTED') return 'rejected'
  if (normalized === 'CANCELLED') return 'cancelled'
  return 'pending'
}

const mapAttendanceStatus = (value) => {
  const normalized = String(value || '').toUpperCase()
  if (normalized === 'TARDY') return 'tardy'
  if (normalized === 'EARLY_LEAVE') return 'early_leave'
  if (normalized === 'ABSENT') return 'absent'
  if (normalized === 'VACATION') return 'vacation'
  return 'normal'
}

const formatLeaveTypeLabel = (value) => {
  const normalized = String(value || '').toUpperCase()
  if (normalized === 'ANNUAL') return '연차'
  if (normalized === 'HALF') return '반차'
  if (normalized === 'SICK') return '병가'
  if (normalized === 'ETC') return '기타'
  return value || '휴가'
}

const mapAdminAttendanceRecord = (record) => ({
  id: record.attendanceId,
  attendanceId: record.attendanceId,
  userId: record.employeeId,
  name: record.employeeName || `사원 #${record.employeeId}`,
  position: record.positionName || '직원',
  deptName: record.departmentName || '-',
  dept: record.departmentName || '-',
  date: formatDate(record.workDate),
  checkIn: formatTime(record.checkInTime),
  checkOut: formatTime(record.checkOutTime),
  workHours: calculateWorkHours(record.checkInTime, record.checkOutTime),
  status: mapAttendanceStatus(record.status),
  statusDescription: record.status,
  memo: record.modifyReason || record.tardyReason || '-',
  closed: Boolean(record.closed),
})

const employeeLabel = (employeeId) => ({
  userId: employeeId ?? CURRENT_USER_ID,
  name: employeeId ? `사원 #${employeeId}` : '나',
  position: '직원',
  deptName: '-',
  dept: '-',
})

const mapLeaveRequest = (item) => ({
  id: item.leaveRequestId,
  leaveRequestId: item.leaveRequestId,
  ...employeeLabel(item.employeeId),
  type: '휴가',
  title: `${formatLeaveTypeLabel(item.leaveType)} 신청`,
  period:
    item.startDate && item.endDate && item.startDate !== item.endDate
      ? `${formatDate(item.startDate)} ~ ${formatDate(item.endDate)}`
      : formatDate(item.startDate),
  days: Number(item.usedDays || 0),
  usedDays: Number(item.usedDays || 0),
  reason: item.reason || '',
  status: mapRequestStatus(item.leaveStatus),
  appliedAt: formatDate(item.startDate),
  targetDate: formatDate(item.startDate),
  approver: '-',
  leaveType: formatLeaveTypeLabel(item.leaveType),
  startDate: formatDate(item.startDate),
  endDate: formatDate(item.endDate),
  applyDate: formatDate(item.startDate),
  rejectReason: item.rejectReason || '',
  category: 'leave',
})

const mapVacationHistoryItem = (item) => ({
  id: item.id,
  leaveRequestId: null,
  type: '휴가',
  title: `${formatLeaveTypeLabel(item.leaveType)} 신청`,
  period: `${item.startDate} ~ ${item.endDate}`,
  days: Number(item.usedDays || 0),
  usedDays: Number(item.usedDays || 0),
  reason: '',
  status: item.status || 'pending',
  appliedAt: item.applyDate,
  targetDate: item.startDate,
  approver: '-',
  leaveType: formatLeaveTypeLabel(item.leaveType),
  startDate: item.startDate,
  endDate: item.endDate,
  applyDate: item.applyDate,
  rejectReason: item.rejectReason || '',
  category: 'leave',
})

const mapAdminApprovalVacation = (item) => ({
  id: item.approvalId,
  approvalId: item.approvalId,
  leaveRequestId: null,
  userId: item.drafterId,
  name: item.drafterName || `사원 #${item.drafterId}`,
  position: '직원',
  deptName: item.departmentName || '-',
  dept: item.departmentName || '-',
  type: formatLeaveTypeLabel(item.vacationType),
  title: `${formatLeaveTypeLabel(item.vacationType)} 신청`,
  period:
    item.startDate && item.endDate && formatDate(item.startDate) !== formatDate(item.endDate)
      ? `${formatDate(item.startDate)} ~ ${formatDate(item.endDate)}`
      : formatDate(item.startDate),
  days: Number(item.days || 0),
  usedDays: Number(item.days || 0),
  reason: item.reason || '',
  status: mapRequestStatus(item.approvalStatus),
  appliedAt: formatDate(item.draftDate),
  targetDate: formatDate(item.startDate),
  approver: '-',
  leaveType: formatLeaveTypeLabel(item.vacationType),
  startDate: formatDate(item.startDate),
  endDate: formatDate(item.endDate),
  applyDate: formatDate(item.draftDate),
  rejectReason: '',
  category: 'leave',
})

const mapLeaveGrantHistory = (item) => ({
  id: item.grantHistoryId,
  grantHistoryId: item.grantHistoryId,
  baseYear: Number(item.baseYear || 0),
  date: formatDate(item.grantDate).replaceAll('-', '.'),
  days: Number(item.grantDays || 0).toFixed(1),
  grantType: item.grantType || 'ANNUAL_BASE',
  reason: item.reason || '연차 부여',
})

const mapOvertimeRequest = (item) => ({
  id: item.overtimeId,
  overtimeId: item.overtimeId,
  ...employeeLabel(item.employeeId),
  type: '연장근무',
  title: '연장근무 신청',
  period: `${formatDateTime(item.startTime)} ~ ${formatDateTime(item.endTime)}`,
  days: 0,
  reason: item.reason || '',
  status: mapRequestStatus(item.approvalStatus),
  appliedAt: formatDate(item.workDate),
  targetDate: formatDate(item.workDate),
  approver: '-',
  rejectReason: item.rejectReason || '',
  category: 'work',
})

const mapBusinessTripRequest = (item) => ({
  id: item.tripId,
  tripId: item.tripId,
  ...employeeLabel(item.employeeId),
  type: item.tripType === 'BUSINESS_TRIP' ? '출장' : '외근',
  title: `${item.tripType === 'BUSINESS_TRIP' ? '출장' : '외근'} 신청`,
  period: `${formatDateTime(item.startDatetime)} ~ ${formatDateTime(item.endDatetime)}`,
  days: 0,
  reason: item.reason || '',
  status: mapRequestStatus(item.approvalStatus),
  appliedAt: formatDateTime(item.startDatetime),
  targetDate: formatDateTime(item.startDatetime),
  approver: '-',
  rejectReason: item.rejectReason || '',
  destination: item.destination || '',
  category: 'work',
})

const mapWeeklySchedule = (item) => ({
  id: item.weeklyId,
  weeklyId: item.weeklyId,
  userId: item.employeeId ?? CURRENT_USER_ID,
  name: item.employeeName || (item.employeeId ? `사원 #${item.employeeId}` : '나'),
  position: item.positionName || '직원',
  deptName: item.departmentName || '-',
  dept: item.departmentName || '-',
  period: `${formatDateTime(item.startDate)} ~ ${formatDateTime(item.endDate)}`,
  type: item.workForm || '유연근무',
  title: item.scheduleTitle || '유연근무 신청',
  reason: item.memo || '',
  status: mapRequestStatus(item.approvalStatus),
  appliedAt: formatDateTime(item.createdAt) || formatDate(item.planDate),
  targetDate: formatDate(item.planDate),
  approver: '-',
  rejectionReason: item.rejectReason || '',
  scheduleTitle: item.scheduleTitle || '유연근무 신청',
  startDate: item.startDate,
  endDate: item.endDate,
  planDate: item.planDate,
  category: 'work',
})

const mapCalendarEvent = (item) => ({
  id: item.eventId,
  category: item.category,
  title: item.title,
  status: mapRequestStatus(item.status),
  targetDate: formatDate(item.targetDate),
  startDateTime: item.startDateTime,
  endDateTime: item.endDateTime,
  memo: item.memo || '',
})

const mapTeamOverviewDay = (day) => ({
  planDate: formatDate(day.planDate),
  requestedEmployeeCount: Number(day.requestedEmployeeCount || 0),
  approvedEmployeeCount: Number(day.approvedEmployeeCount || 0),
  coreTimeShortageRisk: Boolean(day.coreTimeShortageRisk),
  entries: (day.entries || []).map((entry) => ({
    id: entry.weeklyId,
    weeklyId: entry.weeklyId,
    userId: entry.employeeId,
    name: entry.employeeName || `사원 #${entry.employeeId}`,
    dept: entry.departmentName || '-',
    deptName: entry.departmentName || '-',
    position: entry.positionName || '직원',
    targetDate: formatDate(entry.planDate),
    startDate: entry.startDate,
    endDate: entry.endDate,
    type: entry.workForm || '유연근무',
    title: entry.scheduleTitle || '유연근무 신청',
    reason: entry.memo || '',
    rejectionReason: entry.rejectReason || '',
    status: mapRequestStatus(entry.approvalStatus),
  })),
})

export const useAttendanceStore = defineStore('attendance', () => {
  const dailyAttendance = ref([])
  const monthlySummary = ref({
    normalCount: 0,
    tardyCount: 0,
    earlyLeaveCount: 0,
    absentCount: 0,
    vacationCount: 0,
  })
  const leaveBalance = ref({
    totalAnnualLeave: 0,
    usedAnnualLeave: 0,
    pendingAnnualLeave: 0,
    remainingAnnualLeave: 0,
  })
  const leaveGrantHistory = ref([])
  const leaveRequests = ref([])
  const flexibleWorkPlans = ref([])
  const weeklySummary = ref(null)
  const calendarEvents = ref([])
  const teamWeeklyOverview = ref(null)
  const requestHistory = ref([])
  const requestCounts = ref({ pending: 0, approved: 0, rejected: 0 })
  const myLeaveRequestsList = ref([])
  const checkInTime = ref(null)
  const checkOutTime = ref(null)
  const isLoading = ref(false)
  let attendanceCalendarRequestSeq = 0

  const syncTodayRecord = () => {
    const today = toDateKey(new Date())
    const todayRecord = dailyAttendance.value.find((item) => item.date === today)
    checkInTime.value = todayRecord?.checkIn || null
    checkOutTime.value = todayRecord?.checkOut || null
  }

  const fetchMonthlySummary = async (year, month) => {
    const response = await getAttendanceSummary({ year, month })
    monthlySummary.value = response.data
  }

  const fetchWeeklySummary = async (date = null) => {
    const params = {}
    if (date) {
      params.date = date
    }
    const response = await getAttendanceWeeklySummary(params)
    weeklySummary.value = response.data
    return weeklySummary.value
  }

  const fetchAttendanceCalendar = async (year, month, scope = 'SELF') => {
    const requestSeq = ++attendanceCalendarRequestSeq
    const response = await getAttendanceCalendar({ year, month, scope })
    if (requestSeq !== attendanceCalendarRequestSeq) {
      return calendarEvents.value
    }
    calendarEvents.value = (response.data?.events || []).map(mapCalendarEvent)
    return calendarEvents.value
  }

  const fetchMonthlyRecords = async (year, month, status = null) => {
    isLoading.value = true
    try {
      const params = { year, month }
      if (status && status !== 'all') {
        params.status = status.toUpperCase()
      }
      const response = await getAttendanceRecords(params)
      dailyAttendance.value = (response.data || []).map((record) => ({
        id: record.attendanceId,
        attendanceId: record.attendanceId,
        ...employeeLabel(),
        date: formatDate(record.workDate),
        checkIn: formatTime(record.checkInTime),
        checkOut: formatTime(record.checkOutTime),
        workHours: calculateWorkHours(record.checkInTime, record.checkOutTime),
        status: mapAttendanceStatus(record.status),
        statusDescription: record.statusDescription,
        memo: record.statusDescription || '-',
      }))
      const now = new Date()
      if (year === now.getFullYear() && month === now.getMonth() + 1 && (!status || status === 'all')) {
        syncTodayRecord()
      }
    } finally {
      isLoading.value = false
    }
  }

  const fetchAdminDailyAttendanceList = async ({ startDate = null, endDate = null, status = null } = {}) => {
    const params = {}
    if (startDate) {
      params.startDate = startDate
    }
    if (endDate) {
      params.endDate = endDate
    }
    if (status) {
      params.status = status.toUpperCase()
    }
    const response = await getAdminDailyAttendanceRecords(params)
    dailyAttendance.value = (response.data || []).map(mapAdminAttendanceRecord)
    return dailyAttendance.value
  }

  const refreshCurrentMonth = async () => {
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth() + 1
    const today = toDateKey(now)
    await Promise.all([
      fetchMonthlyRecords(year, month),
      fetchMonthlySummary(year, month),
      fetchWeeklySummary(today),
      fetchAttendanceCalendar(year, month),
    ])
  }

  const clockIn = async (tardyReason = null) => {
    await clockInRequest({ tardyReason })
    await refreshCurrentMonth()
    return true
  }

  const clockOut = async () => {
    await clockOutRequest()
    await refreshCurrentMonth()
    return true
  }

  const fetchLeaveBalance = async () => {
    const response = await getLeaveBalance()
    leaveBalance.value = response.data
  }

  const fetchLeaveGrantHistory = async (year = null) => {
    const params = {}
    if (year) {
      params.year = year
    }
    const response = await getLeaveGrantHistory(params)
    leaveGrantHistory.value = (response.data || []).map(mapLeaveGrantHistory)
    return leaveGrantHistory.value
  }

  const fetchMyLeaveRequests = async () => {
    const response = await getVacationHistory()
    myLeaveRequestsList.value = (response.data || []).map(mapVacationHistoryItem)
    return myLeaveRequestsList.value
  }

  const refreshRequestHistory = async () => {
    const response = await getRequestHistory()
    requestHistory.value = response.data || []
  }

  const refreshRequestCounts = async () => {
    const response = await getRequestHistoryCounts()
    requestCounts.value = {
      pending: response.data?.pendingCount || 0,
      approved: response.data?.approvedCount || 0,
      rejected: response.data?.rejectedCount || 0,
    }
  }

  const fetchAdminLeaveRequestsList = async (page = 1, size = 100, status = null) => {
    const params = { page, size }
    if (status) {
      params.status = status.toUpperCase()
    }
    const response = await getAdminVacationList(params)
    leaveRequests.value = (response?.content || []).map(mapAdminApprovalVacation)
    return leaveRequests.value
  }

  const processLeaveRequests = async (ids, approve, rejectReason = '') => {
    const results = await Promise.allSettled(
      ids.map((leaveRequestId) =>
        processLeave({
          leaveRequestId,
          approve,
          rejectReason: approve ? null : rejectReason,
        }),
      ),
    )
    await fetchAdminLeaveRequestsList()

    const failures = results.filter((result) => result.status === 'rejected')
    if (failures.length > 0) {
      throw createBatchProcessError(
        failures.length === ids.length
          ? '휴가 일괄 처리에 실패했습니다.'
          : `휴가 ${ids.length}건 중 ${failures.length}건 처리에 실패했습니다.`,
        failures,
      )
    }
  }

  const processApprovalVacationRequests = async (ids, approve, rejectReason = '') => {
    const results = await Promise.allSettled(
      ids.map((approvalId) =>
        processApproval(approvalId, {
          approve,
          reason: approve ? null : rejectReason,
        }),
      ),
    )
    await fetchAdminLeaveRequestsList()

    const successIds = results.flatMap((result, index) =>
      result.status === 'fulfilled' ? [ids[index]] : [],
    )
    const failures = results.filter((result) => result.status === 'rejected')
    if (failures.length > 0) {
      const error = createBatchProcessError(
        failures.length === ids.length
          ? '휴가 일괄 처리에 실패했습니다.'
          : `휴가 ${ids.length}건 중 ${failures.length}건 처리에 실패했습니다.`,
        failures,
      )
      error.successIds = successIds
      throw error
    }

    return { successIds }
  }

  const fetchTeamFlexibleWorkPlans = async (page = 1, size = 100, status = null) => {
    const params = { page, size }
    if (status) {
      params.status = status.toUpperCase()
    }
    const response = await getTeamWeeklyWorkSchedules(params)
    flexibleWorkPlans.value = (response.data?.content || []).map(mapWeeklySchedule)
    return flexibleWorkPlans.value
  }

  const fetchTeamWeeklyOverview = async (date = null) => {
    const params = {}
    if (date) {
      params.date = date
    }
    const response = await getTeamWeeklyOverview(params)
    teamWeeklyOverview.value = {
      weekStartDate: formatDate(response.data?.weekStartDate),
      weekEndDate: formatDate(response.data?.weekEndDate),
      days: (response.data?.days || []).map(mapTeamOverviewDay),
    }
    return teamWeeklyOverview.value
  }

  const processFlexiblePlans = async (ids, approve, rejectReason = '') => {
    const results = await Promise.allSettled(
      ids.map((approvalId) =>
        processWeeklyWorkSchedule({
          approvalId,
          approve,
          rejectReason: approve ? null : rejectReason,
        }),
      ),
    )
    await Promise.all([fetchTeamFlexibleWorkPlans(), fetchTeamWeeklyOverview()])

    const failures = results.filter((result) => result.status === 'rejected')
    if (failures.length > 0) {
      throw createBatchProcessError(
        failures.length === ids.length
          ? '유연근무 일괄 처리에 실패했습니다.'
          : `유연근무 ${ids.length}건 중 ${failures.length}건 처리에 실패했습니다.`,
        failures,
      )
    }
  }

  const updateDailyAttendance = async (payload) => {
    await modifyAttendanceByAdmin(payload)
  }

  const setCheckInTime = (value) => {
    checkInTime.value = value
  }

  const setCheckOutTime = (value) => {
    checkOutTime.value = value
  }

  return {
    dailyAttendance,
    flexibleWorkPlans,
    weeklySummary,
    calendarEvents,
    teamWeeklyOverview,
    isLoading,
    leaveBalance,
    leaveGrantHistory,
    leaveRequests,
    monthlySummary,
    myLeaveRequests: computed(() => requestHistory.value),
    myLeaveRequestsList,
    checkInTime,
    checkOutTime,
    requestCounts,
    requestHistory,
    clockIn,
    clockOut,
    fetchAdminLeaveRequestsList,
    fetchAdminDailyAttendanceList,
    fetchAttendanceCalendar,
    fetchLeaveBalance,
    fetchLeaveGrantHistory,
    fetchMonthlyRecords,
    fetchMonthlySummary,
    fetchMyLeaveRequests,
    fetchTeamWeeklyOverview,
    fetchTeamFlexibleWorkPlans,
    fetchWeeklySummary,
    processFlexiblePlans,
    processApprovalVacationRequests,
    processLeaveRequests,
    refreshRequestCounts,
    refreshRequestHistory,
    setCheckInTime,
    setCheckOutTime,
    updateDailyAttendance,
  }
})
