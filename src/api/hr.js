import api from './index'

const unwrap = async (request) => {
  const response = await request
  return response.data?.data
}

const appendJsonRequest = (formData, payload) => {
  formData.append(
    'request',
    new Blob([JSON.stringify(payload)], { type: 'application/json' }),
  )
}

export const getMyPage = () => unwrap(api.get('/mypage'))
export const getMyPageHeader = () => unwrap(api.get('/mypage/header'))
export const getMyHrEvents = () => unwrap(api.get('/mypage/hr-events'))
export const getMyHrEventDetail = (hrEventId) => unwrap(api.get(`/mypage/hr-events/${hrEventId}`))
export const getRecentNotices = (size = 8) =>
  unwrap(
    api.get('/notices/recent', {
      params: { size },
    }),
  )
export const getNotices = (params = {}) =>
  unwrap(
    api.get('/notices', {
      params,
    }),
  )
export const getNoticeDetail = (noticeId) => unwrap(api.get(`/notices/${noticeId}`))
export const getOrganizationTree = () => unwrap(api.get('/org/tree'))
export const getOrganizationMembers = (orgId) => unwrap(api.get(`/org/${orgId}/members`))
export const getCertificateRequestHistories = () => unwrap(api.get('/mypage/certificates/requests'))
export const createCertificateRequest = (payload) => unwrap(api.post('/mypage/certificates/requests', payload))
export const getMyOrganizationMembers = (page = 1, orgId) =>
  unwrap(
    api.get('/org/my/members', {
      params: {
        page,
        ...(orgId ? { orgId } : {}),
      },
    }),
  )
export const getAdminEmployees = (params) => unwrap(api.get('/admin/employees', { params }))
export const getAdminEmployeeTotalCount = () => unwrap(api.get('/admin/employees/total-count'))
export const getAdminUpcomingHireCount = () => unwrap(api.get('/admin/employees/upcoming-hire-count'))
export const getAdminEmployeeDetail = (employeeId) => unwrap(api.get(`/admin/employees/${employeeId}`))
export const getAdminEmployeeOptions = () => unwrap(api.get('/admin/employees/options'))
export const revealAdminEmployeeSensitiveField = (employeeId, payload) =>
  unwrap(api.post(`/admin/employees/${employeeId}/sensitive/reveal`, payload))
export const createAdminEmployee = (payload) => unwrap(api.post('/admin/employees', payload))
export const getAdminHrChangeOptions = () => unwrap(api.get('/admin/hr-change/options'))
export const getAdminHrChangeOrgTree = () => unwrap(api.get('/admin/hr-change/org-tree'))
export const searchAdminHrChangeEmployees = (params) =>
  unwrap(
    api.get('/admin/hr-change/employees/search', {
      params,
    }),
  )
export const getAdminHrChangeCurrentInfo = (employeeId) =>
  unwrap(api.get(`/admin/hr-change/employees/${employeeId}/current`))
export const updateAdminHrChangeEmployee = (employeeId, payload) =>
  unwrap(api.patch(`/admin/hr-change/employees/${employeeId}`, payload))
export const getAdminHrChangeEvents = (params) =>
  unwrap(
    api.get('/admin/hr-change/events', {
      params,
    }),
  )
export const getAdminEmployeeSkillEvidence = (employeeId, skillId) =>
  unwrap(api.get(`/admin/employees/${employeeId}/skills/${skillId}/evidence`))
export const getAdminEmployeeCareerEvidence = (employeeId, careerId) =>
  unwrap(api.get(`/admin/employees/${employeeId}/careers/${careerId}/evidence`))
export const getOrganizationMemberDetail = (targetEmployeeId) =>
  unwrap(api.get(`/org/members/${targetEmployeeId}/detail`))
export const getOrganizationMemberSkillEvidence = (targetEmployeeId, skillId) =>
  unwrap(api.get(`/org/members/${targetEmployeeId}/skills/${skillId}/evidence`))
export const getOrganizationMemberCareerEvidence = (targetEmployeeId, careerId) =>
  unwrap(api.get(`/org/members/${targetEmployeeId}/careers/${careerId}/evidence`))
export const getSkillEvidence = (skillId) => unwrap(api.get(`/mypage/skills/${skillId}/evidence`))
export const getCareerEvidence = (careerId) => unwrap(api.get(`/mypage/careers/${careerId}/evidence`))

export const changeMyPassword = (payload) => api.patch('/mypage/password', payload)

export const updateBasicInfo = async ({ email, phone, address, profileImage }) => {
  const formData = new FormData()
  appendJsonRequest(formData, { email, phone, address })
  if (profileImage instanceof File) {
    formData.append('profileImage', profileImage)
  }

  await api.patch('/mypage/basic-info', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

export const createSkill = async ({ category, skillName, acquisitionDate, licenseNumber, file }) => {
  const formData = new FormData()
  appendJsonRequest(formData, {
    category,
    skillName,
    acquisitionDate,
    licenseNumber: licenseNumber || null,
  })
  formData.append('file', file)

  return unwrap(
    api.post('/mypage/skills', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  )
}

export const createCareer = async ({ companyName, orgName, startDate, endDate, file }) => {
  const formData = new FormData()
  appendJsonRequest(formData, {
    companyName,
    orgName,
    startDate,
    endDate: endDate || null,
  })
  formData.append('file', file)

  return unwrap(
    api.post('/mypage/careers', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  )
}

export const deleteSkill = async (skillId) => {
  await api.delete(`/mypage/skills/${skillId}`)
}

export const deleteCareer = async (careerId) => {
  await api.delete(`/mypage/careers/${careerId}`)
}

export const downloadCertificateByRequestId = async (requestId) => {
  const response = await api.get(`/mypage/certificates/${requestId}/download`, {
    responseType: 'blob',
  })
  return response.data
}
