<template>
  <div class="login-page">
    <!-- 왼쪽: 로그인 폼 -->
    <div class="login-left">
      <div class="login-form-wrap">
        <div class="login-logo">
          <img class="login-logo-img" :src="logo" alt="RHight logo"/>
          <span class="login-logo-text">RHight</span>
        </div>


        <div class="login-fields">
          <div class="field-group">
            <input
                type="text"
                v-model="username"
                placeholder="아이디를 입력하세요"
                @input="clearLoginError"
                @keyup.enter="handleLogin"
            />
          </div>
          <div class="field-group">
            <input
                type="password"
                v-model="password"
                placeholder="비밀번호를 입력하세요"
                @input="clearLoginError"
                @keyup.enter="handleLogin"
            />
          </div>

          <div class="reset-link">
            <a href="#" @click.prevent="showResetModal = true">비밀번호를 까먹으셨나요?</a>
          </div>

          <button class="login-btn" @click="handleLogin" :disabled="!username || !password">
            로그인
          </button>

          <p v-if="loginError" class="login-error">{{ loginError }}</p>

          <p class="test-account-info">
            관리자 데모: 사번 <strong>2402040001</strong> / 비밀번호 <strong>admin1234!</strong>
          </p>
          <p class="test-account-info">
            사용자 데모: 사번 <strong>2402040002</strong> / 비밀번호 <strong>test1234!</strong>
          </p>

        </div>

        <div class="login-footer">
          © 2026 RHight. All rights reserved.
        </div>
      </div>
    </div>

    <!-- 오른쪽: 브랜드 배경 -->
    <div class="login-right">
      <!-- 장식용 원 -->
      <div class="circle circle-1"></div>
      <div class="circle circle-2"></div>
      <div class="circle circle-3"></div>
      <div class="brand-content">
        <h1>Welcome to RHight</h1>
        <p>효율적인 인사관리로 팀의 성장을 함께하세요</p>
      </div>
    </div>
    <PasswordResetModal v-model="showResetModal" @confirm="handleResetIdentity" />
    <BaseModal v-model="showResetPasswordModal" width="460px" :closable="false">
      <div class="force-header">
        <h2 class="modal-title">비밀번호 변경</h2>
        <button class="force-close" type="button" @click="showResetPasswordModal = false" aria-label="닫기">×</button>
      </div>
      <p class="force-desc">초기화된 비밀번호입니다. 보안을 위해 비밀번호를 변경해주세요.</p>
      <div class="force-fields">
        <div class="field-group">
          <input
            type="password"
            v-model="resetPasswordForm.newPassword"
            placeholder="새 비밀번호를 입력하세요"
            @input="validateResetPassword"
          />
          <div v-if="resetPasswordForm.newPassword" class="pw-rules">
            <div v-for="rule in resetPwRules" :key="rule.label" class="pw-rule" :class="{ pass: rule.pass }">
              <svg v-if="rule.pass" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
              <svg v-else width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>
              {{ rule.label }}
            </div>
          </div>
        </div>
        <div class="field-group">
          <input
            type="password"
            v-model="resetPasswordForm.confirmPassword"
            placeholder="새 비밀번호를 다시 입력하세요"
            @input="validateResetPassword"
          />
        </div>
      </div>
      <p v-if="resetPasswordError" class="reset-error">{{ resetPasswordError }}</p>
      <div class="force-actions">
        <button class="login-btn" type="button" :disabled="!canSubmitResetPassword" @click="submitResetPassword">비밀번호 변경 후 로그인</button>
      </div>
    </BaseModal>
  </div>

</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { changeInitialPassword, initializePassword, login } from '@/api/auth'
import logo from '@/assets/logo-rhight.png'
import PasswordResetModal from '@/components/user/PasswordResetModal.vue'
import BaseModal from '@/components/common/BaseModal.vue'
import { getRoleCodesFromToken, getRoleFromToken, setLoginSession } from '@/utils/auth'

const router = useRouter()
const username = ref('')
const password = ref('')
const showResetModal = ref(false)
const showResetPasswordModal = ref(false)
const loginError = ref('')
const resetPasswordError = ref('')
const passwordChangeTicket = ref('')
const resetPasswordForm = ref({
  newPassword: '',
  confirmPassword: ''
})
const completeLogin = (sessionPayload) => {
  setLoginSession({
    ...sessionPayload,
    lastLoginAt: formatLoginTimestamp()
  })
  router.push('/')
}

const clearLoginError = () => {
  loginError.value = ''
}
const validateResetPassword = () => {
  resetPasswordError.value = ''
}

const resetPwRules = computed(() => {
  const value = resetPasswordForm.value.newPassword || ''
  return [
    { label: '8~15자', pass: value.length >= 8 && value.length <= 15 },
    { label: '영문 포함', pass: /[A-Za-z]/.test(value) },
    { label: '숫자 포함', pass: /\d/.test(value) },
    { label: '특수문자 포함', pass: /[!@#$%^&*()\-_=+\[\]{}?]/.test(value) },
  ]
})

const allResetPwRulesPass = computed(() => resetPwRules.value.every((rule) => rule.pass))

const canSubmitResetPassword = computed(() => {
  const newPassword = resetPasswordForm.value.newPassword || ''
  const confirmPassword = resetPasswordForm.value.confirmPassword || ''
  return Boolean(passwordChangeTicket.value) && allResetPwRulesPass.value && newPassword === confirmPassword
})

const formatLoginTimestamp = () => {
  const now = new Date()
  const yyyy = String(now.getFullYear())
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const dd = String(now.getDate()).padStart(2, '0')
  const hh = String(now.getHours()).padStart(2, '0')
  const min = String(now.getMinutes()).padStart(2, '0')
  return `${yyyy}.${mm}.${dd} ${hh}:${min}`
}

const completeBackendLogin = (loginData, fallbackUserId = '') => {
  if (!loginData) {
    throw new Error('로그인 응답이 비어 있습니다.')
  }

  const profile = loginData.userProfile
  const accessToken = loginData.accessToken || ''
  const allowedViewCodes = Array.isArray(loginData.views)
    ? loginData.views.map((item) => item?.viewCode).filter(Boolean)
    : []
  completeLogin({
    userId: profile?.employeeNum || fallbackUserId,
    employeeId: profile?.employeeId ? String(profile.employeeId) : '',
    userName: profile?.employeeName || fallbackUserId,
    orgId: profile?.orgId ? String(profile.orgId) : '',
    orgName: profile?.orgName || '',
    positionName: profile?.positionName || '',
    rankName: profile?.rankName || '',
    jobName: profile?.jobName || '',
    role: getRoleFromToken(accessToken),
    roleCodes: getRoleCodesFromToken(accessToken),
    allowedViewCodes,
    accessToken,
  })
}

const handleResetIdentity = async ({ empNo, ssn }) => {
  try {
    await initializePassword(empNo, ssn)
    alert('초기 비밀번호가 메일로 발송되었습니다. 로그인 후 비밀번호를 변경해주세요.')
  } catch (error) {
    alert(error?.response?.data?.error?.message || '비밀번호 초기화에 실패했습니다.')
  }
}

const handleLogin = async () => {
  if (!username.value || !password.value) return
  loginError.value = ''

  const userId = username.value.trim()
  try {
    const loginData = await login(userId, password.value)
    if (loginData?.requiresPasswordChange) {
      passwordChangeTicket.value = loginData.passwordChangeTicket || ''
      resetPasswordForm.value = { newPassword: '', confirmPassword: '' }
      resetPasswordError.value = ''
      showResetPasswordModal.value = true
      return
    }
    completeBackendLogin(loginData, userId)
  } catch (error) {
    loginError.value = error?.response?.data?.error?.message || '아이디와 비밀번호가 일치하지 않습니다.'
    password.value = ''
  }
}

const submitResetPassword = async () => {
  const newPassword = resetPasswordForm.value.newPassword
  const confirmPassword = resetPasswordForm.value.confirmPassword

  if (!passwordChangeTicket.value) return
  resetPasswordError.value = ''

  if (!newPassword || !confirmPassword) {
    resetPasswordError.value = '새 비밀번호를 모두 입력해주세요.'
    return
  }
  if (!allResetPwRulesPass.value) {
    resetPasswordError.value = '비밀번호 정책을 모두 충족해주세요.'
    return
  }
  if (newPassword !== confirmPassword) {
    resetPasswordError.value = '새 비밀번호가 일치하지 않습니다.'
    return
  }

  try {
    const loginData = await changeInitialPassword(
      passwordChangeTicket.value,
      newPassword,
      confirmPassword,
    )
    showResetPasswordModal.value = false
    passwordChangeTicket.value = ''
    completeBackendLogin(loginData, username.value.trim())
  } catch (error) {
    resetPasswordError.value =
      error?.response?.data?.error?.message || '비밀번호 변경에 실패했습니다.'
  }
}
</script>

<style scoped>
.login-page {
  display: flex;
  min-height: 100vh;
  background: #fff;
}

/* ── 왼쪽: 로그인 폼 ── */
.login-left {
  flex: 0 0 420px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.login-form-wrap {
  width: 100%;
  max-width: none;
}

.login-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 48px;
}

.login-logo-text {
  font-family: 'Plus Jakarta Sans', 'Noto Sans KR', sans-serif;
  font-size: 1.8rem;
  font-weight: 800;
  color: #1E293B;
}

.login-fields {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field-group label {
  font-size: 0.88rem;
  font-weight: 600;
  color: #1E293B;
}

.field-group input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #E2E8F0;
  border-radius: 10px;
  font-size: 0.88rem;
  font-family: 'Noto Sans KR', sans-serif;
  color: #334155;
  background: #fff;
  transition: all 0.2s;
  outline: none;
}

.field-group input::placeholder {
  color: #94A3B8;
}

.field-group input:focus {
  border-color: #0891B2;
  box-shadow: 0 0 0 3px #ECFEFF;
}

.reset-link {
  text-align: right;
  margin-top: -8px;
}

.reset-link a {
  font-size: 0.82rem;
  font-weight: 600;
  color: #0891B2;
  text-decoration: none;
}

.reset-link a:hover {
  text-decoration: underline;
}

.login-btn {
  width: 100%;
  padding: 14px;
  border: none;
  border-radius: 10px;
  background: #0891B2;
  color: #fff;
  font-size: 1rem;
  font-weight: 700;
  font-family: 'Noto Sans KR', sans-serif;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 4px;
}

.login-btn:hover:not(:disabled) {
  background: #0E7490;
}

.login-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.login-error {
  margin: -10px 0 0;
  font-size: 0.84rem;
  color: #DC2626;
  line-height: 1.4;
}
.reset-error {
  margin: 8px 0 0;
  font-size: 0.84rem;
  color: #DC2626;
  line-height: 1.4;
}

.test-account-info {
  margin: 0;
  font-size: 0.78rem;
  color: #64748B;
  line-height: 1.5;
}
.force-desc {
  margin: 0 0 16px;
  font-size: .85rem;
  color: #64748B;
}
.force-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
}
.force-close {
  border: none;
  background: transparent;
  font-size: 1.5rem;
  line-height: 1;
  color: #64748B;
  cursor: pointer;
  padding: 2px 6px;
}
.force-close:hover {
  color: #0F172A;
}
.force-fields {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.force-actions {
  margin-top: 14px;
}
.pw-rules {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 14px;
  margin-top: 6px;
}
.pw-rule {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: .72rem;
  color: #94A3B8;
}
.pw-rule.pass {
  color: #16A34A;
}

.login-footer {
  margin-top: 40px;
  font-size: 0.78rem;
  color: #94A3B8;
}

/* ── 오른쪽: 브랜드 배경 ── */
.login-right {
  flex: 1;
  background: linear-gradient(135deg, #0891B2 0%, #06B6D4 40%, #22D3EE 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.brand-content {
  text-align: center;
  position: relative;
  z-index: 2;
}

.brand-content h1 {
  font-family: 'Plus Jakarta Sans', 'Noto Sans KR', sans-serif;
  font-size: 2.8rem;
  font-weight: 800;
  color: #fff;
  margin-bottom: 12px;
}

.brand-content p {
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.85);
  font-weight: 400;
}

/* 장식 원 */
.circle {
  position: absolute;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.circle-1 {
  width: 500px;
  height: 500px;
  top: -80px;
  left: 10%;
}

.circle-2 {
  width: 400px;
  height: 400px;
  top: 5%;
  right: 5%;
}

.circle-3 {
  width: 350px;
  height: 350px;
  bottom: -60px;
  right: 15%;
}
.login-logo-img{
  height: 40px;   /* 필요하면 36~44 사이로 조절 */
  width: auto;
  display: block;
  object-fit: contain;
}
</style>
