import api from './index'

const unwrap = async (request) => {
  const response = await request
  return response.data?.data
}

const appendDraftPayload = (formData, payload) => {
  formData.append('dto', new Blob([JSON.stringify(payload)], { type: 'application/json' }))
}

const appendFiles = (formData, files = []) => {
  files.forEach((file) => {
    if (file instanceof File) {
      formData.append('files', file)
    }
  })
}

export const getApprovalDashboard = () => unwrap(api.get('/approval/dashboard'))
export const getApprovalMainSummary = () => unwrap(api.get('/approval/main'))
export const getAdminVacationList = (params = {}) =>
  unwrap(api.get('/approval/admin/vacation-list', { params }))
export const getApprovalReviews = (params = {}) => unwrap(api.get('/approval/review', { params }))
export const getApprovalBoxes = (params = {}) => unwrap(api.get('/approval/boxes', { params }))
export const getApprovalProgressOverview = (params = {}) =>
  unwrap(api.get('/approval/progress', { params }))
export const searchApprovalProgress = (params = {}) =>
  unwrap(api.get('/approval/progress/search', { params }))
export const getApprovalDetail = (approvalId) => unwrap(api.get(`/approval/${approvalId}`))
export const markApprovalAsRead = (approvalId) => unwrap(api.patch(`/approval/${approvalId}/read`))
export const processApproval = (approvalId, payload) =>
  unwrap(api.patch(`/approval/${approvalId}/process`, payload))
export const deleteApproval = (approvalId) => api.delete(`/approval/${approvalId}`)

export const downloadApprovalAttachment = async (approvalId, fileId) => {
  const response = await api.get(`/approval/${approvalId}/attachments/${fileId}/download`, {
    responseType: 'blob',
  })
  const disposition = response.headers?.['content-disposition'] || ''
  const utf8Match = disposition.match(/filename\*=UTF-8''([^;]+)/i)
  const basicMatch = disposition.match(/filename="?([^"]+)"?/i)
  const filename = decodeURIComponent(utf8Match?.[1] || basicMatch?.[1] || 'attachment')
  return { blob: response.data, filename }
}

export const draftApproval = async ({ payload, files }) => {
  const formData = new FormData()
  appendDraftPayload(formData, payload)
  appendFiles(formData, files)
  return unwrap(api.post('/approval', formData))
}

export const tempApproval = async ({ payload, files }) => {
  const formData = new FormData()
  appendDraftPayload(formData, payload)
  appendFiles(formData, files)
  return unwrap(api.post('/approval/temp', formData))
}

export const redraftApproval = async ({ approvalId, payload, files }) => {
  const formData = new FormData()
  appendDraftPayload(formData, payload)
  appendFiles(formData, files)
  return unwrap(api.patch(`/approval/${approvalId}`, formData))
}
