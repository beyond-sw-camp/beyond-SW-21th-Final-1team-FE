import axios from 'axios'
import { clearLoginSession, expireSessionAndRedirectToLogin, getAccessToken } from '@/utils/auth'

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
      clearLoginSession()
      error.__authExpiredHandled = true
      expireSessionAndRedirectToLogin('인증이 필요합니다.')
    }
    return Promise.reject(error)
  },
)

export default api
