<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="close">
    <div class="modal-content">
      <div class="modal-header">
        <div class="header-main">
          <span class="category-chip">{{ item.category }}</span>
          <h3 class="modal-title">{{ item.title }}</h3>
        </div>
        <button class="close-icon-btn" @click="close">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>

      <div class="modal-body custom-scrollbar">
        <ApprovalDocumentPaper :item="item" />

        <div v-if="showRejectReason" class="reject-section animate-slide-up">
          <h4 class="section-title text-danger">반려 사유 입력</h4>
          <textarea 
            v-model="rejectReason" 
            placeholder="반려 사유를 상세히 입력해주세요." 
            class="trendy-textarea"
            autofocus
          ></textarea>
        </div>
      </div>

      <div class="modal-footer">
        <div v-if="!showRejectReason" class="footer-actions">
          <div class="primary-actions">
            <button class="t-btn t-btn-primary" @click="handleAction('approve')">
              <span class="btn-icon">✓</span> 승인
            </button>
            <button class="t-btn t-btn-danger-ghost" @click="showRejectReason = true">
              반려
            </button>
            <button class="t-btn t-btn-purple-ghost" @click="handleAction('finalize')">
              전결
            </button>
            <button class="t-btn t-btn-warning-ghost" @click="handleAction('hold')">
              보류
            </button>
          </div>
          <button class="t-btn t-btn-secondary" @click="close">창 닫기</button>
        </div>
        
        <div v-else class="footer-actions center">
          <div class="action-group">
            <button class="t-btn t-btn-danger" @click="handleAction('reject')">
              반려 완료
            </button>
            <button class="t-btn t-btn-secondary" @click="cancelReject">
              취소
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import ApprovalDocumentPaper from './ApprovalDocumentPaper.vue';

const props = defineProps({
  isOpen: Boolean,
  item: {
    type: Object,
    default: () => ({})
  }
});

const emit = defineEmits(['close', 'action']);

const showRejectReason = ref(false);
const rejectReason = ref('');

watch(() => props.isOpen, (newVal) => {
  if (!newVal) {
    showRejectReason.value = false;
    rejectReason.value = '';
  }
});

const close = () => {
  emit('close');
};

const cancelReject = () => {
  showRejectReason.value = false;
  rejectReason.value = '';
};

const handleAction = (type) => {
  if (type === 'reject' && !rejectReason.value.trim()) {
    alert('반려 사유를 입력해주세요.');
    return;
  }
  
  let message = '';
  const reviewerName = '이팀장'; 
  const reviewerPos = '팀장';
  
  switch(type) {
    case 'approve':
      message = props.item.step === 3 ? `해당 결재건이 최종 승인되었습니다. (${reviewerName} ${reviewerPos})` : `${props.item.step}차 승인 되었습니다. (${reviewerName} ${reviewerPos})`;
      break;
    case 'reject':
      message = `반려 되었습니다. 사유 : ${rejectReason.value} (${reviewerName} ${reviewerPos})`;
      break;
    case 'hold':
      message = `보류 처리되었습니다. (${reviewerName} ${reviewerPos})`;
      break;
    case 'finalize':
      message = `해당 결재건이 전결(최종 승인) 처리되었습니다. (${reviewerName} ${reviewerPos})`;
      break;
  }
  
  alert(`[알림/이메일 전송]\n${message}`);
  emit('action', { type, id: props.item.id, reason: rejectReason.value });
  close();
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(15, 23, 42, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  backdrop-filter: blur(8px);
}

.modal-content {
  background: white;
  width: 860px;
  max-width: 95%;
  max-height: calc(100vh - 24px);
  border-radius: 24px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
  animation: modal-scale-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes modal-scale-in {
  from { transform: scale(0.95); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

.modal-header {
  padding: 32px 40px 24px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.header-main {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.category-chip {
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background: #f1f5f9;
  color: #64748b;
  padding: 4px 10px;
  border-radius: 100px;
  width: fit-content;
}

.modal-title {
  margin: 0;
  font-size: 1.6rem;
  font-weight: 800;
  color: #0f172a;
  line-height: 1.3;
}

.close-icon-btn {
  background: #f8fafc;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #94a3b8;
  transition: all 0.2s;
}

.close-icon-btn:hover {
  background: #f1f5f9;
  color: #0f172a;
  transform: rotate(90deg);
}

.modal-body {
  padding: 0 28px 20px;
  overflow-y: auto;
  min-height: 0;
  flex: 1;
  border-top: 1px solid #e5e7eb;
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 #f8fafc;
}

.modal-body::-webkit-scrollbar {
  width: 8px;
}

.modal-body::-webkit-scrollbar-track {
  background: #f8fafc;
  border-radius: 999px;
}

.modal-body::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 999px;
  border: 2px solid #f8fafc;
}

.modal-body::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 32px;
  padding: 24px;
  background: #f8fafc;
  border-radius: 16px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.full-width {
  grid-column: span 2;
}

.info-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #94a3b8;
}

.info-value {
  font-size: 0.95rem;
  font-weight: 700;
  color: #1e293b;
}

.drafter-badge {
  display: flex;
  align-items: center;
  gap: 10px;
}

.avatar-sm {
  width: 28px;
  height: 28px;
  background: #e2e8f0;
  color: #475569;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 700;
}

.info-subtext {
  font-size: 0.85rem;
  color: #64748b;
  font-weight: 500;
}

.section {
  margin-bottom: 32px;
}

.section-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.count {
  font-size: 0.8rem;
  color: #94a3b8;
  font-weight: 500;
}

.document-content {
  padding: 24px;
  background: white;
  border: 1px solid #f1f5f9;
  border-radius: 16px;
  line-height: 1.8;
  color: #334155;
  font-size: 1.05rem;
  white-space: pre-wrap;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.attachments-container {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.file-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  background: white;
  border: 1px solid #f1f5f9;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.file-card:hover {
  border-color: #cbd5e1;
  transform: translateY(-2px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.file-icon-box {
  color: #3b82f6;
  display: flex;
}

.file-name {
  font-size: 0.85rem;
  font-weight: 600;
  color: #475569;
}

.reject-section {
  margin-top: 24px;
}

.text-danger { color: #e11d48; }

.trendy-textarea {
  width: 100%;
  height: 100px;
  padding: 16px;
  border: 2px solid #f1f5f9;
  border-radius: 16px;
  resize: none;
  font-family: inherit;
  font-size: 0.95rem;
  transition: all 0.2s;
  background: #fffafa;
}

@media (max-height: 900px) {
  .modal-header {
    padding: 24px 28px 16px;
  }

  .modal-footer {
    padding: 16px 28px;
  }

  .t-btn {
    padding: 10px 16px;
  }
}

.trendy-textarea:focus {
  outline: none;
  border-color: #fda4af;
  background: white;
  box-shadow: 0 0 0 4px rgba(253, 164, 175, 0.2);
}

.modal-footer {
  padding: 24px 40px 32px;
  background: #f8fafc;
  border-top: 1px solid #f1f5f9;
}

.footer-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
}

.footer-actions.center {
  justify-content: center;
}

.primary-actions {
  display: flex;
  gap: 12px;
}

.action-group {
  display: flex;
  gap: 12px;
}

.t-btn {
  padding: 12px 20px;
  border-radius: 14px;
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
  border: none;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.t-btn:active { transform: scale(0.96); }

.t-btn-primary {
  background: #4f46e5;
  color: white;
  box-shadow: 0 4px 14px 0 rgba(79, 70, 229, 0.39);
}
.t-btn-primary:hover { background: #4338ca; transform: translateY(-2px); }

.t-btn-secondary {
  background: white;
  color: #475569;
  border: 1px solid #e2e8f0;
}
.t-btn-secondary:hover { background: #f8fafc; border-color: #cbd5e1; }

.t-btn-danger {
  background: #e11d48;
  color: white;
  box-shadow: 0 4px 14px 0 rgba(225, 29, 72, 0.39);
}

.t-btn-danger-ghost {
  background: #fff1f2;
  color: #e11d48;
}
.t-btn-danger-ghost:hover { background: #ffe4e6; color: #be123c; }

.t-btn-warning-ghost {
  background: #fffbeb;
  color: #d97706;
}
.t-btn-warning-ghost:hover { background: #fef3c7; color: #b45309; }

.t-btn-purple-ghost {
  background: #f5f3ff;
  color: #7c3aed;
}
.t-btn-purple-ghost:hover { background: #ede9fe; color: #6d28d9; }

.btn-icon { font-size: 1.1rem; }

.animate-slide-up {
  animation: slide-up 0.3s ease-out;
}

@keyframes slide-up {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 10px;
}
</style>
