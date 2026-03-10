<template>
  <section class="admin-page">
    <div class="layout">
      <article class="card form-card">
        <h3>신규 사원 등록</h3>

        <p class="section-title">기본 정보 (필수)</p>
        <div class="form-grid">
          <label>
            이름
            <input v-model.trim="form.name" type="text" placeholder="예: 김봉식" />
          </label>
          <label>
            이메일
            <input v-model.trim="form.email" type="email" placeholder="example@rhight.co.kr" />
          </label>
          <label>
            연락처
            <input v-model.trim="form.phone" type="text" placeholder="010-0000-0000" />
          </label>
          <label>
            내선번호
            <input v-model.trim="form.extension" type="text" placeholder="예: 1042" />
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
            <input v-model.trim="form.rrn" type="text" placeholder="예: 950328-1******" />
          </label>
          <label>
            계좌번호
            <input v-model.trim="form.accountNumber" type="text" placeholder="예: 신한 110-***-***890" />
          </label>
        </div>

        <p class="section-title">인사 정보 (필수)</p>
        <div class="form-grid">
          <label>
            직책
            <select v-model="form.position">
              <option value="">선택</option>
              <option v-for="item in positionOptions" :key="item" :value="item">{{ item }}</option>
            </select>
          </label>
          <label>
            직무
            <select v-model="form.job">
              <option value="">선택</option>
              <option v-for="item in jobOptions" :key="item" :value="item">{{ item }}</option>
            </select>
          </label>
          <label>
            소속 팀
            <select v-model="form.team">
              <option value="">선택</option>
              <option v-for="item in teamOptions" :key="item" :value="item">{{ item }}</option>
            </select>
          </label>
          <label>
            직급
            <select v-model="form.grade">
              <option value="">선택</option>
              <option v-for="item in gradeOptions" :key="item" :value="item">{{ item }}</option>
            </select>
          </label>
          <label>
            재직 상태
            <select v-model="form.employmentStatus">
              <option value="">선택</option>
              <option value="재직">재직</option>
              <option value="휴직">휴직</option>
              <option value="퇴사">퇴사</option>
            </select>
          </label>
          <label>
            입사일
            <input v-model="form.hireDate" type="date" />
          </label>
          <label>
            근무 형태
            <select v-model="form.workType">
              <option value="">선택</option>
              <option value="정규직">정규직</option>
              <option value="계약직">계약직</option>
              <option value="인턴">인턴</option>
            </select>
          </label>
          <label>
            근무 지역
            <input v-model.trim="form.workLocation" type="text" placeholder="예: 서울 강남" />
          </label>
          <label>
            입사 유형
            <select v-model="form.hireType">
              <option value="">선택</option>
              <option value="신입">신입</option>
              <option value="경력">경력</option>
            </select>
          </label>
        </div>

        <p class="section-title">계정/권한 정보</p>
        <div class="form-grid">
          <label>
            사번 (자동 생성)
            <input :value="generatedEmployeeId" type="text" placeholder="입사일 선택 시 자동 생성" readonly />
          </label>
          <div class="role-picker">
            <p>권한 설정 (복수 선택 가능, 미선택 시 기본 권한)</p>
            <div class="role-grid">
              <label v-for="item in roleOptions" :key="item.value" class="role-option">
                <input v-model="form.roles" type="checkbox" :value="item.value" />
                <span>{{ item.label }}</span>
              </label>
            </div>
          </div>
        </div>
        <ul class="role-hints">
          <li v-for="desc in selectedRoleDescriptions" :key="desc">{{ desc }}</li>
        </ul>

        <div class="create-wrap">
          <button class="btn-primary" type="button" :disabled="!canCreateAccount" @click="createAccount">
            계정 생성
          </button>
        </div>
      </article>

      <article class="card">
        <h3>최근 등록 리스트</h3>
        <div class="recent-head">
          <span>이름</span>
          <span>팀</span>
          <span>입사일</span>
        </div>
        <ul class="list" v-if="recentRequests.length > 0">
          <li v-for="item in recentRequests" :key="item.id">
            <span>{{ item.name }}</span>
            <span>{{ item.team }}</span>
            <span class="font-num">{{ item.hireDate }}</span>
          </li>
        </ul>
        <p v-else class="empty">최근 등록 내역이 없습니다.</p>
      </article>
    </div>
  </section>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'

const form = reactive({
  name: '',
  email: '',
  phone: '',
  extension: '',
  birthDate: '',
  address: '',
  rrn: '',
  accountNumber: '',
  position: '',
  job: '',
  team: '',
  grade: '',
  employmentStatus: '',
  hireDate: '',
  workType: '',
  workLocation: '',
  hireType: '',
  roles: []
})

const positionOptions = ['팀원', '선임', '파트장', '팀장', '실장', '본부장']
const jobOptions = ['백엔드 개발', '프론트엔드 개발', '모바일 개발', '디자인', '기획', '인사 운영']
const gradeOptions = ['인턴', '사원', '주임', '대리', '과장', '차장', '부장']
const teamOptions = [
  '모바일1팀',
  '개발1팀',
  '개발2팀',
  '디자인팀',
  'QA팀',
  '인사팀',
  '영업1팀',
  '영업2팀'
]
const roleOptions = [
  { value: 'EVALUATEE', label: '피평가자' },
  { value: 'EVALUATOR', label: '평가자' },
  { value: 'HR_BASIC', label: '인사관리자-기본' },
  { value: 'HR_PAYROLL', label: '인사관리자-급여' },
  { value: 'HR_POLICY', label: '인사관리자-정책' },
  { value: 'HR_SUPER', label: '인사관리자-총괄' }
]

const hireDateCounters = reactive({
  '2024-02-04': 1
})

const recentRequests = ref([
  { id: 'req-1', name: '김유나', team: '디자인팀', hireDate: '2026-03-05' },
  { id: 'req-2', name: '박서진', team: '모바일1팀', hireDate: '2026-03-04' },
  { id: 'req-3', name: '최민규', team: '인사팀', hireDate: '2026-03-03' }
])

const requiredValues = computed(() => [
  form.name,
  form.email,
  form.phone,
  form.extension,
  form.birthDate,
  form.address,
  form.rrn,
  form.accountNumber,
  form.position,
  form.job,
  form.team,
  form.grade,
  form.employmentStatus,
  form.hireDate,
  form.workType,
  form.workLocation,
  form.hireType
])

const toEmployeeId = (dateText, sequence) => {
  if (!dateText) return ''
  const compactDate = dateText.replaceAll('-', '')
  const yyMMdd = compactDate.slice(2)
  const seqText = String(sequence).padStart(4, '0')
  return `${yyMMdd}${seqText}`
}

const generatedEmployeeId = computed(() => {
  if (!form.hireDate) return ''
  const nextSequence = (hireDateCounters[form.hireDate] || 0) + 1
  return toEmployeeId(form.hireDate, nextSequence)
})

const selectedRoleDescriptions = computed(() => {
  const selectedRoles = form.roles.length > 0 ? form.roles : ['EVALUATOR']
  const map = {
    EVALUATEE: '피평가자: 평가 대상자로서 기본 사용 기능이 제공됩니다.',
    EVALUATOR: '기본 권한(평가자): 내 정보 수정 + 팀원 기본 정보/근태/성과(민감정보 제외) 조회',
    HR_BASIC: '인사관리자-기본: 전 직원 기본정보(민감정보 제외) 조회 + 사원 등록 + 인사 변경',
    HR_PAYROLL: '인사관리자-급여: 전 직원 근태/성과/급여/민감정보 조회',
    HR_POLICY: '인사관리자-정책: 기본 권한 + 인사 정책/공지사항 등록·수정·삭제',
    HR_SUPER: '인사관리자-총괄: 모든 인사 권한'
  }
  return selectedRoles.map((role) => map[role]).filter(Boolean)
})

const canCreateAccount = computed(() => {
  const allRequiredFilled = requiredValues.value.every((value) => String(value).trim().length > 0)
  return allRequiredFilled && generatedEmployeeId.value.length > 0
})

const resetForm = () => {
  form.name = ''
  form.email = ''
  form.phone = ''
  form.extension = ''
  form.birthDate = ''
  form.address = ''
  form.rrn = ''
  form.accountNumber = ''
  form.position = ''
  form.job = ''
  form.team = ''
  form.grade = ''
  form.employmentStatus = ''
  form.hireDate = ''
  form.workType = ''
  form.workLocation = ''
  form.hireType = ''
  form.roles = []
}

const createAccount = () => {
  if (!canCreateAccount.value) return

  const employeeId = generatedEmployeeId.value
  hireDateCounters[form.hireDate] = (hireDateCounters[form.hireDate] || 0) + 1

  recentRequests.value.unshift({
    id: `req-${Date.now()}`,
    name: form.name,
    team: form.team || '미지정',
    hireDate: form.hireDate
  })

  resetForm()
}
</script>

<style scoped>
.admin-page { width: 100%; max-width: none; min-width: 0; }
.layout { margin-top: 12px; display: grid; grid-template-columns: 1.2fr .8fr; gap: 12px; }
.card { background: #fff; border: 1px solid var(--gray200); border-radius: var(--radius); box-shadow: var(--shadow); padding: 16px; }
.card h3 { margin: 0 0 12px; color: var(--gray800); }
.section-title {
  margin: 16px 0 10px;
  font-size: .85rem;
  color: var(--gray600);
  font-weight: 700;
}
.form-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; margin-bottom: 2px; }
label { display: grid; gap: 6px; font-size: .8rem; color: var(--gray600); }
input,
select {
  height: 36px;
  border: 1px solid var(--gray200);
  border-radius: 8px;
  padding: 0 10px;
  color: var(--gray700);
  background: #fff;
}
input[readonly] {
  background: var(--gray50);
  color: var(--gray500);
}
.span-2 { grid-column: span 2; }
.role-picker p {
  margin: 0 0 8px;
  color: var(--gray600);
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
  border: 1px solid var(--gray200);
  border-radius: 8px;
  padding: 8px 10px;
  background: #fff;
  color: var(--gray700);
  font-size: .8rem;
}
.role-option input {
  width: 14px;
  height: 14px;
}
.role-hints {
  margin: 8px 0 0;
  padding-left: 18px;
  color: var(--gray500);
  font-size: .78rem;
}
.role-hints li { margin-bottom: 4px; }
.create-wrap {
  margin-top: 14px;
  display: flex;
  justify-content: center;
}
.btn-primary {
  height: 38px;
  border: none;
  border-radius: 8px;
  background: var(--primary);
  color: #fff;
  padding: 0 16px;
  font-weight: 700;
}
.btn-primary:disabled {
  opacity: .45;
  cursor: default;
}
.list {
  margin: 0;
  padding: 0;
  list-style: none;
}
.recent-head {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) 110px;
  gap: 8px;
  padding: 0 0 8px;
  border-bottom: 1px solid var(--gray200);
  color: var(--gray500);
  font-size: .78rem;
  font-weight: 700;
}
.list li {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) 110px;
  gap: 8px;
  padding: 9px 0;
  border-bottom: 1px solid var(--gray100);
  color: var(--gray600);
  font-size: .86rem;
}
.list li span:last-child { color: var(--gray500); text-align: right; }
.empty {
  margin: 0;
  color: var(--gray400);
  font-size: .86rem;
}
@media (max-width: 1100px) {
  .layout { grid-template-columns: minmax(0, 1fr); }
  .form-grid { grid-template-columns: minmax(0, 1fr); }
  .span-2 { grid-column: span 1; }
  .role-grid { grid-template-columns: minmax(0, 1fr); }
}
</style>
