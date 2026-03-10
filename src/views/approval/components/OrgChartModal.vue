<template>
  <BaseModal :model-value="isOpen" width="1040px" @update:modelValue="handleBaseVisibility">
    <div class="modal-content">
      <div class="modal-header">
        <h3>{{ title }}</h3>
        <button class="close-btn" @click="close">&times;</button>
      </div>
      <div class="modal-body">
        <!-- Left: Org Chart -->
        <div class="panel org-chart-panel">
          <div class="panel-header">
            <h4>조직도</h4>
            <div class="search-box">
              <input 
                type="text" 
                v-model="searchQuery" 
                placeholder="이름/부서 검색..."
              />
              <span class="search-icon">🔍</span>
            </div>
          </div>
          <div class="tree-view">
             <!-- Search Results -->
             <div v-if="searchQuery" class="search-results">
                <div 
                    v-for="user in filteredUsers" 
                    :key="user.id" 
                    class="tree-user"
                    :class="{ 'is-selected': isSelected(user.id) }"
                    @click="selectUser(user)"
                >
                    <span class="user-avatar">👤</span>
                    <div class="user-detail">
                        <span class="user-name-pos">{{ user.name }} {{ user.position }}</span>
                        <span class="user-dept">{{ user.department }}</span>
                    </div>
                    <span v-if="user.canFinalize && mode === 'approval'" class="finalize-badge">전결</span>
                </div>
                <div v-if="filteredUsers.length === 0" class="empty-search">
                    검색 결과가 없습니다.
                </div>
             </div>
             <!-- Original Tree -->
             <div v-else v-for="node in orgChart" :key="node.id">
                <tree-item 
                  :node="node" 
                  @select-user="selectUser"
                  :selected-users="localSelection"
                  :mode="mode"
                />
             </div>
          </div>
        </div>

        <!-- Center: Action Buttons -->
        <div class="actions">
          <div class="arrow-icon">➡</div>
        </div>

        <!-- Right: Selected Users -->
        <div class="panel selection-panel">
          <div class="panel-header">
            <h4>
              {{ mode === 'approval' ? '결재선' : mode === 'receiver' ? '수신자' : '참조자' }}
              <span class="count" v-if="mode === 'receiver' || mode === 'referrer'">({{ localSelection.length }}/10)</span>
            </h4>
            <button class="clear-all" @click="localSelection = []">전체 해제</button>
          </div>
          
          <div class="selected-list" 
               @dragover.prevent 
               @drop="onDrop">
            <div 
              v-for="(user, index) in localSelection" 
              :key="user.id"
              class="selected-item"
              :draggable="mode === 'approval'"
              @dragstart="onDragStart($event, index)"
              @dragenter="onDragEnter($event, index)"
            >
              <span class="rank-badge" v-if="mode === 'approval'">{{ index + 1 }}</span>
              <div class="user-info">
                <span class="name">{{ user.name }}</span>
                <span class="position">{{ user.position }}</span>
                <span class="dept">{{ user.department }}</span>
                <span v-if="user.canFinalize && mode === 'approval'" class="finalize-badge-small">전결 가능</span>
              </div>
              <button class="remove-btn" @click="removeUser(index)">&times;</button>
            </div>
            <div v-if="localSelection.length === 0" class="empty-state">
              조직도에서 인원을 클릭하여 선택하세요.
            </div>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="cancel-btn" @click="close">취소</button>
        <button class="confirm-btn" @click="confirm">확인</button>
      </div>
    </div>
  </BaseModal>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { orgChart as rawOrgChart, mockUsers } from '@/utils/approvalData';
import TreeItem from './TreeItem.vue';
import BaseModal from '@/components/common/BaseModal.vue';


const props = defineProps({
  isOpen: Boolean,
  mode: {
    type: String,
    default: 'approval'
  },
  initialSelection: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['close', 'confirm']);

const orgChart = ref(rawOrgChart);
const localSelection = ref([]);
const searchQuery = ref('');

const filteredUsers = computed(() => {
    if (!searchQuery.value) return [];
    const lowerQuery = searchQuery.value.toLowerCase();
    return mockUsers.filter(user => 
        user.name.toLowerCase().includes(lowerQuery) || 
        user.department.toLowerCase().includes(lowerQuery)
    );
});

// Sync with props when modal opens
watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    localSelection.value = [...props.initialSelection];
    searchQuery.value = '';
  }
});

const title = computed(() => {
  if (props.mode === 'approval') return '결재선 설정';
  if (props.mode === 'receiver') return '수신자 설정';
  return '참조자 설정';
});

const isSelected = (userId) => localSelection.value.some(u => u.id === userId);

const selectUser = (user) => {
  const index = localSelection.value.findIndex(u => u.id === user.id);
  
  if (index !== -1) {
    removeUser(index);
  } else {
    if ((props.mode === 'receiver' || props.mode === 'referrer') && localSelection.value.length >= 10) {
      alert(props.mode === 'receiver' ? '수신자는 최대 10명까지 지정할 수 있습니다.' : '참조자는 최대 10명까지 지정할 수 있습니다.');
      return;
    }
    localSelection.value.push(user);
  }
};

const removeUser = (index) => {
  localSelection.value.splice(index, 1);
};

// Drag and Drop implementation
let draggingIndex = -1;

const onDragStart = (e, index) => {
    draggingIndex = index;
    e.dataTransfer.effectAllowed = 'move';
};

const onDragEnter = (e, index) => {
    if (draggingIndex !== index && draggingIndex !== -1) {
        const item = localSelection.value.splice(draggingIndex, 1)[0];
        localSelection.value.splice(index, 0, item);
        draggingIndex = index;
    }
};

const onDrop = () => {
    draggingIndex = -1;
};

const close = () => {
  emit('close');
};

const handleBaseVisibility = (nextValue) => {
  if (!nextValue) close();
};

const confirm = () => {
  emit('confirm', localSelection.value);
  close();
};

</script>

<style scoped>

.modal-content {
  width: 100%;
  height: calc(100vh - 180px);
  max-height: 700px;
  min-height: 520px;
  display: flex;
  flex-direction: column;
}

.modal-header {
  padding: 16px 20px;
  border-bottom: 1px solid var(--gray200);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.02rem;
  font-weight: 700;
  color: var(--gray800);
}

.close-btn {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  border: 1px solid transparent;
  background: transparent;
  color: var(--gray500);
  font-size: 1.2rem;
  line-height: 1;
  cursor: pointer;
}

.close-btn:hover {
  background: var(--gray100);
  border-color: var(--gray200);
  color: var(--gray700);
}

.modal-body {
  flex: 1;
  display: flex;
  padding: 16px;
  gap: 14px;
  overflow: hidden;
  background: #fff;
}

.panel {
  flex: 1;
  border: 1px solid var(--gray200);
  border-radius: 10px;
  background: #fff;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.panel-header {
  background: #fafbfc;
  padding: 10px 14px;
  border-bottom: 1px solid var(--gray200);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.panel-header h4 {
  margin: 0;
  border: none;
  background: none;
  padding: 0;
  font-size: 0.92rem;
  color: var(--gray700);
}

.search-box {
  position: relative;
  width: 220px;
}

.search-box input {
  width: 100%;
  padding: 7px 30px 7px 10px;
  border: 1px solid var(--gray300);
  border-radius: 8px;
  font-size: 0.85rem;
  color: var(--gray700);
  outline: none;
}

.search-box input:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(51, 154, 240, 0.12);
}

.search-icon {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--gray400);
  font-size: 0.8rem;
}

.clear-all {
    background: none;
    border: none;
    color: var(--primary);
    font-size: 0.8rem;
    cursor: pointer;
    font-weight: 600;
}

.tree-view, .selected-list {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
}

.search-results {
    padding: 10px 0;
}

.empty-search {
    text-align: center;
    color: #999;
    padding: 20px 0;
    font-size: 0.85rem;
}

/* Tree Item Styles */
:deep(.tree-item) {
  margin-left: 10px;
}
:deep(.node-label) {
  cursor: pointer;
  padding: 6px 8px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: background 0.2s;
}
:deep(.node-label:hover) {
  background: #f0f0f0;
}
:deep(.toggle-icon) {
  font-size: 0.7rem;
  width: 12px;
  color: #888;
}
:deep(.folder-icon) {
    font-size: 1rem;
}
:deep(.node-name) {
  font-size: 0.9rem;
  color: #333;
}
:deep(.tree-user) {
  padding: 6px 8px 6px 24px;
  cursor: pointer;
  border-radius: 4px;
  margin-left: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: background 0.2s;
}
:deep(.tree-user:hover) {
  background-color: #f0f7ff;
}
:deep(.tree-user.is-selected) {
  background-color: #e6f3ff;
  color: #0066cc;
  font-weight: 500;
}
:deep(.user-avatar) {
    font-size: 0.9rem;
    color: #555;
}
:deep(.finalize-badge) {
    background: #fff1f0;
    color: #cf1322;
    border: 1px solid #ffa39e;
    font-size: 0.7rem;
    padding: 0 4px;
    border-radius: 2px;
    margin-left: auto;
}

.search-results .tree-user {
    margin-left: 0;
    padding: 10px;
    border-bottom: 1px solid #f0f0f0;
}
.user-detail {
    display: flex;
    flex-direction: column;
    gap: 2px;
}
.user-name-pos {
    font-size: 0.9rem;
}
.user-dept {
    font-size: 0.75rem;
    color: #999;
}

/* Selected List Styles */
.selected-item {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  border: 1px solid var(--gray200);
  margin-bottom: 6px;
  background: white;
  border-radius: 8px;
  cursor: grab;
}

.selected-item:active {
  cursor: grabbing;
}

.rank-badge {
  background: var(--primary);
  color: white;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  margin-right: 12px;
  flex-shrink: 0;
}

.user-info {
  flex: 1;
  display: flex;
  align-items: baseline;
  gap: 8px;
  font-size: 0.9rem;
  flex-wrap: wrap;
}

.user-info .position {
  color: #666;
  font-size: 0.8rem;
}

.user-info .dept {
  color: #999;
  font-size: 0.8rem;
}

.finalize-badge-small {
    font-size: 0.7rem;
    color: #cf1322;
    background: #fff1f0;
    padding: 0 4px;
    border-radius: 2px;
    border: 1px solid #ffa39e;
}

.remove-btn {
  background: none;
  border: none;
  color: #ff4d4f;
  cursor: pointer;
  font-size: 1.2rem;
  padding: 0 4px;
  margin-left: auto;
}

.empty-state {
  text-align: center;
  color: #999;
  padding: 40px 0;
  font-size: 0.9rem;
}

.modal-footer {
  padding: 14px 20px;
  border-top: 1px solid var(--gray200);
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.cancel-btn {
  padding: 9px 16px;
  border: 1px solid var(--gray300);
  background: white;
  border-radius: 8px;
  cursor: pointer;
  color: var(--gray700);
  font-weight: 600;
}

.confirm-btn {
  padding: 9px 16px;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 700;
}
.confirm-btn:hover {
  background: var(--secondary);
}
</style>
