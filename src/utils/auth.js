import { ref } from 'vue'

export const AUTH_KEYS = {
  loggedIn: 'isLoggedIn',
  role: 'userRole',
  roleCodes: 'userRoleCodes',
  allowedViewCodes: 'allowedViewCodes',
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

export const ADMIN_ROLE_CODES = new Set([
  'HR_ADMIN_MASTER',
  'HR_ADMIN_BASIC',
  'HR_ADMIN_PAYROLL',
  'ROLE_HR_ADMIN_MASTER',
  'ROLE_HR_ADMIN_BASIC',
  'ROLE_HR_ADMIN_PAYROLL',
  'HR_ADMIN_MASTER',
  'HR_ADMIN_BASIC',
  'HR_ADMIN_PAYROLL',
  'ADMIN',
])

const PERSONAL_ATTENDANCE_VIEW_CODES = [
  'ATTENDANCE_MAIN',
  'ATTENDANCE_RECORD',
  'ATTENDANCE_HISTORY',
  'ATTENDANCE_SCHEDULE',
  'ATTENDANCE_VACATION',
]

const EVALUATOR_ROLE_CODES = new Set(['EVALUATOR', 'ROLE_EVALUATOR'])
const APPRAISEE_ROLE_CODES = new Set(['EVALUATEE', 'ROLE_EVALUATEE'])

const readSessionItem = (key, fallback = '') => {
  if (typeof window === 'undefined') return fallback
  return sessionStorage.getItem(key) || fallback
}

const readSessionRoleCodes = () => {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(sessionStorage.getItem(AUTH_KEYS.roleCodes) || '[]')
  } catch (_error) {
    return []
  }
}

const hasAnyRoleCode = (roleCodes = [], candidates = new Set()) =>
  roleCodes.some((role) => candidates.has(role))

const normalizeAllowedViewCodes = (allowedViewCodes = [], roleCodes = []) => {
  const normalized = new Set(Array.isArray(allowedViewCodes) ? allowedViewCodes : [])
  if (hasAnyRoleCode(roleCodes, ADMIN_ROLE_CODES)) {
    PERSONAL_ATTENDANCE_VIEW_CODES.forEach((viewCode) => normalized.add(viewCode))
  }
  return Array.from(normalized)
}

const readSessionAllowedViewCodes = () => {
  if (typeof window === 'undefined') return []
  try {
    return normalizeAllowedViewCodes(
      JSON.parse(sessionStorage.getItem(AUTH_KEYS.allowedViewCodes) || '[]'),
      readSessionRoleCodes(),
    )
  } catch (_error) {
    return []
  }
}

export const sessionRoleRef = ref(readSessionItem(AUTH_KEYS.role, USER_ROLES.user))
export const sessionRoleCodesRef = ref(readSessionRoleCodes())
export const sessionAllowedViewCodesRef = ref(readSessionAllowedViewCodes())

const syncSessionAuthState = () => {
  sessionRoleRef.value = readSessionItem(AUTH_KEYS.role, USER_ROLES.user)
  sessionRoleCodesRef.value = readSessionRoleCodes()
  sessionAllowedViewCodesRef.value = readSessionAllowedViewCodes()
}

const handleStorageEvent = (event) => {
  if (!event.key || event.key === AUTH_KEYS.role || event.key === AUTH_KEYS.roleCodes) {
    syncSessionAuthState()
  }
}

const handleSessionStorageChanged = () => {
  syncSessionAuthState()
}

if (typeof window !== 'undefined') {
  window.removeEventListener('storage', handleStorageEvent)
  window.addEventListener('storage', handleStorageEvent)
  window.removeEventListener('session-storage-changed', handleSessionStorageChanged)
  window.addEventListener('session-storage-changed', handleSessionStorageChanged)
}

const dispatchSessionStorageChanged = () => {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent('session-storage-changed'))
}

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

export const getSessionRole = () => sessionRoleRef.value
export const getSessionRoleCodes = () => sessionRoleCodesRef.value
export const getAllowedViewCodes = () => sessionAllowedViewCodesRef.value
export const isAdminRole = (
  roleCodes = sessionRoleCodesRef.value,
  role = sessionRoleRef.value,
) => hasAnyRoleCode(roleCodes, ADMIN_ROLE_CODES) || role === USER_ROLES.admin
export const isEvaluatorRole = (roleCodes = sessionRoleCodesRef.value) =>
  hasAnyRoleCode(roleCodes, EVALUATOR_ROLE_CODES)
export const isAppraiseeRole = (roleCodes = sessionRoleCodesRef.value) =>
  hasAnyRoleCode(roleCodes, APPRAISEE_ROLE_CODES)
export const getAccessToken = () => readSessionItem(AUTH_KEYS.accessToken)
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
  allowedViewCodes: getAllowedViewCodes(),
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
  allowedViewCodes,
  accessToken,
  lastLoginAt,
}) => {
  const normalizedRoleCodes = Array.isArray(roleCodes) ? roleCodes : []
  const normalizedAllowedViewCodes = normalizeAllowedViewCodes(allowedViewCodes, normalizedRoleCodes)
  sessionStorage.setItem(AUTH_KEYS.loggedIn, 'true')
  sessionStorage.setItem(AUTH_KEYS.userId, userId || '')
  sessionStorage.setItem(AUTH_KEYS.employeeId, employeeId || '')
  sessionStorage.setItem(AUTH_KEYS.userName, userName || '')
  sessionStorage.setItem(AUTH_KEYS.orgName, orgName || '')
  sessionStorage.setItem(AUTH_KEYS.positionName, positionName || '')
  sessionStorage.setItem(AUTH_KEYS.rankName, rankName || '')
  sessionStorage.setItem(AUTH_KEYS.jobName, jobName || '')
  sessionStorage.setItem(AUTH_KEYS.role, role || USER_ROLES.user)
  sessionStorage.setItem(AUTH_KEYS.roleCodes, JSON.stringify(normalizedRoleCodes))
  sessionStorage.setItem(
    AUTH_KEYS.allowedViewCodes,
    JSON.stringify(normalizedAllowedViewCodes),
  )
  sessionStorage.setItem(AUTH_KEYS.accessToken, accessToken || '')
  sessionStorage.setItem(AUTH_KEYS.lastLoginAt, lastLoginAt || '')
  syncSessionAuthState()
  dispatchSessionStorageChanged()
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
  sessionStorage.removeItem(AUTH_KEYS.allowedViewCodes)
  sessionStorage.removeItem(AUTH_KEYS.accessToken)
  sessionStorage.removeItem(AUTH_KEYS.lastLoginAt)
  syncSessionAuthState()
  dispatchSessionStorageChanged()
}
