<template>
  <div class="tab-info">
    <div class="info-grid">
      <!-- 기본 정보 -->
      <div class="info-card">
        <div class="info-card-header">
          <h3>기본 정보</h3>
          <button class="btn-edit-sm" @click="showEditBasic = true">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            수정
          </button>
        </div>
        <div class="info-rows">
          <div class="info-row"><span class="info-label">이름</span><span class="info-value">{{ user.name }}</span></div>
          <div class="info-row"><span class="info-label">사번</span><span class="info-value font-num bold">{{ user.empNo }}</span></div>
          <div class="info-row"><span class="info-label">이메일</span><span class="info-value">{{ user.email }}</span></div>
          <div class="info-row"><span class="info-label">연락처</span><span class="info-value font-num">{{ user.phone }}</span></div>
          <div class="info-row"><span class="info-label">내선번호</span><span class="info-value font-num">{{ user.extension }}</span></div>
          <div class="info-row"><span class="info-label">생년월일</span><span class="info-value font-num">{{ user.birthDate }}</span></div>
          <div class="info-row"><span class="info-label">주소</span><span class="info-value">{{ user.address }}</span></div>
          <div class="info-row"><span class="info-label">주민번호</span><span class="info-value font-num">{{ user.ssn }}</span></div>
          <div class="info-row"><span class="info-label">계좌번호</span><span class="info-value font-num">{{ user.bankAccount }}</span></div>
          <div class="info-row">
            <span class="info-label">비밀번호</span>
            <span class="info-value"><a class="link" @click="showChangePw = true">변경하기</a></span>
          </div>
        </div>
      </div>

      <!-- 인사 정보 -->
      <div class="info-card">
        <div class="info-card-header"><h3>인사 정보</h3></div>
        <div class="info-rows">
          <div class="info-row"><span class="info-label">조직 · 직책</span><span class="info-value bold">{{ user.orgPosition }}</span></div>
          <div class="info-row"><span class="info-label">직무 · 직근</span><span class="info-value bold">{{ user.jobRole }}</span></div>
          <div class="info-row"><span class="info-label">직위 · 직급</span><span class="info-value bold">{{ user.rank }}</span></div>
          <div class="info-row"><span class="info-label">재직 상태</span><span class="info-value">{{ user.status }}</span></div>
          <div class="info-row"><span class="info-label">입사일</span><span class="info-value font-num bold">{{ user.hireDate }}</span></div>
          <div class="info-row"><span class="info-label">근속 연수</span><span class="info-value bold">{{ user.tenure }}</span></div>
          <div class="info-row"><span class="info-label">근무 형태</span><span class="info-value">{{ user.workType }}</span></div>
          <div class="info-row"><span class="info-label">근무 지역</span><span class="info-value">{{ user.workRegion }}</span></div>
          <div class="info-row"><span class="info-label">입사 유형</span><span class="info-value">{{ user.hireType }}</span></div>
          <div class="info-row info-row-ghost" aria-hidden="true"></div>
        </div>
      </div>

      <!-- 역량 정보 -->
      <div class="info-card">
        <div class="info-card-header">
          <h3>역량 정보</h3>
          <button class="btn-add" @click="showAddSkill = true">+ 추가</button>
        </div>
        <div class="skill-table-wrap">
          <table class="skill-table">
            <thead>
            <tr><th>종류</th><th>자격증명</th><th>취득일</th><th>증빙 파일</th><th>삭제</th></tr>
            </thead>
            <tbody>
            <tr v-for="(s, i) in user.skills" :key="s.skillId || i">
              <td>{{ s.type }}</td>
              <td class="bold">{{ s.name }}</td>
              <td class="font-num">{{ s.date }}</td>
              <td>
                <button
                  v-if="s.hrFileId"
                  type="button"
                  class="link-btn"
                  @click="viewSkillFile(s)"
                >
                  조회
                </button>
                <span v-else class="muted">미등록</span>
              </td>
              <td>
                <button type="button" class="link-btn danger" :disabled="isSubmitting" @click="deleteSkill(i)">삭제</button>
              </td>
            </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 경력사항 -->
      <div class="info-card">
        <div class="info-card-header">
          <h3>경력사항</h3>
          <button class="btn-add" @click="showAddCareer = true">+ 추가</button>
        </div>
        <div class="career-table-wrap">
          <table class="career-table">
            <thead>
            <tr>
              <th>회사명</th>
              <th>직무/소속</th>
              <th>근무기간</th>
              <th>증빙 파일</th>
              <th>삭제</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="(c, i) in user.careers" :key="c.careerId || i">
              <td class="bold">{{ c.company }}</td>
              <td>{{ c.role }}</td>
              <td class="font-num">{{ c.period }}</td>
              <td>
                <button v-if="c.hrFileId" type="button" class="link-btn" @click="viewCareerFile(c)">조회</button>
                <span v-else class="muted">미등록</span>
              </td>
              <td>
                <button type="button" class="link-btn danger" :disabled="isSubmitting" @click="deleteCareer(i)">삭제</button>
              </td>
            </tr>
            <tr v-if="!user.careers || user.careers.length === 0">
              <td colspan="5" class="empty-row">등록된 경력사항이 없습니다.</td>
            </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- 기본 정보 수정 모달 -->
    <BaseModal v-model="showEditBasic" width="480px">
      <h2 class="modal-title">기본 정보 수정</h2>
      <div class="modal-fields">
        <div class="modal-field">
          <label>프로필 이미지</label>
          <div class="profile-image-row">
            <div class="profile-image-preview">
              <img v-if="editForm.profileImagePreview" :src="editForm.profileImagePreview" alt="프로필 이미지" />
              <span v-else>{{ user.name.slice(-2) }}</span>
            </div>
            <button class="btn-upload" type="button" @click="triggerProfileFileInput">이미지 변경</button>
            <input
              ref="profileFileInputRef"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              style="display:none"
              @change="handleProfileImageSelect"
            />
          </div>
        </div>
        <div class="modal-field">
          <label>이메일</label>
          <input v-model="editForm.email" type="email" placeholder="example@rhight.co.kr" />
        </div>
        <div class="modal-field">
          <label>연락처</label>
          <input v-model="editForm.phone" type="text" placeholder="010-0000-0000" />
        </div>
        <div class="modal-field">
          <label>주소</label>
          <input v-model="editForm.address" type="text" placeholder="주소를 입력하세요" />
        </div>
      </div>
      <div class="modal-actions">
        <button class="btn-confirm" :disabled="isSubmitting" @click="saveBasicInfo">확인</button>
        <button class="btn-cancel" @click="showEditBasic = false">취소</button>
      </div>
    </BaseModal>

    <!-- 역량 정보 추가 모달 -->
    <BaseModal v-model="showAddSkill" width="520px">
      <div class="modal-title-row">
        <h2 class="modal-title">역량 정보 추가</h2>
        <span class="modal-close" @click="showAddSkill = false">&times;</span>
      </div>
      <div class="modal-fields">
        <div class="modal-field">
          <label>종류 <span class="required-mark">(필수)</span></label>
          <select v-model="skillForm.type">
            <option value="CERTIFICATE">자격</option>
            <option value="LANGUAGE">어학</option>
            <option value="LICENSE">면허</option>
            <option value="ETC">기타</option>
          </select>
        </div>
        <div class="modal-field">
          <label>자격명 <span class="required-mark">(필수)</span></label>
          <input v-model="skillForm.name" placeholder="자격명을 입력하세요" />
        </div>
        <div class="modal-field">
          <label>취득일 <span class="required-mark">(필수)</span></label>
          <input v-model="skillForm.date" type="date" />
        </div>
        <div class="modal-field">
          <label>자격 번호 (선택)</label>
          <input v-model="skillForm.licenseNumber" placeholder="자격 번호를 입력하세요" />
        </div>
        <div class="modal-field">
          <label>증빙 파일 (이미지 또는 PDF) <span class="required-mark">(필수)</span></label>
          <div class="file-upload" @click="triggerFileInput">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            <span v-if="!skillForm.file">파일 선택</span>
            <span v-else>{{ skillForm.file.name }}</span>
          </div>
          <input
            ref="fileInputRef"
            type="file"
            accept="image/png,image/jpeg,image/webp,application/pdf"
            style="display:none"
            @change="handleFileSelect"
          />
          <span v-if="skillFileError" class="field-error">{{ skillFileError }}</span>
        </div>
      </div>
      <div class="modal-actions">
        <button class="btn-confirm" :disabled="isSubmitting || !canAddSkill" @click="addSkill">확인</button>
        <button class="btn-cancel" @click="showAddSkill = false">취소</button>
      </div>
    </BaseModal>

    <!-- 경력사항 추가 모달 -->
    <BaseModal v-model="showAddCareer" width="520px">
      <div class="modal-title-row">
        <h2 class="modal-title">경력사항 추가</h2>
        <span class="modal-close" @click="showAddCareer = false">&times;</span>
      </div>
      <div class="modal-fields">
        <div class="modal-field">
          <label>회사명 <span class="required-mark">(필수)</span></label>
          <input v-model="careerForm.company" placeholder="회사명을 입력하세요" />
        </div>
        <div class="modal-field">
          <label>직무/소속 <span class="required-mark">(필수)</span></label>
          <input v-model="careerForm.role" placeholder="예: 백엔드 개발자 · 플랫폼개발팀" />
        </div>
        <div class="modal-field-row">
          <div class="modal-field">
            <label>시작일 <span class="required-mark">(필수)</span></label>
            <input v-model="careerForm.startDate" type="date" />
          </div>
          <div class="modal-field">
            <label>종료일</label>
            <input v-model="careerForm.endDate" type="date" />
          </div>
        </div>
        <div class="modal-field">
          <label>증빙 파일 (이미지 또는 PDF) <span class="required-mark">(필수)</span></label>
          <div class="file-upload" @click="triggerCareerFileInput">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            <span v-if="!careerForm.file">파일 선택</span>
            <span v-else>{{ careerForm.file.name }}</span>
          </div>
          <input
            ref="careerFileInputRef"
            type="file"
            accept="image/png,image/jpeg,image/webp,application/pdf"
            style="display:none"
            @change="handleCareerFileSelect"
          />
          <span v-if="careerFileError" class="field-error">{{ careerFileError }}</span>
        </div>
      </div>
      <div class="modal-actions">
        <button class="btn-confirm" :disabled="isSubmitting || !canAddCareer" @click="addCareer">확인</button>
        <button class="btn-cancel" @click="showAddCareer = false">취소</button>
      </div>
    </BaseModal>

    <!-- 비밀번호 변경 모달 -->
    <BaseModal v-model="showChangePw" width="440px">
      <h2 class="modal-title">비밀번호 변경</h2>
      <div class="modal-fields">
        <div class="modal-field">
          <label>현재 비밀번호</label>
          <input v-model="pwForm.current" type="password" placeholder="현재 비밀번호를 입력하세요"
                 :class="{ 'input-error': pwErrors.current }" @input="pwErrors.current = ''" />
          <span v-if="pwErrors.current" class="field-error">{{ pwErrors.current }}</span>
        </div>
        <div class="modal-field">
          <label>새 비밀번호</label>
          <input v-model="pwForm.newPw" type="password" placeholder="새 비밀번호를 입력하세요"
                 @input="validateNewPw" />
          <div v-if="pwForm.newPw" class="pw-rules">
            <div v-for="rule in pwRules" :key="rule.label" class="pw-rule" :class="{ pass: rule.pass }">
              <svg v-if="rule.pass" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
              <svg v-else width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>
              {{ rule.label }}
            </div>
          </div>
        </div>
        <div class="modal-field">
          <label>새 비밀번호 확인</label>
          <input v-model="pwForm.confirm" type="password" placeholder="새 비밀번호를 다시 입력하세요"
                 @input="validateConfirmPw" />
          <span v-if="pwErrors.confirm" class="field-error">{{ pwErrors.confirm }}</span>
        </div>
        <div v-if="pwSuccess" class="success-box">비밀번호가 성공적으로 변경되었습니다.</div>
      </div>
      <div class="modal-actions">
        <button class="btn-confirm" :disabled="isSubmitting || !pwForm.current || !canChangePw" @click="changePassword">비밀번호 변경</button>
        <button class="btn-cancel" @click="closePwModal">취소</button>
      </div>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import BaseModal from '@/components/common/BaseModal.vue'
import {
  changeMyPassword,
  createCareer,
  createSkill,
  deleteCareer as deleteCareerApi,
  deleteSkill as deleteSkillApi,
  getCareerEvidence,
  getSkillEvidence,
  updateBasicInfo,
} from '@/api/hr'

const props = defineProps({ user: { type: Object, required: true } })
const emit = defineEmits(['refresh'])

const isSubmitting = ref(false)

const refresh = () => emit('refresh')

// ── 기본 정보 수정 ──
const showEditBasic = ref(false)
const editForm = reactive({
  profileImagePreview: '',
  profileImageFile: null,
  email: '',
  phone: '',
  address: '',
})
const profileFileInputRef = ref(null)

watch(showEditBasic, (val) => {
  if (val) {
    editForm.profileImagePreview = props.user.profileImage || ''
    editForm.profileImageFile = null
    editForm.email = props.user.email || ''
    editForm.phone = props.user.phone || ''
    editForm.address = props.user.address || ''
  }
})

const triggerProfileFileInput = () => profileFileInputRef.value?.click()

const ALLOWED_EVIDENCE_MIME_TYPES = new Set([
  'image/png',
  'image/jpeg',
  'image/webp',
  'application/pdf',
])
const ALLOWED_EVIDENCE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp', '.pdf']

const isAllowedEvidenceFile = (file) => {
  if (!file) return false
  const fileType = String(file.type || '').toLowerCase()
  if (ALLOWED_EVIDENCE_MIME_TYPES.has(fileType)) return true

  const fileName = String(file.name || '').toLowerCase()
  return ALLOWED_EVIDENCE_EXTENSIONS.some((ext) => fileName.endsWith(ext))
}

const isAllowedProfileImageFile = (file) => {
  if (!file) return false
  const fileType = String(file.type || '').toLowerCase()
  if (fileType === 'image/png' || fileType === 'image/jpeg' || fileType === 'image/webp') {
    return true
  }
  const fileName = String(file.name || '').toLowerCase()
  return ['.png', '.jpg', '.jpeg', '.webp'].some((ext) => fileName.endsWith(ext))
}

const handleProfileImageSelect = (e) => {
  const file = e.target.files?.[0]
  if (!file || !isAllowedProfileImageFile(file)) {
    e.target.value = ''
    return
  }

  editForm.profileImageFile = file
  const reader = new FileReader()
  reader.onload = () => {
    editForm.profileImagePreview = String(reader.result || '')
  }
  reader.readAsDataURL(file)
  e.target.value = ''
}

const saveBasicInfo = async () => {
  if (isSubmitting.value) return
  try {
    isSubmitting.value = true
    await updateBasicInfo({
      email: editForm.email,
      phone: editForm.phone,
      address: editForm.address,
      profileImage: editForm.profileImageFile,
    })
    showEditBasic.value = false
    refresh()
  } catch (error) {
    alert(error?.response?.data?.error?.message || '기본 정보 수정에 실패했습니다.')
  } finally {
    isSubmitting.value = false
  }
}

// ── 역량 정보 추가 ──
const showAddSkill = ref(false)
const fileInputRef = ref(null)
const skillForm = reactive({
  type: 'CERTIFICATE',
  name: '',
  date: '',
  licenseNumber: '',
  file: null,
})
const skillFileError = ref('')
const canAddSkill = computed(() =>
  Boolean(skillForm.type && skillForm.name && skillForm.date && skillForm.file),
)

watch(showAddSkill, (val) => {
  if (!val) {
    skillFileError.value = ''
  }
})

const triggerFileInput = () => fileInputRef.value?.click()

const handleFileSelect = (e) => {
  const file = e.target.files?.[0] || null
  if (!file) {
    skillForm.file = null
    return
  }
  if (!isAllowedEvidenceFile(file)) {
    skillForm.file = null
    skillFileError.value = 'PNG/JPG/JPEG/WEBP/PDF 파일만 업로드할 수 있습니다.'
    e.target.value = ''
    return
  }
  skillForm.file = file
  skillFileError.value = ''
}

const addSkill = async () => {
  if (isSubmitting.value) return
  if (!skillForm.name || !skillForm.date) return
  if (!skillForm.file) {
    skillFileError.value = '증빙 파일을 첨부해야 등록할 수 있습니다.'
    return
  }

  try {
    isSubmitting.value = true
    await createSkill({
      category: skillForm.type,
      skillName: skillForm.name,
      acquisitionDate: skillForm.date,
      licenseNumber: skillForm.licenseNumber || null,
      file: skillForm.file,
    })

    Object.assign(skillForm, {
      type: 'CERTIFICATE',
      name: '',
      date: '',
      licenseNumber: '',
      file: null,
    })
    skillFileError.value = ''
    showAddSkill.value = false
    refresh()
  } catch (error) {
    alert(error?.response?.data?.error?.message || '역량 정보 등록에 실패했습니다.')
  } finally {
    isSubmitting.value = false
  }
}

const viewSkillFile = async (skill) => {
  if (!skill?.skillId) return
  try {
    const response = await getSkillEvidence(skill.skillId)
    if (response?.fileUrl) {
      window.open(response.fileUrl, '_blank', 'noopener,noreferrer')
    }
  } catch (error) {
    alert(error?.response?.data?.error?.message || '증빙 파일 조회에 실패했습니다.')
  }
}

const deleteSkill = async (index) => {
  if (isSubmitting.value) return
  const current = Array.isArray(props.user.skills) ? props.user.skills : []
  const target = current[index]
  if (!target?.skillId) return
  if (!window.confirm('해당 역량 정보를 삭제하시겠습니까?')) return

  try {
    isSubmitting.value = true
    await deleteSkillApi(target.skillId)
    refresh()
  } catch (error) {
    alert(error?.response?.data?.error?.message || '역량 정보 삭제에 실패했습니다.')
  } finally {
    isSubmitting.value = false
  }
}

// ── 경력사항 추가 ──
const showAddCareer = ref(false)
const careerFileInputRef = ref(null)
const careerForm = reactive({
  company: '',
  role: '',
  startDate: '',
  endDate: '',
  file: null,
})
const careerFileError = ref('')
const canAddCareer = computed(() =>
  Boolean(careerForm.company && careerForm.role && careerForm.startDate && careerForm.file),
)

watch(showAddCareer, (val) => {
  if (!val) {
    careerFileError.value = ''
  }
})

const triggerCareerFileInput = () => careerFileInputRef.value?.click()

const handleCareerFileSelect = (e) => {
  const file = e.target.files?.[0] || null
  if (!file) {
    careerForm.file = null
    return
  }
  if (!isAllowedEvidenceFile(file)) {
    careerForm.file = null
    careerFileError.value = 'PNG/JPG/JPEG/WEBP/PDF 파일만 업로드할 수 있습니다.'
    e.target.value = ''
    return
  }
  careerForm.file = file
  careerFileError.value = ''
}

const addCareer = async () => {
  if (isSubmitting.value) return
  if (!careerForm.company || !careerForm.role || !careerForm.startDate) return
  if (!careerForm.file) {
    careerFileError.value = '증빙 파일을 첨부해야 등록할 수 있습니다.'
    return
  }

  try {
    isSubmitting.value = true
    await createCareer({
      companyName: careerForm.company,
      orgName: careerForm.role,
      startDate: careerForm.startDate,
      endDate: careerForm.endDate || null,
      file: careerForm.file,
    })

    Object.assign(careerForm, {
      company: '',
      role: '',
      startDate: '',
      endDate: '',
      file: null,
    })
    careerFileError.value = ''
    showAddCareer.value = false
    refresh()
  } catch (error) {
    alert(error?.response?.data?.error?.message || '경력사항 등록에 실패했습니다.')
  } finally {
    isSubmitting.value = false
  }
}

const viewCareerFile = async (career) => {
  if (!career?.careerId) return
  try {
    const response = await getCareerEvidence(career.careerId)
    if (response?.fileUrl) {
      window.open(response.fileUrl, '_blank', 'noopener,noreferrer')
    }
  } catch (error) {
    alert(error?.response?.data?.error?.message || '증빙 파일 조회에 실패했습니다.')
  }
}

const deleteCareer = async (index) => {
  if (isSubmitting.value) return
  const current = Array.isArray(props.user.careers) ? props.user.careers : []
  const target = current[index]
  if (!target?.careerId) return
  if (!window.confirm('해당 경력사항을 삭제하시겠습니까?')) return

  try {
    isSubmitting.value = true
    await deleteCareerApi(target.careerId)
    refresh()
  } catch (error) {
    alert(error?.response?.data?.error?.message || '경력사항 삭제에 실패했습니다.')
  } finally {
    isSubmitting.value = false
  }
}

// ── 비밀번호 변경 ──
const showChangePw = ref(false)
const pwSuccess = ref(false)
const pwForm = reactive({ current: '', newPw: '', confirm: '' })
const pwErrors = reactive({ current: '', confirm: '' })

watch(showChangePw, (val) => {
  if (val) {
    Object.assign(pwForm, { current: '', newPw: '', confirm: '' })
    Object.assign(pwErrors, { current: '', confirm: '' })
    pwSuccess.value = false
  }
})

const pwRules = computed(() => {
  const pw = pwForm.newPw || ''
  return [
    { label: '8~20자', pass: pw.length >= 8 && pw.length <= 20 },
    { label: '영문 대문자', pass: /[A-Z]/.test(pw) },
    { label: '영문 소문자', pass: /[a-z]/.test(pw) },
    { label: '숫자', pass: /[0-9]/.test(pw) },
    { label: '특수문자', pass: /[!@#$%^&*()\-_=+\[\]{}?]/.test(pw) },
  ]
})

const allPwRulesPass = computed(() => pwRules.value.every((r) => r.pass))
const canChangePw = computed(() => allPwRulesPass.value && pwForm.newPw && pwForm.newPw === pwForm.confirm)

const validateNewPw = () => { pwErrors.confirm = '' }
const validateConfirmPw = () => {
  pwErrors.confirm = pwForm.confirm && pwForm.newPw !== pwForm.confirm ? '새 비밀번호가 일치하지 않습니다.' : ''
}

const changePassword = async () => {
  if (isSubmitting.value) return
  pwErrors.current = ''
  if (!canChangePw.value) return

  try {
    isSubmitting.value = true
    await changeMyPassword({
      currentPassword: pwForm.current,
      newPassword: pwForm.newPw,
      confirmPassword: pwForm.confirm,
    })
    pwSuccess.value = true
    setTimeout(() => { showChangePw.value = false }, 1200)
  } catch (error) {
    const message = error?.response?.data?.error?.message || '비밀번호 변경에 실패했습니다.'
    if (message.includes('현재 비밀번호')) {
      pwErrors.current = message
    } else if (message.includes('일치')) {
      pwErrors.confirm = message
    } else {
      alert(message)
    }
  } finally {
    isSubmitting.value = false
  }
}

const closePwModal = () => { showChangePw.value = false }
</script>

<style scoped>
.tab-info{margin-top:20px}
.info-grid{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:16px;align-items:stretch}

/* Info Card */
.info-card{background:var(--glass);backdrop-filter:blur(12px);border:1px solid var(--glass-border);border-radius:var(--radius);box-shadow:var(--shadow);overflow:hidden;min-height:0}
.info-card-header{display:flex;justify-content:space-between;align-items:center;padding:16px 20px;border-bottom:1px solid var(--gray100)}
.info-card-header h3{font-size:.95rem;font-weight:700;color:var(--gray800)}

.btn-edit-sm{display:flex;align-items:center;gap:5px;padding:6px 14px;border:1px solid var(--primary);border-radius:var(--radius-xs);background:var(--accent);color:var(--primary);font-size:.78rem;font-weight:600;cursor:pointer;transition:all .15s;font-family:var(--font)}
.btn-edit-sm:hover{background:var(--primary);color:#fff}
.btn-add{padding:6px 14px;border:1px solid var(--primary);border-radius:var(--radius-xs);background:var(--primary);color:#fff;font-size:.78rem;font-weight:600;cursor:pointer;font-family:var(--font)}
.btn-add:hover{background:var(--primary-dark)}

/* Info Rows */
.info-rows{padding:8px 20px}
.info-row{display:flex;align-items:center;padding:11px 0;border-bottom:1px solid var(--gray100)}
.info-row:last-child{border-bottom:none}
.info-row-ghost{visibility:hidden}
.info-label{flex:0 0 90px;font-size:.82rem;color:var(--gray500);font-weight:500}
.info-value{font-size:.85rem;color:var(--gray700)}
.info-value.bold,.bold{font-weight:600}
.font-num{font-family:var(--font-num)}
.link{color:var(--primary);font-weight:600;cursor:pointer;text-decoration:underline}
.link:hover{color:var(--primary-dark)}

/* Skill Table */
.skill-table{width:100%;border-collapse:collapse;font-size:.82rem}
.skill-table th{text-align:center;padding:10px 20px;font-weight:600;color:var(--gray500);border-bottom:1px solid var(--gray200);font-size:.78rem}
.skill-table td{padding:10px 20px;border-bottom:1px solid var(--gray100);color:var(--gray700);text-align:center}
.skill-table tr:last-child td{border-bottom:none}
.skill-table-wrap{height:320px;overflow:auto;min-height:0}
.skill-table thead th{position:sticky;top:0;background:#fff;z-index:1}
.status-tag{padding:2px 10px;border-radius:12px;font-size:.72rem;font-weight:600}
.status-tag.valid{background:#ECFDF5;color:#059669}
.status-tag.expired{background:#FEF2F2;color:#DC2626}
.link-btn{
  border:none;
  background:transparent;
  color:var(--primary);
  font-size:.8rem;
  font-weight:600;
  cursor:pointer;
  padding:0;
}
.link-btn:hover{text-decoration:underline}
.link-btn.danger{color:#DC2626}
.link-btn:disabled{opacity:.5;cursor:not-allowed;text-decoration:none}
.muted{font-size:.78rem;color:var(--gray400)}

/* Career Table */
.career-table{width:100%;border-collapse:collapse;font-size:.82rem}
.career-table th{text-align:center;padding:10px 20px;font-weight:600;color:var(--gray500);border-bottom:1px solid var(--gray200);font-size:.78rem}
.career-table td{padding:10px 20px;border-bottom:1px solid var(--gray100);color:var(--gray700);text-align:center}
.career-table tr:last-child td{border-bottom:none}
.career-table-wrap{height:320px;overflow:auto;min-height:0}
.career-table thead th{position:sticky;top:0;background:#fff;z-index:1}
.empty-row{text-align:center;color:var(--gray400)}

/* Modal shared */
.modal-title{font-size:1.15rem;font-weight:700;color:var(--gray800);margin-bottom:20px}
.modal-title-row{display:flex;justify-content:space-between;align-items:center;margin-bottom:20px}
.modal-title-row .modal-title{margin-bottom:0}
.modal-close{font-size:1.5rem;color:var(--gray400);cursor:pointer;line-height:1}
.modal-close:hover{color:var(--gray600)}
.modal-fields{display:flex;flex-direction:column;gap:16px}
.modal-field{display:flex;flex-direction:column;gap:5px}
.modal-field label{font-size:.82rem;font-weight:600;color:var(--gray600)}
.required-mark{color:#0EA5E9;font-size:.78rem;font-weight:700}
.modal-field input,.modal-field select{padding:10px 14px;border:1px solid var(--gray200);border-radius:var(--radius-xs);font-size:.85rem;font-family:var(--font);color:var(--gray700);outline:none;transition:all .2s}
.modal-field input:focus,.modal-field select:focus{border-color:var(--primary);box-shadow:0 0 0 3px var(--accent)}
.modal-field input:disabled{background:var(--gray50);color:var(--gray400)}
.modal-field input.input-error{border-color:#EF4444;box-shadow:0 0 0 3px #FEF2F2}
.modal-field select{appearance:none;background:url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%2394A3B8' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E") no-repeat right 14px center,#fff}
.modal-field-row{display:flex;gap:12px}.modal-field-row .modal-field{flex:1}
.profile-image-row{display:flex;align-items:center;gap:12px}
.profile-image-preview{
  width:56px;height:56px;border-radius:50%;
  background:linear-gradient(135deg,#99F6E4,#0891B2);
  display:flex;align-items:center;justify-content:center;
  overflow:hidden;flex-shrink:0
}
.profile-image-preview img{width:100%;height:100%;object-fit:cover}
.profile-image-preview span{color:#fff;font-weight:700}
.btn-upload{
  height:34px;padding:0 12px;border-radius:8px;border:1px solid var(--gray200);
  background:#fff;color:var(--gray600);font-size:.8rem;font-weight:600;cursor:pointer
}
.btn-upload:hover{border-color:var(--primary);color:var(--primary)}
.field-error{font-size:.75rem;color:#EF4444}
.file-upload{display:flex;align-items:center;justify-content:center;gap:8px;padding:14px;border:1.5px dashed var(--gray300);border-radius:var(--radius-xs);color:var(--gray400);font-size:.82rem;cursor:pointer;transition:all .15s}
.file-upload:hover{border-color:var(--primary);color:var(--primary);background:var(--accent)}
.modal-actions{display:flex;gap:10px;justify-content:flex-end;margin-top:24px}
.btn-confirm,.btn-cancel{padding:10px 28px;border-radius:var(--radius-xs);font-size:.88rem;font-weight:600;font-family:var(--font);border:none;cursor:pointer;transition:all .15s}
.btn-confirm{background:var(--primary);color:#fff}
.btn-confirm:hover:not(:disabled){background:var(--primary-dark)}
.btn-confirm:disabled{opacity:.5;cursor:not-allowed}
.btn-cancel{background:#fff;color:var(--gray600);border:1px solid var(--gray200)}
.btn-cancel:hover{background:var(--gray50)}

/* PW rules */
.pw-rules{display:flex;flex-wrap:wrap;gap:4px 14px;margin-top:6px}
.pw-rule{display:flex;align-items:center;gap:4px;font-size:.72rem;color:var(--gray400)}.pw-rule.pass{color:#16A34A}
.success-box{padding:10px 14px;background:#F0FDF4;border:1px solid #BBF7D0;border-radius:var(--radius-xs);font-size:.82rem;color:#16A34A}

@media (max-width: 1200px) {
  .info-grid { grid-template-columns: minmax(0, 1fr); }
}
</style>
