<template>
  <div class="tree-item">
    <div 
        class="node-label" 
        @click="toggle" 
        :class="{ 'has-children': node.children?.length }"
    >
      <span class="toggle-icon" v-if="node.children?.length || departmentUsers.length">
        {{ isOpen ? '▼' : '▶' }}
      </span>
      <span class="folder-icon">{{ isOpen ? '📂' : '📁' }}</span>
      <span class="node-name">{{ node.name }}</span>
    </div>
    <div v-show="isOpen" class="node-children">
      <!-- Users in this department -->
      <div 
        v-for="user in departmentUsers" 
        :key="user.id" 
        class="tree-user"
        :class="{ 'is-selected': isSelected(user.id) }"
        @click="$emit('select-user', user)"
      >
        <span class="user-avatar">👤</span>
        <span class="user-text">{{ user.name }} {{ user.position }}</span>
      </div>
      <!-- Sub-departments -->
      <div v-if="node.children && node.children.length">
        <TreeItem 
          v-for="child in node.children" 
          :key="child.id" 
          :node="child"
          :selected-users="selectedUsers"
          :mode="mode"
          @select-user="$emit('select-user', $event)"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  node: Object,
  selectedUsers: Array,
  mode: String
});

const emit = defineEmits(['select-user']);

const isOpen = ref(true);
const toggle = () => (isOpen.value = !isOpen.value);

const departmentUsers = computed(() => {
  return Array.isArray(props.node.users) ? props.node.users : [];
});

const isSelected = (userId) => props.selectedUsers.some(u => u.id === userId);
</script>

<style scoped>
.tree-item {
  margin-left: 10px;
}
.node-label {
  cursor: pointer;
  padding: 6px 8px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: background 0.2s;
}
.node-label:hover {
  background: #f0f0f0;
}
.toggle-icon {
  font-size: 0.7rem;
  width: 12px;
  color: #888;
}
.folder-icon {
  font-size: 1rem;
}
.node-name {
  font-size: 0.9rem;
  color: #333;
}
.node-children {
  margin-left: 12px;
}
.tree-user {
  padding: 6px 8px 6px 12px;
  cursor: pointer;
  border-radius: 4px;
  margin-left: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: background 0.2s;
}
.tree-user:hover {
  background-color: #f0f7ff;
}
.tree-user.is-selected {
  background-color: #e6f3ff;
  color: #0066cc;
  font-weight: 500;
}
.user-avatar {
  font-size: 0.9rem;
  color: #555;
}
.user-text {
  font-size: 0.85rem;
}
</style>
