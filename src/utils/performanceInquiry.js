export const normalizePerformanceInquiryItem = (item) => ({
  ...item,
  type: item.type === 'TEAM' ? 'Team' : item.type === 'PERSONAL' ? 'Personal' : item.type,
})

export const filterVisiblePerformanceInquiryItems = (
  items = [],
  {
    isPerformanceManager = false,
    currentEmployeeId = '',
    userName = '',
  } = {},
) => {
  if (isPerformanceManager) return items

  return items.filter((item) => {
    if (currentEmployeeId) return String(item.employeeId || '') === String(currentEmployeeId)
    return item.employeeName === userName
  })
}
