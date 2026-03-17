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

export const updatePerformanceResult = async (performanceId, request, files = []) => {
  const form = new FormData()
  Object.entries(request || {}).forEach(([key, value]) => {
    form.append(key, value ?? '')
  })
  files.forEach((file) => {
    form.append('files', file)
  })
  return api.post(`/performance/result/${performanceId}`, form)
}

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

const clampRate = (value) => {
  const number = Number(value)
  if (!Number.isFinite(number)) return 0
  return Math.min(100, Math.max(0, Math.round(number)))
}

const normalizeWeightItem = (item = {}) => {
  const orgId = Number(item.orgId)
  const hasPersonalWeight = item.personalWeightRate !== null && item.personalWeightRate !== undefined
  const hasTeamWeight = item.teamWeightRate !== null && item.teamWeightRate !== undefined
  let normalizedPersonal = hasPersonalWeight
    ? clampRate(item.personalWeightRate)
    : 100 - clampRate(item.teamWeightRate)
  let normalizedTeam = hasTeamWeight
    ? clampRate(item.teamWeightRate)
    : 100 - normalizedPersonal
  if (normalizedPersonal + normalizedTeam !== 100) {
    normalizedTeam = 100 - normalizedPersonal
  }
  return {
    orgId,
    personalWeightRate: normalizedPersonal,
    teamWeightRate: normalizedTeam,
    updatedAt: item.updatedAt || new Date().toISOString(),
  }
}

const parseWeightItems = (payload) => {
  const items = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.weights)
      ? payload.weights
      : []
  return items
    .map(normalizeWeightItem)
    .filter((item) => Number.isFinite(item.orgId) && item.orgId > 0)
}

export const getAdminPerformanceWeights = async () => {
  const data = await unwrap(api.get('/performance/admin/weights'))
  return { items: parseWeightItems(data), source: 'api' }
}

export const saveAdminPerformanceWeights = async (weights = []) => {
  const items = parseWeightItems(weights)
  const data = await unwrap(
    api.patch('/performance/admin/weights', {
      weights: items.map((item) => ({
        orgId: item.orgId,
        personalWeightRate: item.personalWeightRate,
        teamWeightRate: item.teamWeightRate,
      })),
    }),
  )
  return { items: parseWeightItems(data), source: 'api' }
}
