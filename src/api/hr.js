import api from './index'

const unwrap = async (request) => {
  const response = await request
  return response.data?.data
}

export const getMyPage = () => unwrap(api.get('/mypage'))
export const getMyPageHeader = () => unwrap(api.get('/mypage/header'))

export const changeMyPassword = (payload) => api.patch('/mypage/password', payload)

export const updateBasicInfo = async ({ email, phone, address, profileImage }) => {
  const formData = new FormData()
  formData.append(
    'request',
    new Blob([JSON.stringify({ email, phone, address })], { type: 'application/json' }),
  )
  if (profileImage instanceof File) {
    formData.append('profileImage', profileImage)
  }

  await api.patch('/mypage/basic-info', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}
