import api from './index'

const unwrap = async (request) => {
  const response = await request
  return response.data?.data
}

export const getPerformanceDashboard = () => unwrap(api.get('/performance/dashboard'))

export const getPerformanceMonthlyReport = (params = {}) =>
  unwrap(api.get('/performance/monthly/report', { params }))

export const getPerformanceInquiryItems = (params = {}) =>
  unwrap(api.get('/performance/inquiry', { params }))

export const getPerformanceInquiryTeamMembers = () =>
  unwrap(api.get('/performance/team-evaluation/targets'))

export const updatePerformanceResult = async (performanceId, request) =>
  api.post(`/performance/result/${performanceId}`, request)

export const getPerformanceApprovalItems = () => unwrap(api.get('/performance/approvals'))

export const approvePerformance = (performanceId, comment) =>
  api.post(`/performance/approvals/${performanceId}/approve`, { comment })

export const rejectPerformance = (performanceId, comment) =>
  api.post(`/performance/approvals/${performanceId}/reject`, { comment })

export const getPeerReviewTargets = () => unwrap(api.get('/performance/peer-review/targets'))

export const submitPeerReview = (payload) => api.post('/performance/peer-review', payload)

export const getTeamEvaluationTargets = () =>
  unwrap(api.get('/performance/team-evaluation/targets'))

export const submitTeamEvaluation = (payload) =>
  api.post('/performance/team-evaluation', payload)

export const getPerformanceTeamStats = (params = {}) =>
  unwrap(api.get('/performance/team-stats', { params }))

export const registerPerformance = (payload) =>
  api.post('/performance/register', payload)
