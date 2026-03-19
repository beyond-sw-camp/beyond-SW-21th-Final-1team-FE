<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="close">
    <div class="modal-content">
      <div class="modal-header">
        <div class="header-main">
          <div class="header-tags">
            <span v-if="item.category" class="category-chip">{{ item.category }}</span>
            <span class="status-badge" :class="statusClass">{{ item.status }}</span>
          </div>
          <h3 class="modal-title">{{ item.title }}</h3>
        </div>
        <div class="header-actions">
          <button class="icon-btn" @click="close">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
      </div>

      <div class="modal-body custom-scrollbar">
        <ApprovalDocumentPaper :item="item" />
      </div>

      <!-- Action Footer -->
      <div class="modal-footer">
        <div class="footer-left">
          <template v-if="isDrafter">
            <button v-if="item.status === '임시저장'" class="btn btn-danger-ghost" @click="handleAction('cancel')">기안 취소</button>
            <button v-if="item.status === '반려'" class="btn btn-primary" @click="handleAction('redraft')">재상신 하기</button>
            <button v-if="item.status === '임시저장'" class="btn btn-primary" @click="handleAction('draft')">상신</button>
            <button v-if="item.status === '임시저장'" class="btn btn-danger" @click="handleAction('delete')">삭제</button>
          </template>
          <button v-if="canReview" class="btn btn-indigo" @click="handleAction('review')">결재 검토</button>
        </div>
        <button class="btn btn-secondary" @click="close">닫기</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import ApprovalDocumentPaper from './ApprovalDocumentPaper.vue';
import { AUTH_KEYS } from '@/utils/auth';

const props = defineProps({
  isOpen: Boolean,
  item: {
    type: Object,
    default: () => ({})
  }
});

const emit = defineEmits(['close', 'action']);

const currentUser = {
  name: typeof sessionStorage !== 'undefined' ? sessionStorage.getItem(AUTH_KEYS.userName) || '' : '',
}

const isDrafter = computed(() => {
  if (typeof props.item.isDrafter === 'boolean') return props.item.isDrafter;
  return props.item.drafter === currentUser.name || props.item.status === '임시저장';
});

const canReview = computed(() => {
  if (typeof props.item.canReview === 'boolean') return props.item.canReview;
  return props.item.status === '진행중' && !isDrafter.value;
});

const statusClass = computed(() => {
  switch (props.item.status) {
    case '완료': return 'status-completed';
    case '진행중': return 'status-ing';
    case '반려': return 'status-rejected';
    case '보류': return 'status-hold';
    case '취소': return 'status-cancelled';
    case '임시저장': return 'status-temp';
    default: return '';
  }
});

const close = () => {
  emit('close');
};

const handleAction = (type) => {
  emit('action', { type, id: props.item.approvalId || props.item.id, data: props.item });
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background: rgba(15, 23, 42, 0.6);
  display: flex; align-items: center; justify-content: center;
  z-index: 2100;
  backdrop-filter: blur(8px);
}

.modal-content {
  background: white;
  width: 860px; max-width: 95%;
  max-height: calc(100vh - 24px);
  border-radius: 24px;
  display: flex; flex-direction: column;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  overflow: hidden;
}

.modal-header {
  padding: 32px 40px 24px;
  display: flex; justify-content: space-between; align-items: flex-start;
  border-bottom: 1px solid #f1f5f9;
}

.header-main { display: flex; flex-direction: column; gap: 8px; }
.header-tags { display: flex; gap: 8px; align-items: center; }

.category-chip {
  font-size: 0.7rem; font-weight: 700;
  background: #f1f5f9; color: #64748b;
  padding: 4px 10px; border-radius: 100px;
}

.status-badge {
  font-size: 0.75rem; font-weight: 700;
  padding: 4px 10px; border-radius: 6px;
}

.status-completed { background: #ecfdf5; color: #059669; }
.status-ing { background: #eff6ff; color: #2563eb; }
.status-rejected { background: #fef2f2; color: #dc2626; }
.status-hold { background: #fffbeb; color: #d97706; }
.status-cancelled { background: #f8fafc; color: #475569; }
.status-temp { background: #f8fafc; color: #475569; }

.modal-title {
  margin: 0; font-size: 1.6rem; font-weight: 800; color: #0f172a;
}

.icon-btn {
  background: #f8fafc; border: none;
  width: 40px; height: 40px; border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; color: #94a3b8; transition: all 0.2s;
}

.icon-btn:hover { background: #f1f5f9; color: #0f172a; transform: rotate(90deg); }

.modal-body {
  padding: 24px 28px;
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
  display: grid; grid-template-columns: repeat(2, 1fr);
  gap: 20px; margin-bottom: 32px;
  padding: 24px; background: #f8fafc; border-radius: 16px;
}

.info-block { display: flex; flex-direction: column; gap: 4px; }
.full-width { grid-column: span 2; }
.info-label { font-size: 0.75rem; color: #94a3b8; font-weight: 600; }
.info-value { font-size: 1rem; color: #1e293b; font-weight: 700; }

.user-info { display: flex; align-items: center; gap: 12px; }
.avatar {
  width: 36px; height: 36px; background: #e2e8f0;
  border-radius: 50%; display: flex; align-items: center; justify-content: center;
  font-weight: 800; color: #475569;
}
.user-text { display: flex; flex-direction: column; }
.user-text .name { font-weight: 700; color: #1e293b; }
.user-text .desc { font-size: 0.85rem; color: #64748b; }

.section { margin-bottom: 32px; }
.section-title {
  font-size: 1rem; font-weight: 800; color: #0f172a;
  margin-bottom: 16px; display: flex; align-items: center; gap: 8px;
}
.badge { font-size: 0.8rem; color: #94a3b8; font-weight: 500; }

.approval-flow {
  display: flex; align-items: center; gap: 12px;
  overflow-x: auto; padding-bottom: 8px;
}
.flow-step { display: flex; align-items: center; gap: 12px; }
.step-card {
  padding: 12px 16px; border-radius: 12px; background: white;
  border: 1px solid #e2e8f0; min-width: 140px;
  display: flex; flex-direction: column; gap: 4px;
}
.step-card.승인 { background: #f0fdf4; border-color: #bbf7d0; }
.step-card.기안 { background: #f8fafc; border-color: #e2e8f0; }
.step-status { font-size: 0.7rem; font-weight: 800; color: #64748b; }
.step-card.승인 .step-status { color: #16a34a; }
.step-name { font-size: 0.9rem; font-weight: 700; color: #1e293b; }
.step-date { font-size: 0.75rem; color: #94a3b8; }
.flow-arrow { color: #cbd5e1; font-weight: 800; }

.content-view {
  padding: 24px; background: white; border: 1px solid #f1f5f9;
  border-radius: 16px; line-height: 1.8; color: #334155; font-size: 1rem;
  white-space: pre-wrap; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
}

.reject-reason-box {
  background: #fff1f2; padding: 20px; border-radius: 16px;
  border: 1px solid #ffe4e6;
}
.reject-content { color: #be123c; font-weight: 500; line-height: 1.6; }

.file-grid { display: flex; flex-wrap: wrap; gap: 10px; }
.file-item {
  display: flex; align-items: center; gap: 8px;
  padding: 8px 12px; background: white; border: 1px solid #f1f5f9;
  border-radius: 10px; font-size: 0.85rem; font-weight: 600; color: #475569;
}

.referrer-text { color: #64748b; font-size: 0.9rem; }

.modal-footer {
  padding: 24px 40px; background: #f8fafc;
  display: flex; justify-content: space-between; align-items: center;
  border-top: 1px solid #f1f5f9;
}

.footer-left { display: flex; gap: 12px; }

.btn {
  padding: 12px 24px; border-radius: 12px; font-weight: 700;
  font-size: 0.9rem; cursor: pointer; border: none; transition: all 0.2s;
}

.btn-primary { background: #4f46e5; color: white; }
.btn-primary:hover { background: #4338ca; transform: translateY(-2px); }

.btn-secondary { background: white; color: #475569; border: 1px solid #e2e8f0; }
.btn-secondary:hover { background: #f8fafc; border-color: #cbd5e1; }

.btn-danger { background: #dc2626; color: white; }
.btn-danger-ghost { background: #fef2f2; color: #dc2626; }

.btn-indigo { background: #6366f1; color: white; }

/* Scrollbar */
.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }

@media (max-height: 900px) {
  .modal-header {
    padding: 24px 28px 16px;
  }

  .modal-footer {
    padding: 16px 28px;
  }

  .btn {
    padding: 10px 18px;
  }
}
</style>
