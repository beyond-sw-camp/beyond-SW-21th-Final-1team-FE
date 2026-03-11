<template>
  <BaseModal :model-value="modelValue" @update:modelValue="emit('update:modelValue', $event)" :width="width">
    <div class="modal-header">
      <h3 class="modal-title">{{ title }}</h3>
    </div>
    <div class="modal-body">
      <p class="modal-message">{{ message }}</p>
      <div v-if="requireReason" class="form-group">
        <label class="form-label">{{ reasonLabel }}</label>
        <textarea
          :value="reason"
          class="form-textarea"
          rows="3"
          :placeholder="placeholder"
          :disabled="loading"
          @input="emit('update:reason', $event.target.value)"
        ></textarea>
      </div>
    </div>
    <div class="modal-actions">
      <button class="btn-cancel" :disabled="loading" @click="emit('update:modelValue', false)">취소</button>
      <button class="btn-confirm" :disabled="loading || confirmDisabled" @click="emit('confirm')">
        {{ loading ? '처리 중...' : confirmText }}
      </button>
    </div>
  </BaseModal>
</template>

<script setup>
import BaseModal from '@/components/common/BaseModal.vue'

defineProps({
  modelValue: { type: Boolean, default: false },
  title: { type: String, default: '확인' },
  message: { type: String, default: '' },
  confirmText: { type: String, default: '확인' },
  loading: { type: Boolean, default: false },
  confirmDisabled: { type: Boolean, default: false },
  requireReason: { type: Boolean, default: false },
  reason: { type: String, default: '' },
  reasonLabel: { type: String, default: '사유' },
  placeholder: { type: String, default: '사유를 입력해주세요.' },
  width: { type: String, default: '460px' },
})

const emit = defineEmits(['update:modelValue', 'update:reason', 'confirm'])
</script>

<style scoped>
.modal-header {
  margin-bottom: 16px;
}

.modal-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--gray900);
}

.modal-message {
  color: var(--gray700);
  line-height: 1.5;
  margin-bottom: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--gray700);
}

.form-textarea {
  width: 100%;
  border: 1px solid var(--gray300);
  border-radius: 8px;
  padding: 12px;
  resize: none;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 20px;
}

.btn-cancel,
.btn-confirm {
  padding: 10px 18px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-weight: 600;
}

.btn-cancel:disabled,
.btn-confirm:disabled,
.form-textarea:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-cancel {
  background: var(--gray100);
  color: var(--gray700);
}

.btn-confirm {
  background: var(--primary);
  color: #fff;
}
</style>
