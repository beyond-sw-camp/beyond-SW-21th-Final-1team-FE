<template>
  <div class="admin-attendance-page">
    <div class="page-header">
      <h1 class="page-title">근태 관리</h1>
    </div>

    <div class="content-container">
      <!-- 1. 표준 근로 시간 설정 -->
      <section class="policy-section">
        <h2 class="section-title">표준 근로 시간 설정</h2>
        <div class="form-row">
          <div class="form-group">
            <label>표준 출근 시간</label>
            <input type="time" v-model="policy.standardStartTime" class="time-input" />
          </div>
          <div class="form-group">
            <label>표준 퇴근 시간</label>
            <input type="time" v-model="policy.standardEndTime" class="time-input" />
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>점심/휴게 시작 시간</label>
            <input type="time" v-model="policy.lunchStartTime" class="time-input" />
          </div>
          <div class="form-group">
            <label>점심/휴게 종료 시간</label>
            <input type="time" v-model="policy.lunchEndTime" class="time-input" />
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>업무 집중 시간 (Core Time) 시작</label>
            <input type="time" v-model="policy.coreTimeStart" class="time-input" />
          </div>
          <div class="form-group">
            <label>업무 집중 시간 (Core Time) 종료</label>
            <input type="time" v-model="policy.coreTimeEnd" class="time-input" />
          </div>
        </div>
      </section>

      <!-- 2. 지각/조퇴 및 연장근무 기준 -->
      <section class="policy-section">
        <h2 class="section-title">근태 인정 기준 설정</h2>
        <div class="form-group full-width">
          <label>지각/조퇴 기준 (분)</label>
          <div class="input-with-text">
            <span>설정된 시간보다</span>
            <input type="number" v-model="policy.latenessThreshold" class="num-input" min="0" />
            <span>분 이상 늦거나 일찍 퇴근 시 지각/조퇴로 간주</span>
          </div>
        </div>
        <div class="form-group full-width">
          <label>연장근무 최소 인정 시간 (분)</label>
          <div class="input-with-text">
            <span>근무 종료 후</span>
            <input type="number" v-model="policy.overtimeThreshold" class="num-input" min="30" step="10" />
            <span>분 이상 근무 시 연장근무로 인정</span>
          </div>
        </div>
      </section>

      <!-- 3. 승인 프로세스 -->
      <section class="policy-section">
        <h2 class="section-title">승인 프로세스 설정</h2>
        <div class="checkbox-group">
          <label class="checkbox-label">
            <input type="checkbox" v-model="policy.requireApprovalForCorrection" />
            <span class="text">사용자의 근태 변경(정정) 요청 시 승인 절차 강제</span>
          </label>
          <p class="help-text">체크 시, 사용자가 자신의 출퇴근 시간을 수정하려면 관리자 또는 승인권자의 승인이 필요합니다.</p>
        </div>

        <div class="checkbox-group">
          <label class="checkbox-label">
            <input type="checkbox" v-model="policy.requireApprovalForOvertime" />
            <span class="text">연장근무 등 예외 사항에 대한 승인 프로세스 강제</span>
          </label>
        </div>

        <div class="checkbox-group">
          <label class="checkbox-label">
            <input type="checkbox" v-model="policy.requireManagerApproval" />
            <span class="text">지각/조퇴 사유서 및 연장근무 신청는 반드시 팀장급 이상의 결재 필요</span>
          </label>
          <p class="help-text">체크 시, 해당 내역은 상위 직급자(팀장 등)의 결재가 완료되어야 인정됩니다.</p>
        </div>
      </section>

      <div class="action-footer">
        <button class="btn-save" @click="savePolicy">저장하기</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const policy = ref({
  standardStartTime: '09:00',
  standardEndTime: '18:00',
  lunchStartTime: '12:00',
  lunchEndTime: '13:00',
  coreTimeStart: '10:00',
  coreTimeEnd: '16:00',
  latenessThreshold: 1, // 1분
  overtimeThreshold: 60, // 60분
  requireApprovalForCorrection: true,
  requireApprovalForOvertime: true,
  requireManagerApproval: true
})

const savePolicy = () => {
  // 실제 API 연동이 되어있다면 여기서 저장 요청
  alert('근태 관리 정책이 저장되었습니다.')
}
</script>

<style scoped>
.admin-attendance-page {
  padding: 32px;
  background-color: var(--background-gray);
  min-height: 100vh;
}

.page-header {
  margin-bottom: 24px;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--gray900);
  margin-bottom: 8px;
}

.page-description {
  color: var(--gray600);
  font-size: 0.95rem;
}

.content-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.policy-section {
  background: #fff;
  border: 1px solid var(--gray200);
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.02);
}

.section-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--gray800);
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--gray100);
}

.form-row {
  display: flex;
  gap: 24px;
  margin-bottom: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
}

.form-group.full-width {
  flex: none;
  width: 100%;
}

.form-group label {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--gray700);
}

.time-input, .num-input {
  padding: 10px 12px;
  border: 1px solid var(--gray300);
  border-radius: 6px;
  font-size: 0.95rem;
  outline: none;
  transition: border-color 0.2s;
}

.time-input:focus, .num-input:focus {
  border-color: var(--primary);
}

.num-input {
  width: 80px;
  text-align: center;
}

.input-with-text {
  display: flex;
  align-items: center;
  gap: 12px;
  color: var(--gray700);
  font-size: 0.95rem;
}

.checkbox-group {
  margin-bottom: 16px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}

.checkbox-label input[type="checkbox"] {
  width: 18px;
  height: 18px;
  accent-color: var(--primary);
}

.checkbox-label .text {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--gray800);
}

.help-text {
  margin-top: 4px;
  margin-left: 28px;
  font-size: 0.85rem;
  color: var(--gray500);
}

.action-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 12px;
}

.btn-save {
  padding: 12px 24px;
  background-color: var(--primary);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-save:hover {
  background-color: #4338ca;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .form-row {
    flex-direction: column;
  }
}
</style>
