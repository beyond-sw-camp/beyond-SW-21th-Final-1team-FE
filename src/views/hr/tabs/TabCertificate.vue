<template>
  <div class="tab-certificate">
    <section class="cert-card">
      <div class="cert-card-header">
        <h3>증명서 발급</h3>
        <button class="help-btn" type="button" @click="showPolicyModal = true" aria-label="증명서 정책">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M9.1 9a3 3 0 1 1 4.9 2.3c-.8.6-1.2 1.1-1.2 2.2" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </button>
      </div>

      <div class="issue-grid">
        <article v-for="kind in certificateKinds" :key="kind.key" class="issue-item">
          <div class="issue-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
          </div>
          <strong class="issue-title">{{ kind.title }}</strong>
          <p class="issue-desc">{{ kind.description }}</p>
          <button class="issue-btn" type="button" @click="openIssueModal(kind)">발급하기</button>
        </article>
      </div>
    </section>

    <section class="cert-card history-card">
      <div class="cert-card-header">
        <h3>발급 이력</h3>
      </div>

      <div class="history-table-wrap">
        <table class="history-table">
          <thead>
            <tr>
              <th>증명서 종류</th>
              <th>발급 날짜</th>
              <th>상태</th>
              <th class="col-download">다운로드</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="record in issueHistory" :key="record.requestId">
              <td class="cell-strong">{{ record.certificateName }}</td>
              <td class="font-num">{{ record.issuedDate }}</td>
              <td>
                <span class="status-badge" :class="statusClass(record.status)">
                  {{ record.statusName || statusText(record.status) }}
                </span>
              </td>
              <td class="col-download">
                <button
                  class="download-btn"
                  type="button"
                  :disabled="!isIssued(record.status)"
                  @click="isIssued(record.status) && downloadCertificate(record)"
                  aria-label="다운로드"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                </button>
              </td>
            </tr>
            <tr v-if="issueHistory.length === 0">
              <td colspan="4" class="empty-history-row">발급 이력이 없습니다.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <BaseModal v-model="showIssueModal" width="460px">
      <div class="modal-title-row">
        <h2 class="modal-title">{{ issueModalTitle }}</h2>
        <button class="modal-close" type="button" @click="showIssueModal = false">&times;</button>
      </div>
      <div class="modal-fields">
        <div class="modal-field">
          <label>제출처</label>
          <input v-model="issueForm.submitTo" type="text" placeholder="예: 국민은행" />
        </div>
        <div class="modal-field">
          <label>용도</label>
          <input v-model="issueForm.purpose" type="text" placeholder="예: 금융거래 목적" />
        </div>
      </div>
      <div class="modal-actions">
        <button class="btn-confirm" type="button" :disabled="loading" @click="issueCertificate">발급하기</button>
        <button class="btn-cancel" type="button" @click="showIssueModal = false">취소</button>
      </div>
    </BaseModal>

    <BaseModal v-model="showPolicyModal" width="560px">
      <div class="modal-title-row">
        <h2 class="modal-title">증명서 정책 안내</h2>
        <button class="modal-close" type="button" @click="showPolicyModal = false">&times;</button>
      </div>
      <ul class="policy-list">
        <li v-for="(line, index) in policyLines" :key="index">{{ line }}</li>
      </ul>
    </BaseModal>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import BaseModal from '@/components/common/BaseModal.vue'
import {
  createCertificateRequest,
  downloadCertificateByRequestId,
  getCertificateRequestHistories,
} from '@/api/hr'

const certificateKinds = ref([
  {
    key: 'EMPLOYMENT_KO',
    title: '재직 증명서',
    description: '재직 상태 및 소속 정보가 포함된\n국문 증명서입니다.',
  },
])
const issueHistory = ref([])
const policyLines = ref([
  '증명서 발급 요청 시 제출처와 용도는 필수입니다.',
  '발급된 문서는 발급 이력에서 다시 다운로드할 수 있습니다.',
  '증명서는 PDF 파일로 발급됩니다.',
])
const selectedKind = ref(certificateKinds.value[0] || null)

const showIssueModal = ref(false)
const showPolicyModal = ref(false)
const loading = ref(false)

const issueForm = reactive({
  submitTo: '',
  purpose: ''
})

const issueModalTitle = computed(() => `${selectedKind.value?.title || '증명서'} 발급`)

const formatToday = () => {
  const now = new Date()
  const yyyy = String(now.getFullYear())
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const dd = String(now.getDate()).padStart(2, '0')
  return `${yyyy}.${mm}.${dd}`
}

const normalizeDate = (value) => {
  if (!value) return '-'
  return String(value).replaceAll('-', '.')
}

const resetIssueForm = () => {
  issueForm.submitTo = ''
  issueForm.purpose = ''
}

const openIssueModal = (kind) => {
  selectedKind.value = kind || certificateKinds.value[0] || null
  resetIssueForm()
  showIssueModal.value = true
}

const loadIssueHistory = async () => {
  try {
    const rows = await getCertificateRequestHistories()
    issueHistory.value = (rows || []).map((row) => ({
      requestId: row.requestId,
      certificateType: row.certificateType,
      certificateName: row.certificateName,
      issuedDate: normalizeDate(row.issuedDate),
      status: row.status,
      statusName: row.statusName,
    }))
    return true
  } catch (error) {
    issueHistory.value = []
    alert(error?.response?.data?.error?.message || '증명서 발급 이력 조회에 실패했습니다.')
    return false
  }
}

const issueCertificate = async () => {
  if (!selectedKind.value) return
  if (!issueForm.submitTo.trim() || !issueForm.purpose.trim()) return

  try {
    loading.value = true
    await createCertificateRequest({
      certificateType: selectedKind.value.key,
      submitTo: issueForm.submitTo.trim(),
      purpose: issueForm.purpose.trim(),
    })
    const refreshed = await loadIssueHistory()
    if (!refreshed) return
    showIssueModal.value = false
    resetIssueForm()
    alert('증명서 발급이 완료되었습니다.')
  } catch (error) {
    alert(error?.response?.data?.error?.message || '증명서 발급에 실패했습니다.')
  } finally {
    loading.value = false
  }
}

const statusText = (status) => {
  if (status === 'ISSUED') return '발급 완료'
  if (status === 'FAILED') return '발급 실패'
  return '처리중'
}

const isIssued = (status) => status === 'ISSUED'

const statusClass = (status) => {
  if (status === 'ISSUED') return 'is-issued'
  if (status === 'FAILED') return 'is-failed'
  return 'is-pending'
}

const downloadCertificate = async (record) => {
  try {
    const blob = await downloadCertificateByRequestId(record.requestId)
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${record.certificateName || 'certificate'}_${record.issuedDate?.replaceAll?.('.', '') || formatToday().replaceAll('.', '')}.pdf`
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  } catch (error) {
    alert(error?.response?.data?.error?.message || '증명서 다운로드에 실패했습니다.')
  }
}

onMounted(async () => {
  await loadIssueHistory()
})
</script>

<style scoped>
.tab-certificate { margin-top: 20px; display: grid; gap: 16px; }

.cert-card {
  background: var(--glass);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  overflow: hidden;
  min-height: 0;
}

.cert-card-header {
  height: 56px;
  padding: 0 16px;
  border-bottom: 1px solid var(--gray100);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.cert-card-header h3 {
  font-size: 1.03rem;
  font-weight: 700;
  color: var(--gray800);
}

.help-btn {
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 50%;
  background: transparent;
  color: var(--gray500);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.help-btn:hover { color: var(--primary); background: var(--accent); }

.issue-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 14px;
  padding: 16px;
}

.issue-item {
  border: 1px solid var(--gray200);
  border-radius: 14px;
  min-height: 218px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  text-align: center;
}

.issue-icon {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background: #E0F2FE;
  color: #0891B2;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.issue-title {
  font-size: 1.18rem;
  color: var(--gray800);
}

.issue-desc {
  margin: 0;
  white-space: pre-line;
  color: var(--gray500);
  font-size: .85rem;
  line-height: 1.5;
}

.issue-btn {
  border: none;
  border-radius: 20px;
  background: var(--primary);
  color: #fff;
  font-size: .78rem;
  font-weight: 700;
  padding: 6px 14px;
  cursor: pointer;
}

.issue-btn:hover { background: var(--primary-dark); }

.history-card { min-height: 290px; }
.history-table-wrap {
  height: 360px;
  overflow: auto;
  min-height: 0;
}

.history-table {
  width: 100%;
  border-collapse: collapse;
}

.history-table th,
.history-table td {
  padding: 12px 16px;
  border-bottom: 1px solid var(--gray100);
  text-align: left;
  font-size: .88rem;
}

.history-table thead th {
  color: var(--gray500);
  font-size: .8rem;
  font-weight: 600;
  position: sticky;
  top: 0;
  background: #fff;
  z-index: 1;
}

.cell-strong { font-weight: 700; color: var(--gray800); }
.col-download { text-align: right !important; }

.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  border-radius: 999px;
  background: #F1F5F9;
  color: #475569;
  font-size: .75rem;
  font-weight: 700;
}

.status-badge.is-issued { background: #DCFCE7; color: #16A34A; }
.status-badge.is-failed { background: #FEE2E2; color: #DC2626; }
.status-badge.is-pending { background: #FEF3C7; color: #B45309; }

.download-btn {
  border: none;
  background: transparent;
  color: #0EA5E9;
  cursor: pointer;
  padding: 2px;
}

.download-btn:hover { color: #0284C7; }
.download-btn:disabled {
  color: #94A3B8;
  cursor: not-allowed;
}

.empty-history-row {
  text-align: center;
  color: var(--gray400);
}

.modal-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18px;
}

.modal-title {
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--gray800);
}

.modal-close {
  border: none;
  background: transparent;
  color: var(--gray400);
  font-size: 1.8rem;
  line-height: 1;
  cursor: pointer;
}

.modal-close:hover { color: var(--gray600); }

.modal-fields { display: grid; gap: 14px; }

.modal-field {
  display: grid;
  gap: 6px;
}

.modal-field label {
  font-size: .84rem;
  font-weight: 600;
  color: var(--gray600);
}

.modal-field input {
  border: 1px solid var(--gray200);
  border-radius: 12px;
  padding: 12px 14px;
  font-size: .9rem;
  color: var(--gray700);
  outline: none;
}

.modal-field input:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px var(--accent);
}

.modal-actions {
  margin-top: 22px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.btn-confirm,
.btn-cancel,
.btn-print {
  border: none;
  border-radius: 12px;
  padding: 10px 20px;
  font-size: .9rem;
  font-weight: 700;
  cursor: pointer;
}

.btn-confirm,
.btn-print {
  background: var(--primary);
  color: #fff;
}

.btn-confirm:hover,
.btn-print:hover { background: var(--primary-dark); }

.btn-cancel {
  background: #fff;
  color: var(--gray600);
  border: 1px solid var(--gray200);
}

.btn-cancel:hover { background: var(--gray50); }

.policy-list {
  margin: 0;
  padding-left: 20px;
  color: var(--gray700);
  display: grid;
  gap: 8px;
  font-size: .9rem;
  line-height: 1.6;
}

.preview-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.preview-header h3 {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--gray800);
}

.preview-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.preview-frame {
  max-height: 78vh;
  overflow: auto;
  padding: 10px;
  background: #F8FAFC;
  border-radius: 8px;
}

.preview-paper {
  width: min(100%, 794px);
  aspect-ratio: 210 / 297;
  margin: 0 auto;
  box-sizing: border-box;
  border: 1px solid #0f172a;
  padding: 58px 44px 46px;
  background: #fff;
  box-shadow: 0 10px 24px rgba(15, 23, 42, .08);
  display: flex;
  flex-direction: column;
}

.cert-main-title {
  text-align: center;
  letter-spacing: .42em;
  font-size: 2.16rem;
  margin: 0 0 44px;
  font-weight: 700;
}

.cert-body { display: grid; gap: 10px; }

.cert-form-table {
  width: 100%;
  border-collapse: collapse;
}

.cert-form-table th,
.cert-form-table td {
  border: 1px solid #334155;
  padding: 10px 10px;
  font-size: .83rem;
  color: #0f172a;
}

.cert-form-table th {
  width: 12%;
  background: #fff;
  text-align: center;
  font-weight: 700;
}

.cert-form-table .group-cell {
  width: 9%;
  line-height: 1.44;
}

.purpose-table th { width: 9%; }

.cert-footer {
  margin-top: auto;
  padding-top: 78px;
}

.preview-statement {
  margin: 0 2px 48px 0;
  text-align: right;
  font-size: 1.18rem;
  color: #0f172a;
  font-weight: 600;
  text-decoration: underline;
  text-underline-offset: 3px;
}

.preview-date {
  margin: 0 0 40px;
  text-align: center;
  font-size: 1.34rem;
  letter-spacing: .09em;
  color: #0f172a;
  font-weight: 600;
}

.preview-sign-area {
  width: 42%;
  margin-left: auto;
  display: grid;
  gap: 14px;
}

.preview-sign-area p {
  margin: 0;
  font-size: 1.04rem;
  color: #0f172a;
  display: flex;
  justify-content: space-between;
}

.preview-company {
  margin: 56px 0 0;
  text-align: center;
  font-size: 1.72rem;
  letter-spacing: .22em;
  color: #0f172a;
  font-weight: 600;
}
</style>
