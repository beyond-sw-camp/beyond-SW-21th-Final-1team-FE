<template>
  <div class="kms-rich-editor" :class="{ 'is-readonly': readonly }">
    <div v-if="readonly" class="readonly-view ql-snow">
      <div class="ql-editor" v-html="readonlyContent" />
    </div>
    <QuillEditor
      v-else
      v-model:content="localContent"
      content-type="html"
      theme="snow"
      :toolbar="toolbarOptions"
      :read-only="readonly"
      :placeholder="placeholder"
      @update:content="handleUpdate"
    />
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: '내용을 입력하세요.'
  },
  readonly: {
    type: Boolean,
    default: false
  },
  compact: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue'])

const localContent = ref(props.modelValue)
const readonlyContent = computed(() => props.modelValue || '<p><br /></p>')

watch(() => props.modelValue, (value) => {
  if (value !== localContent.value) {
    localContent.value = value
  }
})

const toolbarOptions = computed(() => (
  props.readonly
    ? false
    : [
      [{ header: [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ color: [] }, { background: [] }],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ align: [] }],
      ['blockquote', 'code-block'],
      ['link', 'clean']
    ]
))

const handleUpdate = (value) => {
  emit('update:modelValue', value)
}
</script>

<style scoped>
.kms-rich-editor { width: 100%; }
.kms-rich-editor :deep(.ql-toolbar.ql-snow) {
  border: 1px solid var(--gray200);
  border-radius: 10px 10px 0 0;
  background: #f8fcff;
}
.kms-rich-editor :deep(.ql-container.ql-snow) {
  border: 1px solid var(--gray200);
  border-top: none;
  border-radius: 0 0 10px 10px;
  background: #fff;
  height: auto;
}
.kms-rich-editor :deep(.ql-editor) {
  min-height: 180px;
  max-height: 420px;
  overflow-y: auto;
  font-family: var(--font);
  font-size: 0.88rem;
  color: var(--gray700);
  line-height: 1.7;
}
.kms-rich-editor.is-readonly :deep(.ql-container.ql-snow) {
  border-top: 1px solid var(--gray200);
  border-radius: 10px;
}
.kms-rich-editor.is-readonly :deep(.ql-editor) {
  min-height: 220px;
  max-height: none;
  overflow-y: visible;
}
.readonly-view {
  border: 1px solid var(--gray200);
  border-radius: 10px;
  background: #fff;
}
.readonly-view :deep(.ql-editor) {
  min-height: 220px;
  font-family: var(--font);
  font-size: 0.88rem;
  color: var(--gray700);
  line-height: 1.7;
  padding: 12px;
}
</style>
