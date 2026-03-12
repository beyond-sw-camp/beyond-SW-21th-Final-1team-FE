<template>
  <div class="tab-salary">
    <div v-if="!isVerified" class="lock-overlay">
      <div class="lock-card">
        <h3>급여 정보 확인</h3>
        <p class="lock-desc">개인정보 보호를 위해 비밀번호를 입력해주세요.</p>
        <form class="lock-form" @submit.prevent="verifyPassword">
          <input
            v-model="passwordInput"
            type="password"
            placeholder="비밀번호를 입력하세요"
            @input="passwordError = ''"
          />
          <button class="btn-link lock-btn" type="submit">확인</button>
        </form>
        <p v-if="passwordError" class="lock-error">{{ passwordError }}</p>
      </div>
    </div>

    <template v-else>
      <section class="salary-card">
        <div class="card-head">
          <button class="btn-link" type="button" @click="goSalaryPage">내 급여 페이지 바로가기</button>
        </div>

        <div class="summary-row">
          <div>
            <p class="summary-label">최신 세전 월급</p>
            <strong class="summary-amount">{{ formatWon(summary.grossAmount) }}</strong>
            <p class="summary-meta">{{ summary.latestMonthLabel }} 급여 · 지급일 {{ summary.payDate }}</p>
          </div>
        </div>
      </section>

      <section class="salary-card">
        <div class="card-head">
          <h3>이전 월급 내역</h3>
        </div>

        <div class="table-wrap">
          <table class="salary-table">
            <thead>
              <tr>
                <th>지급일</th>
                <th>귀속월</th>
                <th>세전 월급</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in salaryHistory" :key="item.id">
                <td class="font-num">{{ item.payDate }}</td>
                <td class="font-num">{{ item.month }}</td>
                <td class="font-num amount">{{ formatWon(item.grossAmount) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </template>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { usePayrollStore } from '@/store/payroll'

const router = useRouter()
const payrollStore = usePayrollStore()
const passwordInput = ref('')
const passwordError = ref('')
const isVerified = computed(() => payrollStore.isSalaryVerified)

const salaryHistory = computed(() => payrollStore.recentPayrolls.slice(1, 6).map((item) => ({
  id: item.id,
  payDate: item.paymentDateLabel,
  month: item.targetMonth,
  grossAmount: item.totalPayment,
})))

const summary = computed(() => {
  const latest = payrollStore.latestPayroll
  if (!latest) {
    return {
      grossAmount: 0,
      latestMonthLabel: '-',
      payDate: '-',
    }
  }

  return {
    grossAmount: latest.totalPayment,
    latestMonthLabel: latest.targetMonth,
    payDate: latest.paymentDateLabel,
  }
})

const formatWon = (amount) => {
  return `₩ ${Number(amount || 0).toLocaleString('ko-KR')}`
}

const verifyPassword = async () => {
  if (!passwordInput.value.trim()) {
    passwordError.value = '비밀번호를 입력해주세요.'
    return
  }

  try {
    const verified = await payrollStore.verifyPassword(passwordInput.value.trim())
    if (!verified) {
      passwordError.value = '비밀번호가 올바르지 않습니다.'
      passwordInput.value = ''
      return
    }
    if (!payrollStore.recentPayrolls.length) {
      await payrollStore.fetchRecentPayrolls(6)
    }
  } catch (error) {
    passwordError.value = payrollStore.normalizeError(error, '비밀번호 확인에 실패했습니다.')
    passwordInput.value = ''
    return
  }
}

const goSalaryPage = () => {
  router.push('/salary/my')
}
</script>

<style scoped>
.tab-salary { margin-top: 20px; display: grid; gap: 14px; position: relative; min-height: 320px; }

.lock-overlay {
  position: absolute;
  inset: 0;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius);
  background: rgba(248, 250, 252, .92);
  backdrop-filter: blur(4px);
}
.lock-card {
  width: min(420px, calc(100% - 24px));
  border: 1px solid var(--gray200);
  border-radius: 12px;
  background: #fff;
  box-shadow: var(--shadow);
  padding: 18px;
}
.lock-card h3 { margin: 0; color: var(--gray800); font-size: 1.06rem; }
.lock-desc { margin: 8px 0 10px; color: var(--gray500); font-size: .82rem; }
.lock-form { display: flex; gap: 8px; }
.lock-form input {
  flex: 1;
  height: 36px;
  border: 1px solid var(--gray200);
  border-radius: 8px;
  padding: 0 10px;
  color: var(--gray700);
}
.lock-btn { min-width: 70px; }
.lock-error { margin: 8px 0 0; color: #dc2626; font-size: .8rem; }

.salary-card {
  background: var(--glass);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 16px;
}

.card-head { display: flex; align-items: center; justify-content: space-between; }
.card-head h3 { margin: 0; color: var(--gray800); font-size: 1.02rem; }

.btn-link {
  height: 34px;
  border: 1px solid #bae6fd;
  border-radius: 8px;
  background: #f0f9ff;
  color: #0369a1;
  padding: 0 12px;
  font-size: .82rem;
  font-weight: 700;
}

.summary-row {
  margin-top: 12px;
  border: 1px solid var(--gray100);
  border-radius: 10px;
  background: #fff;
  padding: 14px;
}
.summary-label { margin: 0; color: var(--gray500); font-size: .8rem; }
.summary-amount { margin-top: 4px; display: block; color: var(--gray800); font-size: 2rem; line-height: 1.2; }
.summary-meta { margin: 6px 0 0; color: var(--gray500); font-size: .8rem; }

.table-wrap { margin-top: 12px; overflow: auto; }
.salary-table { width: 100%; border-collapse: collapse; font-size: .84rem; background: #fff; border-radius: 10px; overflow: hidden; }
.salary-table th,
.salary-table td {
  border-bottom: 1px solid var(--gray100);
  text-align: left;
  padding: 11px 12px;
}
.salary-table th { color: var(--gray500); font-weight: 700; background: #f8fafc; }
.salary-table td { color: var(--gray700); }
.salary-table .amount { color: #0369a1; font-weight: 700; }
</style>
