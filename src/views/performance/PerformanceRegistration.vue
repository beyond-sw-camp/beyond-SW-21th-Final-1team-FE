<template>
  <!-- ═══ STEP 1: 유형 선택 ═══ -->
  <div v-if="step === 'selection'" class="reg-selection">
    <div class="reg-selection-inner">
      <h2 class="reg-title">등록하실 성과 유형을 선택해주세요</h2>
      <p class="reg-subtitle">팀 성과 또는 개인 성과를 선택하여 등록할 수 있습니다.</p>

      <div class="type-cards">
        <button class="type-card" @click="step = 'individual-form'">
          <div class="type-icon green">
            <User :size="28" />
          </div>
          <h3 class="type-name">개인 성과 등록</h3>
          <p class="type-desc">개인 역량 발전 및 성과 창출을 위한<br />활동을 기록합니다.</p>
          <span class="type-arrow">
            <ArrowRight :size="16" />
          </span>
        </button>

        <button class="type-card" @click="step = 'team-form'">
          <div class="type-icon blue">
            <Users :size="28" />
          </div>
          <h3 class="type-name">팀 성과 등록</h3>
          <p class="type-desc">팀 목표 달성을 위한 업무 내역을<br />등록하고 관리합니다.</p>
          <span class="type-arrow">
            <ArrowRight :size="16" />
          </span>
        </button>
      </div>
    </div>
  </div>

  <!-- ═══ STEP 2: 입력 폼 ═══ -->
  <div v-else class="reg-form-wrap">
    <div class="reg-form-card">
      <!-- 헤더 -->
      <div class="form-header">
        <button class="back-btn" @click="step = 'selection'">
          <ArrowLeft :size="18" />
        </button>
        <div>
          <h2 class="form-title">{{ step === 'team-form' ? '팀 성과 등록' : '개인 성과 등록' }}</h2>
          <p class="form-subtitle">{{ step === 'team-form' ? '팀 업무 성과를 등록합니다.' : '개인 성과 활동을 기록합니다.' }}</p>
        </div>
        <div class="form-type-badge" :class="step === 'team-form' ? 'blue' : 'green'">
          {{ step === 'team-form' ? '팀' : '개인' }}
        </div>
      </div>

      <!-- 폼 -->
      <form class="reg-form" @submit.prevent="handleSubmit">
        <!-- 날짜 -->
        <div class="form-row two-col">
          <div class="form-group">
            <label class="form-label">
              <Calendar :size="14" /> 시작 날짜
            </label>
            <input v-model="form.startDate" type="date" class="form-input" required />
          </div>
          <div class="form-group">
            <label class="form-label">
              <Calendar :size="14" /> 종료 예상 날짜
            </label>
            <input v-model="form.endDate" type="date" class="form-input" required />
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">
            <BarChart3 :size="14" /> 난이도 점수
          </label>
          <input
            v-model="form.difficultyScore"
            type="number"
            min="1"
            max="5"
            placeholder="1 ~ 5"
            class="form-input"
            required
          />
        </div>

        <!-- 제목 -->
        <div class="form-group">
          <label class="form-label">
            <FileText :size="14" /> {{ step === 'team-form' ? '업무 항목' : '성과 항목' }}
          </label>
          <input v-model="form.title" type="text" placeholder="제목을 입력하세요" class="form-input" required />
        </div>

        <!-- 핵심 업무 항목 -->
        <div class="form-group">
          <label class="form-label">
            <FileText :size="14" /> 핵심 업무 항목
          </label>
          <input
            v-model="form.coreTask"
            type="text"
            placeholder="예: 화장품, 중식, 프론트 vue와 같은 간단한 업무 내용"
            class="form-input"
            required
          />
        </div>

        <!-- 상세 내용 -->
        <div class="form-group">
          <label class="form-label">
            <FileText :size="14" /> 상세 내용
          </label>
          <textarea v-model="form.content" rows="5" placeholder="상세 업무 내용을 입력하세요" class="form-textarea" required></textarea>
        </div>

        <!-- 예상 가치 (개인만) -->
        <div v-if="step === 'individual-form'" class="form-group">
          <label class="form-label">
            <CheckCircle2 :size="14" /> 예상 가치
          </label>
          <input v-model="form.value" type="text" placeholder="예: 품질 향상율 20%, 매출 상승 500만원 등" class="form-input" />
        </div>

        <!-- 버튼 -->
        <div class="form-actions">
          <button type="button" class="btn-cancel" @click="step = 'selection'">취소</button>
          <button type="submit" class="btn-submit">등록하기</button>
        </div>
      </form>
    </div>
  </div>

  <!-- ═══ 등록 완료 모달 ═══ -->
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
        <div class="modal-card">
          <div class="modal-icon-wrap">
            <div class="modal-icon">
              <CheckCircle2 :size="32" />
            </div>
          </div>
          <h3 class="modal-title">성과가 등록되었습니다</h3>
          <p class="modal-desc">
            {{ step === 'team-form' ? '팀 성과가' : '개인 성과가' }} 정상적으로 등록되었습니다.<br />
            대시보드에서 등록된 성과를 확인할 수 있습니다.
          </p>
          <div class="modal-info">
            <div class="modal-info-row">
              <span class="modal-info-label">항목</span>
              <span class="modal-info-value">{{ form.title || '-' }}</span>
            </div>
            <div class="modal-info-row">
              <span class="modal-info-label">핵심 업무</span>
              <span class="modal-info-value">{{ form.coreTask || '-' }}</span>
            </div>
            <div class="modal-info-row">
              <span class="modal-info-label">기간</span>
              <span class="modal-info-value">{{ form.startDate || '-' }} ~ {{ form.endDate || '-' }}</span>
            </div>
          </div>
          <div class="modal-actions">
            <button class="btn-modal-sub" @click="goToInquiry">성과 조회로 이동</button>
            <button class="btn-modal-main" @click="registerMore">추가 등록</button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { Users, User, ArrowLeft, ArrowRight, Calendar, FileText, CheckCircle2, BarChart3 } from 'lucide-vue-next'
import { registerPerformance } from '@/api/performance'
import { usePerformanceStore } from '@/store/performance'

const perfStore = usePerformanceStore()

const step = ref('selection')
const showModal = ref(false)

const form = reactive({
  startDate: '',
  endDate: '',
  difficultyScore: 5,
  title: '',
  coreTask: '',
  content: '',
  value: '',
})

async function handleSubmit(){
  if (form.startDate && form.endDate && form.endDate < form.startDate) return
  if (Number(form.difficultyScore) < 1 || Number(form.difficultyScore) > 5) return
  try {
    await registerPerformance({
      type: step.value === 'team-form' ? 'team' : 'individual',
      startDate: form.startDate,
      endDate: form.endDate,
      difficultyScore: Number(form.difficultyScore),
      title: form.title,
      coreTask: form.coreTask,
      content: form.content,
      value: form.value,
    })
    showModal.value = true
  } catch (error) {
    const message = error?.response?.data?.error?.message || '성과 등록에 실패했습니다.'
    alert(message)
  }
}
function resetForm() {
  Object.assign(form, { startDate: '', endDate: '', difficultyScore: 5, title: '', coreTask: '', content: '', value: '' })
}

function closeModal() {
  showModal.value = false
}

function goToInquiry() {
  closeModal()
  resetForm()
  step.value = 'selection'
  perfStore.setPage('inquiry')
}

function registerMore() {
  closeModal()
  resetForm()
  step.value = 'selection'
  perfStore.setPage('registration')
}
</script>

<style scoped>
/* ════════════════════════════════
   STEP 1 – 유형 선택
   ════════════════════════════════ */
.reg-selection {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 0;
  height: 100%;
}

.reg-selection-inner {
  text-align: center;
  width: 100%;
  max-width: 680px;
}

.reg-title {
  font-size: 1.4rem;
  font-weight: 800;
  color: var(--gray800);
  margin-bottom: 6px;
}

.reg-subtitle {
  font-size: 0.85rem;
  color: var(--gray400);
  margin-bottom: 36px;
}

.type-cards {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.type-card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 36px 24px 28px;
  background: #fff;
  border: 1px solid var(--gray200);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  transition: all 0.25s ease;
  text-align: center;
}

.type-card:hover {
  border-color: var(--primary);
  box-shadow: var(--shadow-lg);
  transform: translateY(-3px);
}

.type-icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  transition: transform 0.25s ease;
}

.type-card:hover .type-icon {
  transform: scale(1.08);
}

.type-icon.blue {
  background: #eff6ff;
  color: #3b82f6;
}

.type-icon.green {
  background: #f0fdf4;
  color: #22c55e;
}

.type-name {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--gray800);
  margin-bottom: 8px;
}

.type-desc {
  font-size: 0.82rem;
  color: var(--gray500);
  line-height: 1.5;
}

.type-arrow {
  position: absolute;
  top: 16px;
  right: 16px;
  color: var(--gray300);
  transition: all 0.25s ease;
}

.type-card:hover .type-arrow {
  color: var(--primary);
  transform: translateX(3px);
}

/* ════════════════════════════════
   STEP 2 – 입력 폼
   ════════════════════════════════ */
.reg-form-wrap {
  display: flex;
  justify-content: center;
  min-height: 0;
  height: 100%;
  padding: 4px 0;
}

.reg-form-card {
  background: #fff;
  border: 1px solid var(--gray200);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  width: 100%;
  max-width: 720px;
  display: flex;
  flex-direction: column;
}

/* 헤더 */
.form-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 28px;
  border-bottom: 1px solid var(--gray100);
}

.back-btn {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-xs);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--gray500);
  background: var(--gray50);
  transition: all var(--transition);
}

.back-btn:hover {
  background: var(--gray200);
  color: var(--gray700);
}

.form-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--gray800);
}

.form-subtitle {
  font-size: 0.78rem;
  color: var(--gray400);
  margin-top: 2px;
}

.form-type-badge {
  margin-left: auto;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 4px 12px;
  border-radius: 20px;
}

.form-type-badge.blue {
  background: #eff6ff;
  color: #3b82f6;
}

.form-type-badge.green {
  background: #f0fdf4;
  color: #22c55e;
}

/* 폼 */
.reg-form {
  padding: 24px 28px 28px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  flex: 1;
}

.form-row.two-col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--gray700);
}

.form-label svg {
  color: var(--gray400);
}

.form-input {
  width: 100%;
  padding: 10px 14px;
  background: var(--gray50);
  border: 1px solid var(--gray200);
  border-radius: var(--radius-xs);
  font-size: 0.88rem;
  color: var(--gray700);
  transition: all var(--transition);
}

.form-input:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px var(--accent);
  background: #fff;
}

.form-input::placeholder {
  color: var(--gray400);
}

.form-textarea {
  width: 100%;
  padding: 12px 14px;
  background: var(--gray50);
  border: 1px solid var(--gray200);
  border-radius: var(--radius-xs);
  font-size: 0.88rem;
  color: var(--gray700);
  font-family: var(--font);
  resize: none;
  transition: all var(--transition);
}

.form-textarea:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px var(--accent);
  background: #fff;
}

.form-textarea::placeholder {
  color: var(--gray400);
}

/* 버튼 */
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding-top: 12px;
  border-top: 1px solid var(--gray100);
  margin-top: auto;
}

.btn-cancel {
  padding: 10px 22px;
  border-radius: var(--radius-xs);
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--gray600);
  background: var(--gray100);
  transition: all var(--transition);
}

.btn-cancel:hover {
  background: var(--gray200);
}

.btn-submit {
  padding: 10px 28px;
  border-radius: var(--radius-xs);
  font-size: 0.88rem;
  font-weight: 700;
  color: #fff;
  background: var(--primary);
  box-shadow: 0 2px 8px rgba(8, 145, 178, 0.25);
  transition: all var(--transition);
}

.btn-submit:hover {
  background: var(--primary-dark);
  box-shadow: 0 4px 14px rgba(8, 145, 178, 0.35);
}

/* ════════════════════════════════
   모달
   ════════════════════════════════ */
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.modal-card {
  background: #fff;
  border-radius: var(--radius);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  width: 100%;
  max-width: 440px;
  padding: 36px 32px 28px;
  text-align: center;
}

.modal-icon-wrap {
  display: flex;
  justify-content: center;
  margin-bottom: 18px;
}

.modal-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: #f0fdf4;
  color: #22c55e;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-title {
  font-size: 1.15rem;
  font-weight: 800;
  color: var(--gray800);
  margin-bottom: 8px;
}

.modal-desc {
  font-size: 0.82rem;
  color: var(--gray500);
  line-height: 1.6;
  margin-bottom: 20px;
}

.modal-info {
  background: var(--gray50);
  border: 1px solid var(--gray100);
  border-radius: var(--radius-sm);
  padding: 14px 18px;
  margin-bottom: 24px;
}

.modal-info-row {
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
}

.modal-info-row + .modal-info-row {
  border-top: 1px solid var(--gray100);
}

.modal-info-label {
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--gray400);
}

.modal-info-value {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--gray700);
}

.modal-actions {
  display: flex;
  gap: 10px;
}

.btn-modal-sub {
  flex: 1;
  padding: 11px;
  border-radius: var(--radius-xs);
  font-size: 0.85rem;
  font-weight: 600;
  background: var(--gray100);
  color: var(--gray600);
  transition: all var(--transition);
}

.btn-modal-sub:hover {
  background: var(--gray200);
}

.btn-modal-main {
  flex: 1;
  padding: 11px;
  border-radius: var(--radius-xs);
  font-size: 0.85rem;
  font-weight: 700;
  background: var(--primary);
  color: #fff;
  transition: all var(--transition);
}

.btn-modal-main:hover {
  background: var(--primary-dark);
}

/* ── 모달 애니메이션 ── */
.modal-enter-active {
  transition: all 0.25s ease;
}

.modal-leave-active {
  transition: all 0.2s ease;
}

.modal-enter-from {
  opacity: 0;
}

.modal-enter-from .modal-card {
  transform: scale(0.95) translateY(10px);
  opacity: 0;
}

.modal-leave-to {
  opacity: 0;
}

.modal-leave-to .modal-card {
  transform: scale(0.97);
  opacity: 0;
}

.modal-enter-active .modal-card {
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.modal-leave-active .modal-card {
  transition: all 0.15s ease;
}
</style>
