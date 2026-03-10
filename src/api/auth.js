import api from './index'

export const login = async (employeeNum, password) => {
  const response = await api.post('/auth/login', { employeeNum, password })
  return response.data?.data
}

export const initializePassword = (employeeNum, residentNum) =>
  api.patch('/auth/initialize/password', { employeeNum, residentNum })

export const changeInitialPassword = async (ticket, newPassword, confirmPassword) => {
  const response = await api.patch(
    '/auth/password',
    { newPassword, confirmPassword },
    { headers: { Authorization: `Bearer ${ticket}` } },
  )
  return response.data?.data
}
