<template>
  <div v-if="manual" class="manual-edit">
    <section class="card header">
      <div>
        <p class="eyebrow">KMS EDITOR</p>
        <h1>업무 메뉴얼 수정</h1>
        <p class="summary">{{ manual.title }} · 현재 {{ manual.version }}</p>
      </div>
      <span class="badge">편집 중</span>
    </section>

    <section class="card editor">
      <div class="form-item">
        <label>제목</label>
        <input v-model="title" type="text" />
      </div>

      <div class="editor-head">
        <div>
          <label>내용</label>
          <p>작성 포맷을 유지하면서 최신 버전으로 저장됩니다.</p>
        </div>
        <span class="counter">{{ bodyTextLength }}자</span>
      </div>
      <KmsRichEditor v-model="body" placeholder="메뉴얼 내용을 수정하세요." />

      <div class="version">
        <label>버전 증가 방식</label>
        <div class="radio-row">
          <label><input v-model="versionType" type="radio" value="major" /> 메이저</label>
          <label><input v-model="versionType" type="radio" value="minor" /> 마이너</label>
        </div>
      </div>

      <div class="buttons">
        <button class="save" @click="onSave">저장</button>
      </div>
    </section>

    <section class="card history">
      <header>
        <h2>버전 관리 및 이력</h2>
      </header>
      <ul v-if="manualHistory.length > 0">
        <li v-for="item in manualHistory" :key="item.version">
          <div>
            <strong>{{ item.version }}</strong>
            <span>{{ item.type === 'major' ? '메이저' : '마이너' }}</span>
          </div>
          <p>{{ item.updatedAt }} · {{ item.editor }} · {{ item.notes }}</p>
          <button type="button" @click="alert(`${item.version} 버전 복원을 실행했습니다(시안).`)">복원</button>
        </li>
      </ul>
      <p v-else class="history-empty">버전 히스토리 데이터가 아직 없습니다.</p>
    </section>

  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import KmsRichEditor from '@/components/kms/KmsRichEditor.vue'
import { AUTH_KEYS } from '@/utils/auth'
import { getManualVersionHistory } from '@/mocks/kms'
import { useKmsManualStore } from '@/store/kmsManuals'

const route = useRoute()
const manualStore = useKmsManualStore()
const manual = computed(() => manualStore.getManualById(route.params.manualId))
const title = ref(manual.value?.title || '')
const body = ref(manual.value?.body || '')
const versionType = ref('minor')
const bodyTextLength = computed(() => body.value.replace(/<[^>]+>/g, '').trim().length)
const manualHistory = computed(() => getManualVersionHistory(route.params.manualId))
const currentUserName = computed(() => sessionStorage.getItem(AUTH_KEYS.userName) || '')

const onSave = () => {
  if (!manual.value) {
    alert('대상 메뉴얼을 찾을 수 없습니다.')
    return
  }
  if (manual.value.author !== currentUserName.value) {
    alert('본인이 작성한 메뉴얼만 수정할 수 있습니다.')
    return
  }
  const saved = manualStore.updateManual(manual.value.id, {
    title: title.value,
    body: body.value,
    versionType: versionType.value
  })
  if (!saved) {
    alert('수정 저장에 실패했습니다.')
    return
  }
  alert(`수정 저장 완료: ${saved.version} 버전으로 저장되었습니다.`)
}
</script>

<style scoped>
.manual-edit { display: flex; flex-direction: column; gap: 16px; }
.header {
  border: 1px solid var(--gray200);
  padding: 18px;
  display: flex;
  justify-content: space-between;
  gap: 10px;
}
.eyebrow { color: var(--primary); font-size: 0.76rem; font-weight: 700; letter-spacing: 0.08em; }
.header h1 { margin-top: 4px; font-size: 1.15rem; color: var(--gray800); }
.summary { margin-top: 6px; color: var(--gray500); font-size: 0.84rem; }
.badge {
  align-self: flex-start;
  border-radius: 999px;
  border: 1px solid #bfdbfe;
  background: #eff6ff;
  color: #1d4ed8;
  font-size: 0.74rem;
  font-weight: 700;
  padding: 5px 10px;
}
.editor { border: 1px solid var(--gray200); padding: 18px; display: grid; gap: 10px; }
.form-item { display: grid; gap: 6px; }
.form-item label,
.editor-head label,
.version > label {
  font-size: 0.8rem;
  color: var(--gray500);
}
.form-item input {
  border: 1px solid var(--gray300);
  border-radius: 10px;
  padding: 10px;
  font-size: 0.86rem;
}
.editor-head { display: flex; justify-content: space-between; gap: 8px; align-items: flex-end; }
.editor-head p { margin-top: 3px; font-size: 0.77rem; color: var(--gray400); }
.counter {
  border: 1px solid var(--gray200);
  border-radius: 999px;
  padding: 4px 10px;
  background: var(--gray50);
  color: var(--gray600);
  font-size: 0.74rem;
  font-weight: 700;
}
.version { margin-top: 2px; }
.radio-row { margin-top: 8px; display: flex; gap: 16px; }
.radio-row label { font-size: 0.84rem; color: var(--gray700); display: flex; gap: 6px; align-items: center; }
.buttons { margin-top: 6px; display: flex; gap: 8px; }
.save { background: var(--primary); color: #fff; border-radius: 10px; padding: 9px 14px; }
.history { border: 1px solid var(--gray200); padding: 18px; }
.history h2 { font-size: 0.95rem; color: var(--gray800); }
.history ul { margin-top: 10px; display: flex; flex-direction: column; gap: 8px; }
.history li { border: 1px solid var(--gray100); border-radius: 10px; padding: 10px; display: flex; justify-content: space-between; align-items: center; gap: 10px; }
.history li strong { color: var(--gray800); }
.history li span { margin-left: 6px; font-size: 0.74rem; color: var(--primary); font-weight: 700; }
.history li p { margin-top: 3px; font-size: 0.78rem; color: var(--gray500); }
.history li button { border: 1px solid var(--gray300); background: #fff; border-radius: 8px; padding: 6px 10px; font-size: 0.78rem; }
.history-empty {
  margin-top: 10px;
  color: var(--gray500);
  font-size: 0.82rem;
}
@media (max-width: 900px) {
  .header { flex-direction: column; }
}
</style>
