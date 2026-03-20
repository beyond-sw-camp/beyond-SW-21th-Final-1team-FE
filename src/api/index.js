import axios from 'axios'
import {
  clearLoginSession,
  expireSessionAndRedirectToLogin,
  getAccessToken,
  getAccessTokenRemainingSeconds,
} from '@/utils/auth'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/v1',
  timeout: 10000
})

api.interceptors.request.use((config) => {
  const token = getAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  if (!(config.data instanceof FormData) && !config.headers['Content-Type']) {
    config.headers['Content-Type'] = 'application/json'
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      const requestUrl = String(error?.config?.url || '')
      const currentAccessToken = getAccessToken()
      const authHeader =
        error?.config?.headers?.Authorization || error?.config?.headers?.authorization || ''
      const usesCurrentAccessToken =
        Boolean(currentAccessToken) && authHeader === `Bearer ${currentAccessToken}`
      const remainingSeconds = getAccessTokenRemainingSeconds()
      const shouldForceLogout =
        requestUrl.includes('/auth/refresh') ||
        requestUrl.includes('/auth/logout') ||
        (usesCurrentAccessToken && remainingSeconds <= 0)

      if (!shouldForceLogout) {
        return Promise.reject(error)
      }

      clearLoginSession()
      error.__authExpiredHandled = true
      expireSessionAndRedirectToLogin('인증이 필요합니다.')
    }
    return Promise.reject(error)
  },
)

export default api
