<template>
  <div class="list-container">
    <div class="page-header">
      <div class="header-left">
        <button class="back-btn" @click="router.go(-1)">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <div>
          <div class="title-row">
            <h2>{{ pageTitle }}</h2>
            <span v-if="currentType === 'reference'" class="reference-badge">참조</span>
          </div>
          <p class="subtitle">{{ pageSubtitle }}</p>
        </div>
      </div>
      
      <div class="header-right">
        <div class="search-bar">
          <input type="text" v-model="searchQuery" placeholder="문서 제목, 기안자 검색..." class="search-input">
          <span class="search-icon">🔍</span>
        </div>
      </div>
    </div>

    <!-- Filter Bar -->
    <div class="filter-section">
      <div class="filter-tabs">
        <button 
          v-for="cat in filterOptions" 
          :key="cat.value"
          class="filter-tab"
          :class="{ active: currentFilter === cat.value }"
          @click="currentFilter = cat.value"
        >
          {{ cat.label }}
        </button>
      </div>
      <div class="sort-select">
        <select v-model="sortBy">
          <option value="date-desc">최신순</option>
          <option value="date-asc">오래된순</option>
        </select>
      </div>
    </div>

    <!-- List Table -->
    <div class="table-card">
      <table class="box-table">
        <thead>
          <tr>
            <th class="w-status">상태</th>
            <th class="w-category">카테고리</th>
            <th>제목</th>
            <th class="w-drafter">기안자</th>
            <th class="w-date">기안일</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in filteredList" :key="item.id" class="clickable-row" @click="openDetail(item)">
            <td>
              <span class="status-chip" :class="getStatusClass(item.status)">{{ item.status }}</span>
            </td>
            <td><span class="category-text">{{ item.category }}</span></td>
            <td class="title-cell">
              <span :class="item.isRead ? 'read-style' : 'unread-style'">{{ item.title }}</span>
              <p class="preview">{{ item.content }}</p>
            </td>
            <td>
              <div class="drafter-cell">
                <span class="drafter-name">{{ item.drafter }}</span>
                <span class="drafter-sub">{{ item.position }} / {{ item.department }}</span>
              </div>
            </td>
            <td class="date-text">{{ item.date }}</td>
          </tr>
          <tr v-if="filteredList.length === 0">
            <td colspan="5" class="empty-state">조회된 내역이 없습니다.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal -->
    <ApprovalDetailModal 
      :is-open="isDetailOpen" 
      :item="selectedItem" 
      @close="isDetailOpen = false"
      @action="handleModalAction"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { mockApprovalBox } from '@/utils/approvalData';
import ApprovalDetailModal from './components/ApprovalDetailModal.vue';
import {
  getCurrentApprovalUser,
  isUserRelatedApprovalDocument,
  matchesCurrentApprovalUser,
  isCurrentUserDrafterDocument
} from './utils/approvalVisibility';

const route = useRoute();
const router = useRouter();

const currentType = ref(route.params.type || 'all');
const allDocuments = ref([...mockApprovalBox]);
const searchQuery = ref('');
const currentFilter = ref('전체');
const sortBy = ref('date-desc');
const currentUser = getCurrentApprovalUser();

const isDetailOpen = ref(false);
const selectedItem = ref({});

const visibleDocuments = computed(() => allDocuments.value.filter((doc) => isUserRelatedApprovalDocument(doc, currentUser)));
const drafterDocuments = computed(() => allDocuments.value.filter((doc) => isCurrentUserDrafterDocument(doc, currentUser)));

const isReferenceDocumentForCurrentUser = (doc) => {
  if (doc?.status !== '완료') return false;
  if (!Array.isArray(doc?.referrers) || doc.referrers.length === 0) return false;
  return doc.referrers.some((referrer) => matchesCurrentApprovalUser(referrer, currentUser));
};

const isReceivedDocumentForCurrentUser = (doc) => {
  if (isCurrentUserDrafterDocument(doc, currentUser)) return false;
  if (matchesCurrentApprovalUser(doc?.currentApprover, currentUser)) return true;

  if (Array.isArray(doc?.approvalLine) && doc.approvalLine.some((line) => {
    if (!line) return false;
    return matchesCurrentApprovalUser(`${line.name || ''} ${line.position || ''}`, currentUser)
      || matchesCurrentApprovalUser(line.name, currentUser);
  })) {
    return true;
  }

  if (Array.isArray(doc?.referrers) && doc.referrers.some((referrer) => matchesCurrentApprovalUser(referrer, currentUser))) {
    return true;
  }

  return false;
};

const pageTitle = computed(() => {
  switch (currentType.value) {
    case 'all': return '전체 문서함';
    case 'received': return '수신 문서함';
    case 'ing': return '수신 문서함';
    case 'issue': return '보류/반려 문서함';
    case 'completed': return '완료 문서함';
    case 'temp': return '임시 보관함';
    case 'reference': return '참조 문서함';
    default: return '문서함';
  }
});

const pageSubtitle = computed(() => {
  if (currentType.value === 'reference') {
    return '참조자로 지정된 문서를 빠르게 확인할 수 있습니다.';
  }
  if (currentType.value === 'received' || currentType.value === 'ing') {
    return '내가 결재/참조로 수신한 문서를 확인할 수 있습니다.';
  }
  return `${pageTitle.value}의 모든 문서를 조회합니다.`;
});

const filterOptions = [
  { label: '전체', value: '전체' },
  { label: '휴가', value: '휴가 신청서' },
  { label: '유연근무', value: '유연근무 신청서' },
  { label: '외근/출장', value: '외근/출장 신청서' },
  { label: '연장근무', value: '연장근무 신청서' },
  { label: '휴직', value: '휴직신청서' },
  { label: '복직', value: '복직신청서' }
];

const getStatusClass = (status) => {
  switch (status) {
    case '완료': return 'status-completed';
    case '진행중': return 'status-ing';
    case '반려': return 'status-rejected';
    case '보류': return 'status-hold';
    case '임시저장': return 'status-temp';
    default: return '';
  }
};

const baseList = computed(() => {
  let list = [...visibleDocuments.value];
  
  // Type filtering
  if (currentType.value === 'received' || currentType.value === 'ing') list = list.filter(isReceivedDocumentForCurrentUser);
  else if (currentType.value === 'issue') list = list.filter(d => d.status === '반려' || d.status === '보류');
  else if (currentType.value === 'completed') list = list.filter(d => d.status === '완료');
  else if (currentType.value === 'temp') list = drafterDocuments.value.filter(d => d.status === '임시저장');
  else if (currentType.value === 'reference') list = list.filter(isReferenceDocumentForCurrentUser);
  
  return list;
});

const filteredList = computed(() => {
  let list = [...baseList.value];

  // Category Filter
  if (currentFilter.value !== '전체') {
    list = list.filter(d => d.category === currentFilter.value);
  }

  // Search
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    list = list.filter(d => 
      d.title.toLowerCase().includes(q) || 
      d.drafter.toLowerCase().includes(q)
    );
  }

  // Sorting
  list.sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return sortBy.value === 'date-desc' ? dateB - dateA : dateA - dateB;
  });

  return list;
});

const openDetail = (item) => {
  selectedItem.value = item;
  isDetailOpen.value = true;
  
  if (!item.isRead) {
    const doc = allDocuments.value.find(d => d.id === item.id);
    if (doc) doc.isRead = true;
  }
};

const handleModalAction = (action) => {
  if (action.type === 'redraft') {
    router.push({ name: 'approval-draft', query: { from: action.id, source: 'box' } });
  } else if (action.type === 'draft') {
    router.push({ name: 'approval-draft', query: { from: action.id, source: 'box' } });
  } else if (action.type === 'delete' || action.type === 'cancel') {
    allDocuments.value = allDocuments.value.filter(d => d.id !== action.id);
  } else if (action.type === 'review') {
    router.push({ name: 'approval-review' });
  }
  isDetailOpen.value = false;
};

watch(() => route.params.type, (newType) => {
  currentType.value = newType || 'all';
});
</script>

<style scoped>
.list-container {
  padding: 32px;
  min-height: 100%;
  background: var(--gray50);
  border-radius: 14px;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 18px 20px;
  border: 1px solid var(--gray200);
  border-radius: 14px;
  background: #fff;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.back-btn {
  width: 44px; height: 44px;
  border-radius: 14px;
  border: 1px solid #dee2e6;
  background: white;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; color: #868e96;
  transition: all 0.2s;
}

.back-btn:hover { background: #f8f9fa; color: #212529; border-color: #adb5bd; }

.page-header h2 { font-size: 1.6rem; font-weight: 800; color: #212529; margin-bottom: 6px; }
.subtitle { color: #868e96; font-size: 0.92rem; }

.title-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.reference-badge {
  display: inline-flex;
  align-items: center;
  height: 24px;
  padding: 0 10px;
  border-radius: 999px;
  background: #eff6ff;
  color: #1d4ed8;
  font-size: 0.72rem;
  font-weight: 700;
  border: 1px solid #dbeafe;
}

.search-bar {
  position: relative;
  width: 300px;
}

.search-input {
  width: 100%;
  padding: 12px 16px 12px 40px;
  border-radius: 10px;
  border: 1px solid #dee2e6;
  background: white;
  font-size: 0.85rem;
  transition: all 0.2s;
}

.search-input:focus { outline: none; border-color: #339af0; box-shadow: 0 0 0 3px rgba(51, 154, 240, 0.12); }

.search-icon {
  position: absolute; left: 14px; top: 12px;
  color: #adb5bd; font-size: 0.95rem;
}

.filter-section {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 16px;
  padding: 12px 14px;
  border: 1px solid var(--gray200);
  border-radius: 12px;
  background: #fff;
}

.filter-tabs { display: flex; gap: 8px; }

.filter-tab {
  padding: 10px 18px; border-radius: 10px;
  background: white; border: 1px solid #dee2e6;
  font-size: 0.86rem; font-weight: 700; color: #868e96;
  cursor: pointer; transition: all 0.2s;
}

.filter-tab:hover { background: #f8f9fa; color: #212529; }
.filter-tab.active { background: #f0f7ff; color: #339af0; border-color: #d0e7ff; }

.sort-select select {
  padding: 10px 16px; border-radius: 10px;
  border: 1px solid #dee2e6; background: white;
  font-size: 0.85rem; font-weight: 600; color: #495057;
  outline: none; cursor: pointer;
}

.table-card {
  background: white; border-radius: 14px;
  border: 1px solid var(--gray200);
  box-shadow: none;
  overflow: hidden;
}

.box-table { width: 100%; border-collapse: collapse; }

.box-table th {
  padding: 18px 24px; text-align: left;
  background: #f8f9fa; color: #868e96;
  font-size: 0.8rem; font-weight: 600;
  border-bottom: 1px solid #f1f3f5;
}

.box-table td { padding: 20px 24px; border-bottom: 1px solid #f8f9fa; vertical-align: middle; }

.clickable-row { cursor: pointer; transition: background 0.2s; }
.clickable-row:hover { background: #f8f9fa; }

.w-status { width: 100px; }
.w-category { width: 190px; min-width: 190px; }
.w-drafter { width: 220px; }
.w-date { width: 180px; }

.status-chip {
  padding: 6px 12px; border-radius: 8px;
  font-size: 0.75rem; font-weight: 800;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
  word-break: keep-all;
  line-height: 1;
}

.status-completed { background: #f2fcf5; color: #40c057; border: 1px solid #d3f9d8; }
.status-ing { background: #f0f7ff; color: #339af0; border: 1px solid #d0e7ff; }
.status-rejected { background: #fff5f5; color: #fa5252; border: 1px solid #ffe3e3; }
.status-hold { background: #fff9db; color: #f08c00; border: 1px solid #ffec99; }
.status-temp { background: #f1f3f5; color: #495057; border: 1px solid #e9ecef; }

.category-text {
  display: inline-flex;
  align-items: center;
  font-size: 0.82rem;
  font-weight: 600;
  color: #868e96;
  background: #f1f3f5;
  padding: 4px 8px;
  border-radius: 6px;
  white-space: nowrap;
  line-height: 1.2;
}

.box-table td:nth-child(2) {
  white-space: nowrap;
}

.title-cell { max-width: 500px; }
.unread-style { font-weight: 800; color: #212529; font-size: 1rem; }
.read-style { color: #339af0; text-decoration: underline; font-weight: 500; font-size: 1rem; }

.preview { margin-top: 4px; font-size: 0.85rem; color: #adb5bd; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.drafter-cell { display: flex; flex-direction: column; gap: 2px; }
.drafter-name { font-weight: 700; color: #495057; font-size: 0.9rem; }
.drafter-sub { font-size: 0.8rem; color: #adb5bd; }

.date-text { color: #868e96; font-size: 0.85rem; }

.empty-state { padding: 100px !important; text-align: center; color: #adb5bd; font-size: 1.05rem; }
</style>
