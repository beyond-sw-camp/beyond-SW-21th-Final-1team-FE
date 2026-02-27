<script setup>
import { ref, computed, reactive, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import {
  templates,
  mockUsers,
  mockApprovalLine,
  mockReferrers,
  mockReviewers,
  findApprovalDocument
} from '@/utils/approvalData';
import OrgChartModal from './components/OrgChartModal.vue';
import ConfirmModal from './components/ConfirmModal.vue';
import { useRoute } from 'vue-router';
import { REVIEW_FLOW_ENABLED } from './utils/featureFlags';

// State
const router = useRouter();
const route = useRoute();
const activeTemplate = ref('vacation');
const showTemplateMenu = ref(false);
const isModalOpen = ref(false);
const isConfirmModalOpen = ref(false);
const modalMode = ref('approval'); // 'approval' | 'reviewer' | 'referrer'
const templateSelectorRef = ref(null);

// Current User Mock
const currentUser = mockUsers.find(u => u.id === 'u1') || mockUsers[0]; // 홍길동 사원

// Document Info State
const docInfo = reactive({
  title: '',
  content: '',
  startDate: '',
  endDate: '',
  startTime: '09:00',
  endTime: '18:00',
  vacationType: '연차',
  attachments: []
});

const approvalLine = ref([]);
const reviewers = ref([]);
const referrers = ref([]);
const isReviewFlowEnabled = REVIEW_FLOW_ENABLED;

// Derived State
const currentTemplateName = computed(() => {
  return templates.find(t => t.id === activeTemplate.value)?.name || '기안서';
});

const currentTemplateTitle = computed(() => {
  const name = currentTemplateName.value;
  return name.split('').join(' '); // Add spaces for styling
});

const now = new Date();
const currentDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
const currentDateShort = now.toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' });

const contentPlaceholder = computed(() => {
  if (activeTemplate.value === 'reinstatement') return '복직 사유 및 계획을 입력하세요.';
  if (activeTemplate.value === 'leave') return '휴직 사유 및 연락처를 입력하세요.';
  if (activeTemplate.value === 'businessTrip') return '외근/출장 목적, 방문처, 이동수단, 소요비용을 입력하세요.';
  if (activeTemplate.value === 'overtime') return '연장근무 사유, 예상 작업시간, 완료 목표를 입력하세요.';
  return '내용을 입력하세요.\n\n1. 사유:\n2. 비상 연락망:\n3. 인수인계 사항:';
});

const vacationTypes = ['연차', '반차', '병가', '기타'];

const calculateDays = computed(() => {
    if (!docInfo.startDate || !docInfo.endDate) return 0;
    const start = new Date(docInfo.startDate);
    const end = new Date(docInfo.endDate);
    const diff = end - start;
    if (diff < 0) return 0;
    return Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;
});

const isReviewerStamped = (reviewer) => ['확인', '승인', '전결'].includes(reviewer?.status);
const reviewerStampDate = (reviewer) => {
  if (!isReviewerStamped(reviewer)) return '';
  const date = reviewer?.reviewedAt || reviewer?.date || currentDate;
  return new Date(date).toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' });
};

const templateByCategory = {
  '휴가 신청서': 'vacation',
  '유연근무 신청서': 'flexible',
  '외근/출장 신청서': 'businessTrip',
  '연장근무 신청서': 'overtime',
  '휴직신청서': 'leave',
  '복직신청서': 'reinstatement',
  // Legacy categories for old mock documents
  '품의서': 'overtime',
  '보고서': 'businessTrip',
  '기안서': 'businessTrip'
};

// Methods
const loadTestData = () => {
    approvalLine.value = activeTemplate.value === 'vacation' ? [] : [...mockApprovalLine];
    reviewers.value = isReviewFlowEnabled ? [...mockReviewers] : [];
    referrers.value = [...mockReferrers];
    docInfo.title = `${currentTemplateName.value} - ${currentUser.name}`;
    docInfo.content = '';
    docInfo.attachments = [];

    if (['vacation', 'flexible', 'businessTrip', 'overtime', 'leave'].includes(activeTemplate.value)) {
      docInfo.startDate = currentDate;
      docInfo.endDate = currentDate;
    } else {
      docInfo.startDate = '';
      docInfo.endDate = '';
    }
};

const loadFromData = (id, source) => {
    const doc = findApprovalDocument(id, source);
    if (!doc) {
      loadTestData();
      return;
    }

    const category = doc.category || doc.templateName;
    activeTemplate.value = templateByCategory[category] || 'businessTrip';
    docInfo.title = `[재상신] ${doc.title}`;
    docInfo.content = doc.content || '';
    docInfo.startDate = doc.startDate || '';
    docInfo.endDate = doc.endDate || '';
    docInfo.startTime = doc.startTime || '09:00';
    docInfo.endTime = doc.endTime || '18:00';

    if (doc.approvalLine) {
      // Re-map approval line (original line minus current status)
      approvalLine.value = doc.approvalLine
      .filter((a) => a.status !== '기안')
      .map(a => ({
        ...(mockUsers.find((u) => u.name === a.name && u.position === a.position) || {}),
        id: mockUsers.find((u) => u.name === a.name && u.position === a.position)?.id || '',
        name: a.name,
        position: a.position,
        department: mockUsers.find((u) => u.name === a.name && u.position === a.position)?.department || '소속팀'
      }));
    }

    reviewers.value = isReviewFlowEnabled && Array.isArray(doc.reviewers)
      ? doc.reviewers.map((r, idx) => {
          const matched = mockUsers.find((u) => `${u.name} ${u.position}` === r || u.name === r);
          if (matched) return matched;
          const [name, position] = String(r).split(' ');
          return { id: `rv-${idx}`, name: name || '검토자', position: position || '', department: '' };
        })
      : [];
    
    if (doc.referrers) {
      referrers.value = doc.referrers.map(r => ({
        id: Math.random().toString(36).substr(2, 9),
        name: r.split(' ')[0],
        position: r.split(' ')[1] || '',
        department: ''
      }));
    }
};

const handleClickOutside = (event) => {
    if (templateSelectorRef.value && !templateSelectorRef.value.contains(event.target)) {
        showTemplateMenu.value = false;
    }
};

// Initialize with test data
onMounted(() => {
    const fromId = route.query.from;
    const source = route.query.source || 'box';
    if (fromId) {
      loadFromData(fromId, source);
    } else {
      loadTestData();
    }
    window.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
    window.removeEventListener('click', handleClickOutside);
});

const selectTemplate = (id) => {
  activeTemplate.value = id;
  showTemplateMenu.value = false;
  // Reset fields if needed
  loadTestData(); // Re-load basic data for new template
};

const openModal = (mode) => {
  if (!isReviewFlowEnabled && mode === 'reviewer') return;
  modalMode.value = mode;
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
};

const getEmployeeNumber = (user) => {
  if (!user) return '';
  return String(user.employeeNo || user.empNo || user.id || '').trim();
};

const getDuplicateUsers = (approvers, reviewerList) => {
  const reviewerEmpNoSet = new Set((reviewerList || []).map(getEmployeeNumber).filter(Boolean));
  return (approvers || []).filter((approver) => reviewerEmpNoSet.has(getEmployeeNumber(approver)));
};

const hasApprovalReviewerConflict = computed(() => {
  if (!isReviewFlowEnabled) return false;
  return getDuplicateUsers(approvalLine.value, reviewers.value).length > 0;
});

const handleModalConfirm = (selectedUsers) => {
  if (modalMode.value === 'approval') {
    const duplicates = getDuplicateUsers(selectedUsers, reviewers.value);
    if (duplicates.length > 0) {
      const duplicateNames = duplicates.map((user) => `${user.name}${user.position ? ` ${user.position}` : ''}`).join(', ');
      alert(`결재자와 검토자는 동일할 수 없습니다.\n중복 인원: ${duplicateNames}`);
      return;
    }
    approvalLine.value = selectedUsers;
  } else if (modalMode.value === 'reviewer') {
    if (!isReviewFlowEnabled) return;
    const duplicates = getDuplicateUsers(approvalLine.value, selectedUsers);
    if (duplicates.length > 0) {
      const duplicateNames = duplicates.map((user) => `${user.name}${user.position ? ` ${user.position}` : ''}`).join(', ');
      alert(`결재자와 검토자는 동일할 수 없습니다.\n중복 인원: ${duplicateNames}`);
      return;
    }
    reviewers.value = selectedUsers;
  } else {
    referrers.value = selectedUsers;
  }
};

const tempSave = () => {
  alert('임시 저장되었습니다.\n(임시 보관함으로 이동합니다)');
};

const submitApproval = () => {
  if (!docInfo.title) return alert('제목을 입력해주세요.');
  if (hasApprovalReviewerConflict.value) {
    const duplicateNames = getDuplicateUsers(approvalLine.value, reviewers.value)
      .map((user) => `${user.name}${user.position ? ` ${user.position}` : ''}`)
      .join(', ');
    return alert(`결재자와 검토자가 중복되어 상신할 수 없습니다.\n중복 인원: ${duplicateNames}`);
  }
  if (approvalLine.value.length === 0) {
      if(!confirm('결재선이 지정되지 않았습니다. 계속 진행하시겠습니까?')) return;
  }
  
  isConfirmModalOpen.value = true;
};

const finalizeSubmission = () => {
  alert(`[${currentTemplateName.value}] 기안이 상신되었습니다.\n결재 현황 페이지로 이동합니다.`);
  router.push('/approval/status');
};

const confirmMessage = computed(() => {
  if (isReviewFlowEnabled) return '선택하신 결재선/검토자 정보로 기안서를 상신하시겠습니까?';
  return '선택하신 결재선 정보로 기안서를 상신하시겠습니까?';
});

</script>

<template>
  <div class="draft-container">
    <!-- Top Toolbar -->
    <header class="toolbar">
      <div class="toolbar-left">
        <h2>기안 작성</h2>
        <div class="divider"></div>
        <div class="template-selector" ref="templateSelectorRef">
          <button class="template-btn" @click.stop="showTemplateMenu = !showTemplateMenu">
            <span class="icon">📄</span>
            {{ currentTemplateName }}
            <span class="arrow">▼</span>
          </button>
          <div v-if="showTemplateMenu" class="dropdown-menu">
            <div 
              v-for="tpl in templates" 
              :key="tpl.id" 
              class="dropdown-item"
              @click="selectTemplate(tpl.id)"
            >
              {{ tpl.name }}
            </div>
          </div>
        </div>
      </div>
      <div class="toolbar-right">
        <button class="btn btn-secondary" @click="tempSave">임시저장</button>
        <button class="btn btn-primary" @click="submitApproval">상신</button>
      </div>
    </header>

    <!-- Main Content Area -->
    <main class="content-area">
      <div class="paper">
        <!-- Title -->
        <div class="doc-header">
          <h1>{{ currentTemplateTitle }}</h1>
        </div>

        <!-- Info Area: Drafter & Approval Line -->
        <div class="info-section">
          <!-- Drafter Info -->
          <table class="info-table drafter-table">
            <tbody>
              <tr>
                <td class="label">기안자</td>
                <td>{{ currentUser.name }}</td>
              </tr>
              <tr>
                <td class="label">소속</td>
                <td>{{ currentUser.department }}</td>
              </tr>
              <tr>
                <td class="label">기안일</td>
                <td>{{ currentDate }}</td>
              </tr>
              <tr>
                <td class="label">문서번호</td>
                <td class="text-gray">자동채번</td>
              </tr>
            </tbody>
          </table>

          <!-- Approval Line -->
          <div class="approval-line-panel">
            <div class="approval-line-header">
              <button type="button" class="btn-xs" @click="openModal('approval')">결재선 수정</button>
              <button v-if="isReviewFlowEnabled" type="button" class="btn-xs" @click="openModal('reviewer')">
                {{ reviewers.length > 0 ? '검토선 수정' : '검토선 추가' }}
              </button>
            </div>

            <div class="approval-line-container">
            <!-- Drafter (Fixed) -->
            <div class="approval-box">
              <div class="box-header">기안</div>
              <div class="box-content">
                <div class="signature">
                  <!-- Text (Foreground) - Stamp removed during drafting -->
                  <div class="signature-text">
                    <span class="name">{{ currentUser.name }}</span>
                  </div>
                </div>
              </div>
              <div class="box-date">{{ currentDateShort }}</div>
            </div>

            <!-- Approvers -->
            <div 
              v-for="(approver, index) in approvalLine" 
              :key="approver.id" 
              class="approval-box"
            >
              <div class="box-header">결재자 {{ index + 1 }}</div>
              <div class="box-content">
                <div class="signature">
                  <!-- Empty for now as requested -->
                  <div class="signature-text">
                    <span class="name">{{ approver.name }}</span>
                    <span class="position">{{ approver.position }}</span>
                  </div>
                </div>
              </div>
              <div class="box-date"></div> <!-- Empty for pending approvers -->
            </div>
            </div>

            <div v-if="isReviewFlowEnabled && reviewers.length > 0" class="review-line-container">
              <div
                v-for="(reviewer, index) in reviewers"
                :key="`reviewer-${reviewer.id}`"
                class="approval-box reviewer-box"
              >
                <div class="box-header">검토자 {{ index + 1 }}</div>
                <div class="box-content">
                  <div class="signature">
                    <div v-if="isReviewerStamped(reviewer)" class="real-stamp">
                      <div
                        class="stamp-inner"
                        :class="{
                          'vertical': (reviewer.name || '').length === 3,
                          'grid-2x2': (reviewer.name || '').length === 4
                        }"
                      >
                        <span
                          class="char"
                          v-for="(c, cIdx) in (reviewer.name || '')"
                          :key="cIdx"
                        >
                          {{ c }}
                        </span>
                      </div>
                    </div>
                    <div class="signature-text">
                      <span class="name">{{ reviewer.name }}</span>
                      <span class="position">{{ reviewer.position }}</span>
                    </div>
                  </div>
                </div>
                <div class="box-date">{{ reviewerStampDate(reviewer) }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Referrers Section -->
         <div class="referrer-section" v-if="referrers.length > 0">
            <span class="section-label">참조:</span>
            <div class="referrer-list">
                <span v-for="refItem in referrers" :key="refItem.id" class="referrer-tag">
                    {{ refItem.name }} ({{ refItem.position }})
                </span>
            </div>
             <button class="btn-xs" @click="openModal('referrer')">수정</button>
         </div>
         <div class="referrer-section" v-else>
            <span class="section-label">참조:</span>
            <button class="btn-xs" @click="openModal('referrer')"> + 참조자 추가</button>
         </div>

        <!-- Document Body Form -->
        <table class="form-table">
          <tbody>
            <tr>
              <td class="label">제목</td>
              <td>
                <input 
                  type="text" 
                  v-model="docInfo.title" 
                  placeholder="제목을 입력하세요" 
                  class="input-full"
                />
              </td>
            </tr>
            <tr v-if="['vacation', 'businessTrip', 'overtime', 'leave', 'reinstatement'].includes(activeTemplate)">
              <td class="label">기간</td>
              <td class="date-range">
                <div class="datetime-input">
                  <input type="date" v-model="docInfo.startDate" class="input-date" />
                  <input type="time" v-model="docInfo.startTime" class="input-time" />
                </div>
                <span v-if="activeTemplate !== 'reinstatement'">~</span>
                <div class="datetime-input" v-if="activeTemplate !== 'reinstatement'">
                  <input type="date" v-model="docInfo.endDate" class="input-date" />
                  <input type="time" v-model="docInfo.endTime" class="input-time" />
                </div>
                <span class="hint" v-if="docInfo.startDate && docInfo.endDate && activeTemplate !== 'reinstatement'">
                  (총 {{ calculateDays }}일)
                </span>
              </td>
            </tr>
            <tr v-if="activeTemplate === 'vacation'">
               <td class="label">휴가 종류</td>
               <td>
                 <div class="radio-group">
                   <label v-for="type in vacationTypes" :key="type">
                     <input type="radio" v-model="docInfo.vacationType" :value="type" />
                     {{ type }}
                   </label>
                 </div>
               </td>
            </tr>
             <tr>
              <td class="label">내용</td>
              <td class="content-cell">
                <textarea 
                  v-model="docInfo.content" 
                  class="textarea-full" 
                  :placeholder="contentPlaceholder"
                ></textarea>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Attachments -->
        <div class="attachments-area">
          <span class="label">첨부파일</span>
          <button class="btn-sm">파일 찾기</button>
          <span class="hint">파일을 마우스로 끌어놓으세요.</span>
        </div>
      </div>
    </main>

    <!-- Modal -->
    <OrgChartModal 
      :is-open="isModalOpen"
      :mode="modalMode"
      :initial-selection="modalMode === 'approval' ? approvalLine : (isReviewFlowEnabled && modalMode === 'reviewer' ? reviewers : referrers)"
      @close="closeModal"
      @confirm="handleModalConfirm"
    />

    <!-- Confirm Modal -->
    <ConfirmModal
      :is-open="isConfirmModalOpen"
      title="상신 확인"
      :message="confirmMessage"
      confirm-text="상신"
      @close="isConfirmModalOpen = false"
      @confirm="finalizeSubmission"
    />
  </div>
</template>

<style scoped>
/* Reset & Layout */
.draft-container {
  display: flex;
  flex-direction: column;
  height: 100%; /* 부모(main-content) 높이를 채움 */
  background-color: #f5f7fa;
  overflow: hidden;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
}

/* Toolbar */
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 24px;
  background: white;
  border-bottom: 1px solid #e1e4e8;
  height: 64px;
  position: sticky;
  top: 0;
  z-index: 50;
  flex-shrink: 0;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.toolbar h2 {
  font-size: 1.1rem;
  font-weight: 700;
  color: #333;
  margin: 0;
}

.divider {
  width: 1px;
  height: 16px;
  background: #ddd;
}

.template-selector {
  position: relative;
}

.template-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
}

.template-btn:hover {
  background: #f8f9fa;
  border-color: #c0c4cc;
}

.icon {
  font-size: 1rem;
}

.arrow {
  font-size: 0.7rem;
  color: #666;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 4px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  min-width: 160px;
  z-index: 100;
  overflow: hidden;
}

.dropdown-item {
  padding: 10px 16px;
  font-size: 0.9rem;
  color: #333;
  cursor: pointer;
}

.dropdown-item:hover {
  background: #f0f7ff;
  color: #0066cc;
}

.toolbar-right {
  display: flex;
  gap: 8px;
}

.btn {
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-secondary {
  background: white;
  border: 1px solid #ddd;
  color: #555;
}

.btn-secondary:hover {
  background: #f8f9fa;
  color: #333;
}

.btn-primary {
  background: #0066cc;
  color: white;
  box-shadow: 0 2px 4px rgba(0, 102, 204, 0.2);
}

.btn-primary:hover {
  background: #0052a3;
  transform: translateY(-1px);
}

/* Content Area */
.content-area {
  flex: 1;
  overflow-y: auto;
  padding: 32px;
  display: flex;
  justify-content: center;
}

.paper {
  width: 900px; /* A4-ish width */
  min-height: 1000px;
  background: white;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
  border: 1px solid #e1e4e8;
  padding: 60px;
}

/* Document Header */
.doc-header {
  text-align: center;
  margin-bottom: 50px;
}

.doc-header h1 {
  font-family: serif;
  font-size: 2.2rem;
  font-weight: 700;
  color: #111;
  text-decoration: underline;
  text-underline-offset: 12px;
  text-decoration-thickness: 2px;
  text-decoration-color: #ddd;
  margin: 0;
}

/* Info Section (Drafter & Approval Line) */
.info-section {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 40px;
  gap: 20px;
}

.info-table {
  border-collapse: collapse;
  width: 320px;
  font-size: 0.85rem;
}

.info-table td {
  border: 1px solid #ccc;
  padding: 8px;
  text-align: center;
}

.info-table .label {
  background: #f3f3f3;
  font-weight: 600;
  width: 90px;
}

.text-gray {
  color: #999;
}

/* Approval Line Boxes */
.approval-line-panel {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.approval-line-header {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 6px;
  padding: 0 2px;
}


.approval-line-container {
  display: flex;
  gap: 4px;
}

.review-line-container {
  display: flex;
  gap: 4px;
}

.approval-box {
  border: 1px solid #ccc;
  display: flex;
  flex-direction: column;
  width: 90px;
}

.reviewer-box .box-header {
  background: #eef8ff;
  color: #1e4e7a;
}

.placeholder-box .box-content {
  background: #fafcff;
}

.empty-box-text {
  font-size: 0.74rem;
  color: #8aa7c4;
  text-align: center;
}

.box-header {
  background: #f3f3f3;
  border-bottom: 1px solid #ccc;
  text-align: center;
  font-size: 0.8rem;
  font-weight: 600;
  padding: 4px 0;
}

.box-content {
  flex: 1;
  min-height: 80px;
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
  height: 80px;
}

.signature-text {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 2;
  text-align: center;
  pointer-events: none;
}

.signature-text .name {
  font-size: 0.95rem;
  font-weight: 600;
  color: #111;
  z-index: 2;
}

.signature-text .position {
  font-size: 0.75rem;
  color: #666;
  z-index: 2;
}

/* Real Seal Style Stamp */
.real-stamp {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(-3deg);
  width: 46px;
  height: 58px;
  border: 1.5px solid rgba(207, 19, 34, 0.6); /* Slightly transparent border */
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(207, 19, 34, 0.03);
  user-select: none;
  pointer-events: none;
  z-index: 1;
}

.real-stamp.pending {
    opacity: 0.1;
    filter: grayscale(0.8);
}

.stamp-inner {
  width: 85%;
  height: 85%;
  display: flex;
}

/* 3 characters: Vertical stack */
.stamp-inner.vertical {
  flex-direction: column;
  align-items: center;
  justify-content: space-around;
  padding: 2px 0;
}
.stamp-inner.vertical .char {
    font-size: 0.85rem;
    height: 33%;
}

/* 4 characters: 2x2 grid */
.stamp-inner.grid-2x2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
}
.stamp-inner.grid-2x2 .char {
    font-size: 0.95rem;
}

.stamp-inner .char {
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Gungsuh', 'GungsuhChe', 'Batang', serif;
  font-weight: 800;
  color: #cf1322;
  line-height: 1;
  transform: scaleY(1.1);
}

.box-date {
  border-top: 1px solid #ccc;
  background: #fafafa;
  font-size: 0.7rem;
  text-align: center;
  color: #666;
  padding: 2px 0;
}

/* Referrer Section */
.referrer-section {
    margin-bottom: 20px;
    font-size: 0.9rem;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px;
    background: #f8f9fa;
    border-radius: 4px;
}
.section-label { font-weight: 600; color: #555; }
.referrer-list { display: flex; gap: 8px; flex-wrap: wrap; }
.referrer-tag {
    background: white;
    border: 1px solid #ddd;
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 0.85rem;
    color: #333;
}
.btn-xs {
    padding: 2px 8px;
    font-size: 0.8rem;
    border: 1px solid #ddd;
    background: white;
    cursor: pointer;
    border-radius: 4px;
}

/* Form Table */
.form-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 30px;
  font-size: 0.9rem;
}

.form-table td {
  border: 1px solid #ccc;
  padding: 12px;
}

.form-table .label {
  background: #f3f3f3;
  font-weight: 600;
  width: 120px;
  text-align: center;
}

.input-full {
  width: 100%;
  border: none;
  outline: none;
  font-size: 0.95rem;
}

.date-range {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.datetime-input {
  display: flex;
  align-items: center;
  gap: 0;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: white;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.datetime-input:focus-within {
  border-color: #0066cc;
  box-shadow: 0 0 0 2px rgba(0, 102, 204, 0.1);
}

.input-date, .input-time {
  border: none;
  padding: 8px 12px;
  font-family: inherit;
  font-size: 0.9rem;
  outline: none;
  color: #333;
  background: transparent;
}

.input-date {
  width: 155px;
}

.input-time {
  width: 145px;
  border-left: 1px solid #eee;
}

.hint {
  font-size: 0.85rem;
  color: #0066cc;
  font-weight: 500;
  margin-left: 5px;
}

.radio-group {
  display: flex;
  gap: 16px;
}

.radio-group label {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
}

.radio-group input[type="radio"] {
  accent-color: #0066cc;
}

.content-cell {
  height: 400px;
  vertical-align: top;
}

.textarea-full {
  width: 100%;
  height: 100%;
  border: none;
  outline: none;
  resize: none;
  font-family: inherit;
  font-size: 0.95rem;
  line-height: 1.6;
}

/* Attachments */
.attachments-area {
  border: 1px solid #ccc;
  background: #f9f9f9;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.attachments-area .label {
  font-weight: 600;
  font-size: 0.9rem;
  color: #333;
}

.btn-sm {
  padding: 4px 12px;
  font-size: 0.85rem;
  border: 1px solid #ccc;
  background: white;
  border-radius: 4px;
  cursor: pointer;
}

.btn-sm:hover {
  background: #eee;
}

@media (max-width: 1200px) {
  .content-area {
    padding: 20px;
  }

  .paper {
    width: 100%;
    min-height: auto;
    padding: 36px 28px;
  }

  .info-section {
    flex-direction: column;
    align-items: stretch;
  }

  .info-table {
    width: 100%;
  }

  .approval-line-container {
    overflow-x: auto;
    padding-bottom: 4px;
  }
}

@media (max-width: 900px) {
  .toolbar {
    height: auto;
    padding: 10px 14px;
    align-items: flex-start;
    flex-direction: column;
    gap: 10px;
  }

  .toolbar-left, .toolbar-right {
    width: 100%;
    justify-content: space-between;
  }

  .content-area {
    padding: 12px;
  }

  .paper {
    padding: 20px 14px;
  }

  .date-range {
    flex-direction: column;
    align-items: flex-start;
  }
}

@media (max-width: 640px) {
  .toolbar-left {
    gap: 8px;
    flex-wrap: wrap;
  }

  .template-btn {
    font-size: 0.82rem;
    padding: 6px 8px;
  }

  .btn {
    padding: 8px 12px;
    font-size: 0.82rem;
  }

  .reviewer-section,
  .referrer-section {
    flex-direction: column;
    align-items: flex-start;
  }

  .content-cell {
    height: 280px;
  }
}

</style>
