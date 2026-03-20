import { AUTH_KEYS } from '@/utils/auth'

const DOC_TYPE_LABELS = {
  VACATION: '휴가 신청서',
  OVERTIME: '연장근무 신청서',
  FLEXIBLE: '유연근무 신청서',
  TRIP: '외근/출장 신청서',
  LEAVE: '휴직신청서',
  RTW: '복직신청서',
}

const STATUS_LABELS = {
  TEMP: '임시저장',
  PENDING: '진행중',
  HOLD: '보류',
  DELEGATED: '전결',
  COMPLETE: '완료',
  REJECTED: '반려',
  CANCELLED: '취소',
  cancelled: '취소',
  WITHDRAWN: '회수',
}

const LINE_STATUS_LABELS = {
  TEMP: '임시저장',
  PENDING: '대기',
  HOLD: '보류',
  DELEGATED: '전결',
  COMPLETE: '승인',
  REJECTED: '반려',
  WITHDRAWN: '회수',
}

const formatPart = (value) => String(value).padStart(2, '0')

export const formatApprovalDate = (value) => {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value).split('T')[0]
  return `${date.getFullYear()}-${formatPart(date.getMonth() + 1)}-${formatPart(date.getDate())}`
}

export const formatApprovalDateTime = (value) => {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value).replace('T', ' ').slice(0, 16)
  return `${formatApprovalDate(date)} ${formatPart(date.getHours())}:${formatPart(date.getMinutes())}`
}

export const toDocTypeLabel = (docType) => DOC_TYPE_LABELS[docType] || docType || '-'
export const toStatusLabel = (status) => STATUS_LABELS[status] || status || '-'
const toLineStatusLabel = (status) => LINE_STATUS_LABELS[status] || status || '-'

const getSessionEmployeeId = () => {
  if (typeof sessionStorage === 'undefined') return ''
  return String(sessionStorage.getItem(AUTH_KEYS.employeeId) || '')
}

const getSessionUserName = () => {
  if (typeof sessionStorage === 'undefined') return ''
  return String(sessionStorage.getItem(AUTH_KEYS.userName) || '')
}

const findCurrentApprover = (approvalLines = []) => {
  const pendingLine = approvalLines.find((line) => line?.approvalStatus === 'PENDING')
  if (!pendingLine) return '-'
  return [pendingLine.approverName, pendingLine.approverRank].filter(Boolean).join(' ')
}

const mapApprovalLine = (approvalLines = []) =>
  approvalLines.map((line) => ({
    name: line.approverName,
    position: line.approverRank || '',
    status: toLineStatusLabel(line.approvalStatus),
    date: formatApprovalDate(line.approvedDate || line.readDate),
  }))

const mapReferenceLines = (referenceLines = []) =>
  referenceLines.map((line) => [line.referencerName, line.referenceRank].filter(Boolean).join(' '))

const mapAttachments = (approvalId, attachments = []) =>
  attachments.map((file) => ({
    fileId: file.fileId,
    approvalId,
    name: file.originalName,
    createdDate: formatApprovalDateTime(file.createdDate),
  }))

const extractDetailFields = (detail) => {
  if (detail.vacationDetail) {
    return {
      startDate: formatApprovalDate(detail.vacationDetail.startDate),
      endDate: formatApprovalDate(detail.vacationDetail.endDate),
      startTime: '',
      endTime: '',
      content: detail.vacationDetail.reason,
      vacationType: detail.vacationDetail.vacationType,
    }
  }
  if (detail.overtimeDetail) {
    return {
      startDate: formatApprovalDate(detail.overtimeDetail.workDate),
      endDate: formatApprovalDate(detail.overtimeDetail.workDate),
      startTime: detail.overtimeDetail.startTime || '',
      endTime: detail.overtimeDetail.endTime || '',
      content: detail.overtimeDetail.reason,
    }
  }
  if (detail.flexibleWorkDetail) {
    return {
      startDate: formatApprovalDate(detail.flexibleWorkDetail.startDate),
      endDate: formatApprovalDate(detail.flexibleWorkDetail.endDate),
      startTime: String(detail.flexibleWorkDetail.startDate || '').slice(11, 16),
      endTime: String(detail.flexibleWorkDetail.endDate || '').slice(11, 16),
      content: detail.flexibleWorkDetail.reason,
    }
  }
  if (detail.businessTripDetail) {
    return {
      startDate: formatApprovalDate(detail.businessTripDetail.startDate),
      endDate: formatApprovalDate(detail.businessTripDetail.endDate),
      startTime: String(detail.businessTripDetail.startDate || '').slice(11, 16),
      endTime: String(detail.businessTripDetail.endDate || '').slice(11, 16),
      tripType: detail.businessTripDetail.tripType,
      destination: detail.businessTripDetail.destination,
      content: detail.businessTripDetail.reason,
    }
  }
  if (detail.leaveDetail) {
    return {
      startDate: formatApprovalDate(detail.leaveDetail.startDate),
      endDate: formatApprovalDate(detail.leaveDetail.endDate),
      leaveType: detail.leaveDetail.leaveType,
      content: detail.leaveDetail.reason,
    }
  }
  if (detail.rtwDetail) {
    return {
      rtwDate: formatApprovalDate(detail.rtwDetail.rtwDate),
      content: detail.rtwDetail.reason,
    }
  }
  return { content: '상세 본문 데이터가 없습니다.' }
}

export const mapApprovalDetailToItem = (detail) => {
  const status = toStatusLabel(detail.approvalStatus)
  const approvalLine = mapApprovalLine(detail.approvalLines)
  const currentEmployeeId = getSessionEmployeeId()
  const drafterId = detail.drafterId == null ? '' : String(detail.drafterId)
  const isDrafter = currentEmployeeId && drafterId === currentEmployeeId
  const rejectLine = (detail.approvalLines || []).find((line) => line?.approvalStatus === 'REJECTED')

  return {
    approvalId: detail.approvalId,
    id: detail.docId || String(detail.approvalId),
    title: detail.title,
    category: toDocTypeLabel(detail.docType),
    templateName: toDocTypeLabel(detail.docType),
    status,
    draftDate: formatApprovalDateTime(detail.draftDate),
    date: formatApprovalDateTime(detail.draftDate),
    drafter: detail.drafterName || getSessionUserName(),
    department: detail.departmentName || '-',
    currentApprover: findCurrentApprover(detail.approvalLines),
    approvalLine,
    referrers: mapReferenceLines(detail.referenceLines),
    receivers: (detail.recipientLines || []).map((line) =>
      [line.receiverName, line.receiverRank].filter(Boolean).join(' '),
    ),
    attachments: mapAttachments(detail.approvalId, detail.attachments),
    rejectReason: rejectLine?.reason || '',
    canReview: !isDrafter && status === '진행중',
    isDrafter,
    ...extractDetailFields(detail),
  }
}

export const mapReviewItem = (item) => ({
  approvalId: item.approvalId,
  id: item.docId || String(item.approvalId),
  title: item.title,
  category: toDocTypeLabel(item.docType),
  drafter: item.drafterName,
  position: '',
  department: item.departmentName || '-',
  date: formatApprovalDate(item.draftDate),
  status: toStatusLabel(item.approvalStatus),
  isRead: !!item.readDate,
  content: '',
})

export const mapProgressItem = (item) => ({
  approvalId: item.approvalId,
  id: item.docId || String(item.approvalId),
  templateName: toDocTypeLabel(item.docType),
  category: toDocTypeLabel(item.docType),
  title: item.title,
  draftDate: formatApprovalDate(item.draftDate),
  date: formatApprovalDate(item.draftDate),
  status: toStatusLabel(item.approvalStatus),
  currentApprover: item.currentApproverName || '-',
  progress: item.progressPercent || 0,
  readDate: item.readDate ?? null,
  isRead: item.readDate !== null && item.readDate !== undefined,
})

export const mapBoxItem = (item) => ({
  approvalId: item.approvalId,
  id: item.docId || String(item.approvalId),
  title: item.title,
  category: toDocTypeLabel(item.docType),
  drafter: item.drafterName,
  position: '',
  department: item.departmentName || '-',
  date: formatApprovalDateTime(item.draftDate),
  status: toStatusLabel(item.approvalStatus),
  isRead: !!item.readDate,
  content: '',
})

export const mapDashboardPendingItem = (item) => ({
  approvalId: item.approvalId,
  id: String(item.approvalId),
  title: item.title,
  templateName: toDocTypeLabel(item.docType),
  drafter: item.drafterName,
  draftDate: formatApprovalDate(item.draftDate),
  readDate: item.readDate ?? null,
  isRead: item.readDate !== null && item.readDate !== undefined,
})

export const mapDashboardDraftItem = (item) => ({
  approvalId: item.approvalId,
  id: String(item.approvalId),
  title: item.title,
  currentApprover: item.currentApproverName || '-',
  status: toStatusLabel(item.approvalStatus),
  approverInitial: (item.currentApproverName || '-').slice(0, 1),
})

export const mapMainSummaryItem = (item, type) => ({
  id: `${type}-${item.approvalId}`,
  approvalId: item.approvalId,
  type,
  title: item.title,
  who: item.drafterName,
  date: formatApprovalDate(item.draftDate),
  readDate: item.readDate ?? null,
  isRead: item.readDate !== null && item.readDate !== undefined,
})
