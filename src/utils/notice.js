export const NOTICE_TYPE_OPTIONS = [
  { value: 'ALL', label: '전체 유형' },
  { value: 'SYSTEM', label: '시스템 공지' },
  { value: 'POLICY', label: '정책 변경 공지' },
  { value: 'HR_ANNOUNCEMENT', label: '인사 발령 공지' },
]

const EMPTY_LABEL = '-'

const pickFirst = (...values) => {
  for (const value of values) {
    if (value !== undefined && value !== null && String(value).trim() !== '') {
      return value
    }
  }
  return null
}

const formatDate = (value) => {
  if (!value) return EMPTY_LABEL
  const text = String(value)
  const day = text.includes('T') ? text.split('T')[0] : text.slice(0, 10)
  return day.replace(/-/g, '.')
}

const resolveTypeLabel = (type, explicitLabel) => {
  if (explicitLabel && String(explicitLabel).trim() !== '') return explicitLabel
  return NOTICE_TYPE_OPTIONS.find((item) => item.value === type)?.label || '기타'
}

export const normalizeNotice = (row = {}) => {
  const noticeId = pickFirst(row.noticeId, row.id)
  const noticeType = pickFirst(row.noticeType, row.type)
  const noticeTypeDescription = pickFirst(row.noticeTypeDescription, row.typeLabel)
  const authorOrgName = pickFirst(row.authorOrgName, row.department)
  const authorEmployeeName = pickFirst(row.authorEmployeeName, row.author)
  const createdDateRaw = pickFirst(row.createdDate, row.createdAt)

  return {
    noticeId,
    id: noticeId,
    title: pickFirst(row.title) || EMPTY_LABEL,
    content: pickFirst(row.content) || '',
    noticeType: noticeType || 'SYSTEM',
    noticeTypeDescription: resolveTypeLabel(noticeType, noticeTypeDescription),
    isPinned: Boolean(row.isPinned),
    authorOrgName: authorOrgName || EMPTY_LABEL,
    authorEmployeeName: authorEmployeeName || EMPTY_LABEL,
    createdDate: formatDate(createdDateRaw),
    createdAt: formatDate(createdDateRaw),
    department: authorOrgName || EMPTY_LABEL,
    author: authorEmployeeName || EMPTY_LABEL,
    typeLabel: resolveTypeLabel(noticeType, noticeTypeDescription),
  }
}

export const sortNoticesByDateDesc = (items = []) => {
  return [...items].sort((a, b) => {
    const dateA = String(a?.createdDate || '').replace(/\./g, '-')
    const dateB = String(b?.createdDate || '').replace(/\./g, '-')
    return new Date(dateB).getTime() - new Date(dateA).getTime()
  })
}
