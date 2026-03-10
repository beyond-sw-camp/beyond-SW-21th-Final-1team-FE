export const AUTH_KEYS = {
  loggedIn: 'isLoggedIn',
  role: 'userRole',
  roleCodes: 'userRoleCodes',
  userId: 'userId',
  employeeId: 'employeeId',
  userName: 'userName',
  orgName: 'orgName',
  positionName: 'positionName',
  rankName: 'rankName',
  jobName: 'jobName',
  accessToken: 'accessToken',
  lastLoginAt: 'lastLoginAt'
}

export const USER_ROLES = {
  user: 'USER',
  admin: 'ADMIN',
  evaluator: 'EVALUATOR',
  appraisee: 'EVALUATEE',
}

const ADMIN_ROLE_CODES = new Set([
  'ROLE_HR_ADMIN_MASTER',
  'ROLE_HR_ADMIN_BASIC',
  'ROLE_HR_ADMIN_PAYROLL',
])

const decodeJwtPayload = (token) => {
  try {
    const payload = token.split('.')[1]
    if (!payload) return null
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/')
    const padded = normalized.padEnd(normalized.length + ((4 - normalized.length % 4) % 4), '=')
    return JSON.parse(window.atob(padded))
  } catch (_error) {
    return null
  }
}

export const getRoleFromToken = (token) => {
  const roles = getRoleCodesFromToken(token)
  if (roles.some((role) => ADMIN_ROLE_CODES.has(role))) return USER_ROLES.admin
  if (roles.some((role) => role === 'EVALUATOR' || role === 'ROLE_EVALUATOR')) {
    return USER_ROLES.evaluator
  }
  if (roles.some((role) => role === 'EVALUATEE' || role === 'ROLE_EVALUATEE')) {
    return USER_ROLES.appraisee
  }
  return USER_ROLES.user
}

export const getRoleCodesFromToken = (token) => {
  const claims = decodeJwtPayload(token)
  return Array.isArray(claims?.roles) ? claims.roles : []
}

export const getSessionRole = () => sessionStorage.getItem(AUTH_KEYS.role) || USER_ROLES.user
export const isAdminRole = () =>
  getSessionRoleCodes().some((role) => ADMIN_ROLE_CODES.has(role)) || getSessionRole() === USER_ROLES.admin
export const getSessionRoleCodes = () => {
  try {
    return JSON.parse(sessionStorage.getItem(AUTH_KEYS.roleCodes) || '[]')
  } catch (_error) {
    return []
  }
}
export const isEvaluatorRole = () =>
  getSessionRoleCodes().some((role) => role === 'EVALUATOR' || role === 'ROLE_EVALUATOR')
export const isAppraiseeRole = () =>
  getSessionRoleCodes().some((role) => role === 'EVALUATEE' || role === 'ROLE_EVALUATEE')
export const getAccessToken = () => sessionStorage.getItem(AUTH_KEYS.accessToken) || ''
export const getLoginSession = () => ({
  loggedIn: sessionStorage.getItem(AUTH_KEYS.loggedIn) === 'true',
  userId: sessionStorage.getItem(AUTH_KEYS.userId) || '',
  employeeId: sessionStorage.getItem(AUTH_KEYS.employeeId) || '',
  userName: sessionStorage.getItem(AUTH_KEYS.userName) || '',
  orgName: sessionStorage.getItem(AUTH_KEYS.orgName) || '',
  positionName: sessionStorage.getItem(AUTH_KEYS.positionName) || '',
  rankName: sessionStorage.getItem(AUTH_KEYS.rankName) || '',
  jobName: sessionStorage.getItem(AUTH_KEYS.jobName) || '',
  role: getSessionRole(),
  roleCodes: getSessionRoleCodes(),
  accessToken: getAccessToken(),
  lastLoginAt: sessionStorage.getItem(AUTH_KEYS.lastLoginAt) || '',
})

export const setLoginSession = ({
  userId,
  employeeId,
  userName,
  orgName,
  positionName,
  rankName,
  jobName,
  role,
  roleCodes,
  accessToken,
  lastLoginAt,
}) => {
  sessionStorage.setItem(AUTH_KEYS.loggedIn, 'true')
  sessionStorage.setItem(AUTH_KEYS.userId, userId || '')
  sessionStorage.setItem(AUTH_KEYS.employeeId, employeeId || '')
  sessionStorage.setItem(AUTH_KEYS.userName, userName || '')
  sessionStorage.setItem(AUTH_KEYS.orgName, orgName || '')
  sessionStorage.setItem(AUTH_KEYS.positionName, positionName || '')
  sessionStorage.setItem(AUTH_KEYS.rankName, rankName || '')
  sessionStorage.setItem(AUTH_KEYS.jobName, jobName || '')
  sessionStorage.setItem(AUTH_KEYS.role, role || USER_ROLES.user)
  sessionStorage.setItem(AUTH_KEYS.roleCodes, JSON.stringify(Array.isArray(roleCodes) ? roleCodes : []))
  sessionStorage.setItem(AUTH_KEYS.accessToken, accessToken || '')
  sessionStorage.setItem(AUTH_KEYS.lastLoginAt, lastLoginAt || '')
}

export const clearLoginSession = () => {
  sessionStorage.setItem(AUTH_KEYS.loggedIn, 'false')
  sessionStorage.removeItem(AUTH_KEYS.userId)
  sessionStorage.removeItem(AUTH_KEYS.employeeId)
  sessionStorage.removeItem(AUTH_KEYS.userName)
  sessionStorage.removeItem(AUTH_KEYS.orgName)
  sessionStorage.removeItem(AUTH_KEYS.positionName)
  sessionStorage.removeItem(AUTH_KEYS.rankName)
  sessionStorage.removeItem(AUTH_KEYS.jobName)
  sessionStorage.removeItem(AUTH_KEYS.role)
  sessionStorage.removeItem(AUTH_KEYS.roleCodes)
  sessionStorage.removeItem(AUTH_KEYS.accessToken)
  sessionStorage.removeItem(AUTH_KEYS.lastLoginAt)
}
