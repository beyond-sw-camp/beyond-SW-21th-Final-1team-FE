<template>
  <section class="admin-page">
    <div class="layout">
      <article class="card form-card">
        <div class="page-head">
          <h3>신규 사원 등록</h3>
          <p>필수 정보 입력 후 계정을 생성하세요.</p>
        </div>

        <section class="form-section">
          <p class="section-title">기본 정보 (필수)</p>
          <div class="form-grid">
          <label>
            이름
            <input v-model.trim="form.employeeName" type="text" placeholder="예: 김봉식" />
          </label>
          <label>
            이메일
            <input v-model.trim="form.email" type="email" placeholder="example@rhight.co.kr" />
          </label>
          <label>
            연락처
            <input v-model.trim="form.phone" type="text" placeholder="01012345678" />
          </label>
          <label>
            내선번호
            <input v-model.trim="form.extensionNum" type="text" placeholder="예: 1042" />
          </label>
          <label>
            생년월일
            <input v-model="form.birthDate" type="date" />
          </label>
          <label class="span-2">
            주소
            <input v-model.trim="form.address" type="text" placeholder="예: 서울 강남구 테헤란로 427" />
          </label>
          <label>
            주민등록번호
            <input
              :value="form.residentNumber"
              type="text"
              inputmode="numeric"
              placeholder="예: 9503281234567"
              @input="form.residentNumber = onlyDigits($event.target.value)"
            />
          </label>
          <label>
            은행명
            <input v-model.trim="form.bankName" type="text" placeholder="예: 신한은행" />
          </label>
          <label class="span-2">
            계좌번호
            <input
              :value="form.accountNumber"
              type="text"
              inputmode="numeric"
              placeholder="예: 1101234567890"
              @input="form.accountNumber = onlyDigits($event.target.value)"
            />
          </label>
          </div>
        </section>

        <section class="form-section">
          <p class="section-title">인사 정보 (필수)</p>
          <div class="form-grid">
          <label>
            직책
            <select v-model="form.positionId">
              <option value="">선택</option>
              <option v-for="item in positionOptions" :key="item.id" :value="item.id">{{ item.name }}</option>
            </select>
          </label>
          <label>
            직무
            <select v-model="form.jobId">
              <option value="">선택</option>
              <option v-for="item in jobOptions" :key="item.id" :value="item.id">{{ item.name }}</option>
            </select>
          </label>
          <label>
            소속 팀
            <select v-model="form.orgId">
              <option value="">선택</option>
              <option v-for="item in organizationOptions" :key="item.id" :value="item.id">{{ item.name }}</option>
            </select>
          </label>
          <label>
            직급
            <select v-model="form.rankId">
              <option value="">선택</option>
              <option v-for="item in rankOptions" :key="item.id" :value="item.id">{{ item.name }}</option>
            </select>
          </label>
          <label>
            재직 상태
            <select v-model="form.employeeState">
              <option value="">선택</option>
              <option v-for="item in EMPLOYEE_STATE_OPTIONS" :key="item.value" :value="item.value">{{ item.label }}</option>
            </select>
          </label>
          <label>
            입사일
            <input v-model="form.hireDate" type="date" />
          </label>
          <label>
            근무 형태
            <select v-model="form.employType">
              <option value="">선택</option>
              <option v-for="item in EMPLOY_TYPE_OPTIONS" :key="item.value" :value="item.value">{{ item.label }}</option>
            </select>
          </label>
          <label>
            근무 지역
            <select v-model="form.areaId">
              <option value="">선택</option>
              <option v-for="item in areaOptions" :key="item.id" :value="item.id">{{ item.name }}</option>
            </select>
          </label>
          <label>
            입사 유형
            <select v-model="form.recruitType">
              <option value="">선택</option>
              <option v-for="item in RECRUIT_TYPE_OPTIONS" :key="item.value" :value="item.value">{{ item.label }}</option>
            </select>
          </label>
          </div>
        </section>

        <section class="form-section">
          <p class="section-title">계정/권한 정보</p>
          <div class="form-grid">
          <label>
            사번 (자동 생성)
            <input :value="createdEmployeeNum || ''" type="text" placeholder="등록 시 자동 생성" readonly />
          </label>
          <div class="role-picker">
            <p>권한 설정 (복수 선택 가능, 피평가자 권한은 자동 부여)</p>
            <div class="role-grid">
              <label v-for="item in selectableRoles" :key="item.roleId" class="role-option">
                <input v-model="form.roleIds" type="checkbox" :value="item.roleId" />
                <span>{{ item.roleName }}</span>
              </label>
            </div>
          </div>
          </div>
        </section>
        <ul class="role-hints">
          <li v-for="desc in selectedRoleDescriptions" :key="desc">{{ desc }}</li>
        </ul>

        <div class="create-wrap">
          <button class="btn-primary" type="button" :disabled="isSubmitting || !canCreateAccount" @click="createAccount">
            {{ isSubmitting ? '생성 중...' : '계정 생성' }}
          </button>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { createAdminEmployee, getAdminEmployeeOptions } from '@/api/hr'

const EMPLOYEE_STATE_OPTIONS = [
  { value: 'WORK', label: '재직' },
  { value: 'LEAVE', label: '휴직' },
  { value: 'RESIGN', label: '사직' },
]

const EMPLOY_TYPE_OPTIONS = [
  { value: 'REGULAR', label: '정규직' },
  { value: 'NON_REGULAR', label: '비정규직' },
  { value: 'CONTRACT', label: '계약직' },
]

const RECRUIT_TYPE_OPTIONS = [
  { value: 'NEW', label: '신입' },
  { value: 'EXPERIENCED', label: '경력' },
]

const form = reactive({
  employeeName: '',
  email: '',
  phone: '',
  extensionNum: '',
  birthDate: '',
  address: '',
  residentNumber: '',
  bankName: '',
  accountNumber: '',
  orgId: '',
  jobId: '',
  positionId: '',
  rankId: '',
  employeeState: '',
  employType: '',
  recruitType: '',
  areaId: '',
  hireDate: '',
  roleIds: [],
})

const positionOptions = ref([])
const jobOptions = ref([])
const organizationOptions = ref([])
const rankOptions = ref([])
const areaOptions = ref([])
const roleOptions = ref([])

const isSubmitting = ref(false)
const createdEmployeeNum = ref('')

const selectableRoles = computed(() => roleOptions.value.filter((role) => role.roleCode !== 'EVALUATEE'))

const requiredValues = computed(() => [
  form.employeeName,
  form.email,
  form.phone,
  form.extensionNum,
  form.birthDate,
  form.address,
  form.residentNumber,
  form.bankName,
  form.accountNumber,
  form.orgId,
  form.jobId,
  form.positionId,
  form.rankId,
  form.employeeState,
  form.employType,
  form.recruitType,
  form.areaId,
  form.hireDate,
])

const selectedRoleDescriptions = computed(() => {
  const selected = selectableRoles.value.filter((role) => form.roleIds.includes(role.roleId))
  if (!selected.length) {
    return ['피평가자 권한은 자동 부여됩니다.']
  }
  return selected.map((role) => `${role.roleName}: ${role.description || role.roleCode}`)
})

const canCreateAccount = computed(() => requiredValues.value.every((value) => String(value).trim().length > 0))

const onlyDigits = (value) => String(value || '').replace(/\D/g, '')

const normalizeDate = (value) => {
  if (!value) return '-'
  return String(value).replaceAll('-', '.')
}

const loadOptions = async () => {
  const data = await getAdminEmployeeOptions()
  organizationOptions.value = Array.isArray(data?.organizations) ? data.organizations : []
  jobOptions.value = Array.isArray(data?.jobs) ? data.jobs : []
  positionOptions.value = Array.isArray(data?.positions) ? data.positions : []
  rankOptions.value = Array.isArray(data?.ranks) ? data.ranks : []
  areaOptions.value = Array.isArray(data?.workingAreas) ? data.workingAreas : []
  roleOptions.value = Array.isArray(data?.roles) ? data.roles : []
}

const resetForm = () => {
  form.employeeName = ''
  form.email = ''
  form.phone = ''
  form.extensionNum = ''
  form.birthDate = ''
  form.address = ''
  form.residentNumber = ''
  form.bankName = ''
  form.accountNumber = ''
  form.orgId = ''
  form.jobId = ''
  form.positionId = ''
  form.rankId = ''
  form.employeeState = ''
  form.employType = ''
  form.recruitType = ''
  form.areaId = ''
  form.hireDate = ''
  form.roleIds = []
}

const createAccount = async () => {
  if (isSubmitting.value || !canCreateAccount.value) return

  isSubmitting.value = true
  try {
    const payload = {
      employeeName: form.employeeName,
      email: form.email,
      phone: form.phone,
      extensionNum: form.extensionNum,
      birthDate: form.birthDate,
      address: form.address,
      residentNumber: form.residentNumber,
      bankName: form.bankName,
      accountNumber: form.accountNumber,
      orgId: Number(form.orgId),
      jobId: Number(form.jobId),
      positionId: Number(form.positionId),
      rankId: Number(form.rankId),
      employeeState: form.employeeState,
      employType: form.employType,
      recruitType: form.recruitType,
      areaId: Number(form.areaId),
      hireDate: form.hireDate,
      roleIds: form.roleIds.map((id) => Number(id)),
    }

    const created = await createAdminEmployee(payload)
    createdEmployeeNum.value = created?.employeeNum || ''

    resetForm()
    alert('사원 계정이 생성되었습니다.')
  } catch (error) {
    alert(error?.response?.data?.error?.message || '사원 등록에 실패했습니다.')
  } finally {
    isSubmitting.value = false
  }
}

onMounted(async () => {
  try {
    await loadOptions()
  } catch (error) {
    alert(error?.response?.data?.error?.message || '사원 등록 옵션 조회에 실패했습니다.')
  }
})
</script>

<style scoped>
.admin-page { width: 100%; max-width: none; min-width: 0; }
.layout { margin-top: 12px; display: grid; grid-template-columns: minmax(0, 1fr); gap: 12px; }
.card {
  background: linear-gradient(180deg, #fff 0%, #fbfcfe 100%);
  border: 1px solid #dbe3ef;
  border-radius: 14px;
  box-shadow: 0 12px 30px rgba(31, 41, 55, 0.05);
  padding: 20px;
}
.page-head h3 { margin: 0; color: #1f2937; font-size: 1.45rem; }
.page-head p { margin: 6px 0 0; color: #64748b; font-size: .85rem; }
.form-section {
  margin-top: 14px;
  border: 1px solid #e8eef7;
  border-radius: 12px;
  background: #fff;
  padding: 14px;
}
.section-title {
  margin: 0 0 10px;
  font-size: .85rem;
  color: #334155;
  font-weight: 700;
}
.form-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; margin-bottom: 2px; }
label { display: grid; gap: 6px; font-size: .8rem; color: #475569; }
input,
select {
  height: 38px;
  border: 1px solid #d8e1ee;
  border-radius: 10px;
  padding: 0 12px;
  color: #334155;
  background: #fff;
  transition: border-color .15s ease, box-shadow .15s ease;
}
input:focus,
select:focus {
  outline: none;
  border-color: #12a8d6;
  box-shadow: 0 0 0 3px rgba(18, 168, 214, 0.12);
}
input[readonly] {
  background: #f7f9fc;
  color: #64748b;
}
.span-2 { grid-column: span 2; }
.role-picker p {
  margin: 0 0 8px;
  color: #475569;
  font-size: .8rem;
  font-weight: 600;
}
.role-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}
.role-option {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: 1px solid #d8e1ee;
  border-radius: 10px;
  padding: 8px 10px;
  background: #fff;
  color: #334155;
  font-size: .8rem;
}
.role-option input {
  width: 14px;
  height: 14px;
}
.role-hints {
  margin: 8px 0 0;
  padding-left: 18px;
  color: #64748b;
  font-size: .78rem;
}
.role-hints li { margin-bottom: 4px; }
.create-wrap {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}
.btn-primary {
  height: 40px;
  border: none;
  border-radius: 10px;
  background: linear-gradient(90deg, #0891b2 0%, #06b6d4 100%);
  color: #fff;
  padding: 0 18px;
  font-weight: 700;
}
.btn-primary:disabled {
  opacity: .45;
  cursor: default;
}
@media (max-width: 1100px) {
  .form-grid { grid-template-columns: minmax(0, 1fr); }
  .span-2 { grid-column: span 1; }
  .role-grid { grid-template-columns: minmax(0, 1fr); }
}
</style>
