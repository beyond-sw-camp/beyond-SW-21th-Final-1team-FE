import api from './index'

export const getAttendanceSummary = (params) => api.get('/attendance/summary', { params })
export const getAttendanceRecords = (params) => api.get('/attendance/records', { params })
export const clockIn = (payload) => api.post('/attendance/clock-in', payload)
export const clockOut = () => api.put('/attendance/clock-out')
export const modifyAttendanceByAdmin = (payload) => api.put('/attendance/admin/modify', payload)

export const getLeaveBalance = () => api.get('/leaves/balance')
export const getMyLeaveRequests = (params) => api.get('/leaves/my-requests', { params })
export const getLeaveStatusCounts = () => api.get('/leaves/status-counts')
export const applyLeave = (payload) => api.post('/leaves/apply', payload)
export const cancelLeave = (leaveRequestId) => api.put(`/leaves/${leaveRequestId}/cancel`)
export const getAdminLeaveRequests = (params) => api.get('/leaves/admin/requests', { params })
export const processLeave = (payload) => api.put('/leaves/admin/process', payload)

export const getMyOvertimeRequests = (params) => api.get('/overtimes/my-requests', { params })
export const getOvertimeStatusCounts = () => api.get('/overtimes/status-counts')
export const applyOvertime = (payload) => api.post('/overtimes/apply', payload)
export const cancelOvertime = (overtimeId) => api.put(`/overtimes/${overtimeId}/cancel`)
export const getAdminOvertimeRequests = (params) => api.get('/overtimes/admin/requests', { params })
export const processOvertime = (payload) => api.put('/overtimes/admin/process', payload)

export const getMyBusinessTripRequests = (params) => api.get('/business-trips/my-requests', { params })
export const getBusinessTripStatusCounts = () => api.get('/business-trips/status-counts')
export const applyBusinessTrip = (payload) => api.post('/business-trips/apply', payload)
export const cancelBusinessTrip = (tripId) => api.put(`/business-trips/${tripId}/cancel`)
export const getAdminBusinessTripRequests = (params) =>
  api.get('/business-trips/admin/requests', { params })
export const processBusinessTrip = (payload) => api.put('/business-trips/admin/process', payload)

export const applyWeeklyWorkSchedule = (payload) => api.post('/attendance/weekly', payload)
export const getMyWeeklyWorkSchedules = (params) => api.get('/attendance/weekly/my', { params })
export const getWeeklyWorkScheduleStatusCounts = () => api.get('/attendance/weekly/status-counts')
export const cancelWeeklyWorkSchedule = (weeklyId) => api.put(`/attendance/weekly/${weeklyId}/cancel`)
export const getTeamWeeklyWorkSchedules = (params) => api.get('/attendance/weekly/team', { params })
export const processWeeklyWorkSchedule = (payload) => api.put('/attendance/weekly/process', payload)
