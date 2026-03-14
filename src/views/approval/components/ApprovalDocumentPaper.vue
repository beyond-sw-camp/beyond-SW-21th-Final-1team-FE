<template>
  <div class="paper">
    <div class="doc-header">
      <h1>{{ formalTitle }}</h1>
    </div>

    <div class="info-section">
      <table class="info-table drafter-table">
        <tbody>
          <tr>
            <td class="label">기안자</td>
            <td>{{ item.drafter || '-' }}</td>
          </tr>
          <tr>
            <td class="label">소속</td>
            <td>{{ item.department || '-' }}</td>
          </tr>
          <tr>
            <td class="label">기안일</td>
            <td>{{ (item.date || item.draftDate || '').split(' ')[0] || '-' }}</td>
          </tr>
          <tr>
            <td class="label">문서번호</td>
            <td class="text-gray">{{ item.id || '-' }}</td>
          </tr>
        </tbody>
      </table>

      <div class="approval-line-container">
        <div
          v-for="(step, index) in normalizedApprovalLine"
          :key="index"
          class="approval-box"
        >
          <div class="box-header">{{ index === 0 ? '기안' : `결재자 ${index}` }}</div>
          <div class="box-content">
            <div class="signature">
              <div v-if="step.status === '승인' || step.status === '기안' || step.status === '확인'" class="real-stamp">
                <div class="stamp-inner" :class="{ 'vertical': (step.name || '').length === 3, 'grid-2x2': (step.name || '').length === 4 }">
                  <span class="char" v-for="(c, idx) in (step.name || '')" :key="idx">{{ c }}</span>
                </div>
              </div>
              <div class="signature-text">
                <span class="name">{{ step.name }}</span>
                <span class="position">{{ step.position }}</span>
              </div>
            </div>
          </div>
          <div class="box-date">{{ shouldShowApprovalDate(step) ? formatShortDate(step.date) : '' }}</div>
        </div>
      </div>
    </div>

    <div class="referrer-section">
      <span class="section-label">참조:</span>
      <div class="referrer-list">
        <span v-if="!hasReferrers" class="referrer-tag">-</span>
        <span v-else v-for="(refItem, idx) in item.referrers" :key="idx" class="referrer-tag">
          {{ formatPerson(refItem) }}
        </span>
      </div>
    </div>

    <div class="referrer-section">
      <span class="section-label">수신:</span>
      <div class="referrer-list">
        <span v-if="!hasReceivers" class="referrer-tag">-</span>
        <span v-else v-for="(receiver, idx) in item.receivers" :key="idx" class="referrer-tag">
          {{ formatPerson(receiver) }}
        </span>
      </div>
    </div>

    <table class="form-table">
      <tbody>
        <tr>
          <td class="label">제목</td>
          <td class="value-cell">{{ item.title || '-' }}</td>
        </tr>
        <tr>
          <td class="label">카테고리</td>
          <td class="value-cell">{{ item.category || item.templateName || '-' }}</td>
        </tr>
        <tr v-if="item.startDate || item.endDate">
          <td class="label">기간</td>
          <td class="value-cell">
            {{ item.startDate }} {{ item.startTime }} ~ {{ item.endDate }} {{ item.endTime }}
          </td>
        </tr>
        <tr>
          <td class="label">내용</td>
          <td class="content-cell">
            <div class="content-text">{{ item.content || '상세 본문 데이터가 없습니다.' }}</div>
          </td>
        </tr>
      </tbody>
    </table>

    <div v-if="item.attachments && item.attachments.length > 0" class="attachments-area">
      <span class="label">첨부파일</span>
      <div class="file-list">
        <button
          v-for="file in item.attachments"
          :key="file?.fileId || file?.name || file"
          type="button"
          class="file-tag"
          @click="downloadAttachment(file)"
        >
          📄 {{ typeof file === 'string' ? file : (file?.name || '첨부파일') }}
        </button>
      </div>
    </div>

    <div v-if="isRejectedStatus && item.rejectReason" class="reject-display">
      <div class="reject-title">반려 사유</div>
      <div class="reject-text">{{ item.rejectReason }}</div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { downloadApprovalAttachment } from '@/api/approval';

const props = defineProps({
  item: {
    type: Object,
    required: true
  }
});

const isRejectedStatus = computed(() => {
  return props.item.status === '반려';
});

const hasReferrers = computed(() => {
  return Array.isArray(props.item.referrers) && props.item.referrers.length > 0;
});

const hasReceivers = computed(() => {
  return Array.isArray(props.item.receivers) && props.item.receivers.length > 0;
});

const formatPerson = (value) => {
  if (!value) return '-';
  if (typeof value === 'string') return value;
  const name = value.name || value.receiverName || value.referencerName || '';
  const position = value.position || value.rank || value.receiverRank || value.referenceRank || '';
  return [name, position].filter(Boolean).join(' ');
};

const formalTitle = computed(() => {
  const category = props.item.category || props.item.templateName || '기안서';
  let title = category;
  if (category === '휴가 신청서') title = '휴가 신청서';
  else if (category === '유연근무 신청서') title = '유연근무 신청서';
  else if (category === '외근/출장 신청서') title = '외근/출장 신청서';
  else if (category === '연장근무 신청서') title = '연장근무 신청서';
  else if (category === '휴직신청서') title = '휴직신청서';
  else if (category === '복직신청서') title = '복직신청서';

  return title.split('').join('  ');
});

const normalizedApprovalLine = computed(() => {
  const baseLine = Array.isArray(props.item.approvalLine) ? [...props.item.approvalLine] : [];
  const firstStep = baseLine[0];
  const drafterName = props.item.drafter || '';
  const drafterDate = (props.item.date || props.item.draftDate || '').split(' ')[0] || '';

  if (!drafterName) return baseLine;

  if (!firstStep || firstStep.status !== '기안') {
    return [
      { name: drafterName, position: props.item.position || '기안자', status: '기안', date: drafterDate },
      ...baseLine
    ];
  }

  return baseLine;
});

const shouldShowApprovalDate = (step) => {
  if (!step?.date || step.date === '-') return false;
  return ['기안', '승인', '확인', '전결'].includes(step.status);
};

const formatShortDate = (dateStr) => {
  if (!dateStr) return '';
  const dateOnly = String(dateStr).split(' ')[0].split('T')[0];
  const parts = dateOnly.split('-');
  if (parts.length === 3) {
    return `${parts[1]}. ${parts[2]}.`;
  }
  return dateOnly;
};

const downloadAttachment = async (file) => {
  if (!file?.approvalId || !file?.fileId) return
  try {
    const { blob, filename } = await downloadApprovalAttachment(file.approvalId, file.fileId)
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename || file?.name || 'attachment'
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  } catch (error) {
    alert(error?.response?.data?.error?.message || '첨부파일 다운로드에 실패했습니다.')
  }
}
</script>

<style scoped>
.paper {
  width: 100%;
  background: white;
  padding: 24px;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
}

.doc-header {
  text-align: center;
  margin-bottom: 24px;
}

.doc-header h1 {
  font-family: serif;
  font-size: 1.7rem;
  font-weight: 700;
  color: #111;
  text-decoration: underline;
  text-underline-offset: 10px;
  text-decoration-thickness: 2px;
  text-decoration-color: #ddd;
  margin: 0;
}

.info-section {
  display: flex;
  justify-content: space-between;
  margin-bottom: 14px;
  gap: 12px;
}

.info-table {
  border-collapse: collapse;
  width: 280px;
  font-size: 0.85rem;
}

.info-table td {
  border: 1px solid #ccc;
  padding: 6px;
  text-align: center;
}

.info-table .label {
  background: #f3f3f3;
  font-weight: 600;
  width: 80px;
}

.text-gray {
  color: #666;
}

.approval-line-container {
  display: flex;
  gap: 4px;
}

.approval-box {
  border: 1px solid #ccc;
  display: flex;
  flex-direction: column;
  width: 85px;
}

.box-header {
  background: #f3f3f3;
  border-bottom: 1px solid #ccc;
  text-align: center;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 3px 0;
}

.box-content {
  flex: 1;
  min-height: 62px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
}

.signature {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 62px;
}

.signature-text {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 2;
  text-align: center;
}

.signature-text .name {
  font-size: 0.9rem;
  font-weight: 600;
  color: #111;
}

.signature-text .position {
  font-size: 0.7rem;
  color: #666;
}

.real-stamp {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(-3deg);
  width: 42px;
  height: 54px;
  border: 1.2px solid rgba(207, 19, 34, 0.5);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(207, 19, 34, 0.02);
  z-index: 1;
}

.stamp-inner {
  width: 85%;
  height: 85%;
  display: flex;
}

.stamp-inner.vertical {
  flex-direction: column;
  align-items: center;
  justify-content: space-around;
}

.stamp-inner.grid-2x2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
}

.stamp-inner .char {
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: serif;
  font-weight: 800;
  color: #cf1322;
  line-height: 1;
}

.box-date {
  border-top: 1px solid #ccc;
  background: #fafafa;
  font-size: 0.65rem;
  text-align: center;
  color: #666;
  padding: 1px 0;
}

.referrer-section {
  margin-bottom: 10px;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #f8f9fa;
  border-radius: 6px;
}

.section-label { font-weight: 600; color: #555; }
.referrer-list { display: flex; gap: 6px; flex-wrap: wrap; }
.referrer-tag {
  background: white;
  border: 1px solid #e1e4e8;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  color: #444;
}

.form-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 12px;
  font-size: 0.9rem;
}

.form-table td {
  border: 1px solid #ccc;
  padding: 8px 12px;
}

.form-table .label {
  background: #f3f3f3;
  font-weight: 600;
  width: 100px;
  text-align: center;
}

.value-cell {
  background: white;
}

.content-cell {
  height: 180px;
  vertical-align: top;
}

.content-text {
  line-height: 1.6;
  white-space: pre-wrap;
  color: #333;
}

.attachments-area {
  border: 1px solid #ccc;
  background: #f9f9f9;
  padding: 8px 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 0.85rem;
}

.attachments-area .label {
  font-weight: 600;
  color: #555;
}

.file-list {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.file-tag {
  background: white;
  border: 1px solid #ddd;
  padding: 2px 8px;
  border-radius: 4px;
  cursor: pointer;
  color: #334155;
  font-size: 0.82rem;
  transition: background-color 0.15s ease, border-color 0.15s ease;
}

.file-tag:hover {
  background: #eef6ff;
  border-color: #cdddf6;
}

.reject-display {
  margin-top: 20px;
  padding: 15px;
  background: #fff1f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
}

.reject-title {
  font-weight: 800;
  color: #dc2626;
  margin-bottom: 8px;
  font-size: 0.9rem;
}

.reject-text {
  color: #b91c1c;
  font-size: 0.85rem;
  line-height: 1.5;
}
</style>
