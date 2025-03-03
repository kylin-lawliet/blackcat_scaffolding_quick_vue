<template>
    <div>
        <div style="border: 1px solid #ccc; margin-top: 10px;">
            <Toolbar
                :editor="editorRef"
                :defaultConfig="toolbarConfig"
                :mode="mode"
                style="border-bottom: 1px solid #ccc"
            />
            <Editor
                :defaultConfig="editorConfig"
                :mode="mode"
                v-model="editorValue"
                style="height: 400px; overflow-y: hidden;"
                @onCreated="handleCreated"
                @onChange="handleChange"
                @onDestroyed="handleDestroyed"
                @onFocus="handleFocus"
                @onBlur="handleBlur"
                @customAlert="customAlert"
                @customPaste="customPaste"
            />
        </div>
        
    </div>
</template>


<script setup>
import { onBeforeUnmount, ref, shallowRef, watch } from 'vue'
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'
import '@wangeditor/editor/dist/css/style.css'

console.log('Editor component setup running');

// 定义 props
const props = defineProps({
  field: {
    type: String,
    required: true,
    default: ""
  },
  modelValue: {
    type: String,
    default: '',
  },
  countent: {
    type: Object,
    default: ""
  },
  placeholderText: {
    type: Object,
    default: ""
  }
});

// 定义 emits
const emit = defineEmits(['update:modelValue']);

// 编辑器实例，必须用 shallowRef
const editorRef = shallowRef()

// 工具栏配置
const toolbarConfig = {
  excludeKeys: ['group-image', 'group-video']
}

// 内容 HTML
const valueHtml = ref('')

// 编辑器配置
const editorConfig = { placeholder: props.placeholderText }

// 编辑器内容
const editorValue = ref(props.modelValue)

// 监听 modelValue 的变化，更新编辑器内容
watch(
  () => props.modelValue,
  (newValue) => {
    editorValue.value = newValue;
  }
);

// 监听 editorValue 的变化，将内容传递回父组件
watch(
  editorValue,
  (newValue) => {
    emit('update:modelValue', newValue);
  }
);

// 组件销毁时，销毁编辑器
onBeforeUnmount(() => {
  const editor = editorRef.value
  if (editor == null) return
  editor.destroy()
})

// 编辑器回调函数
const handleCreated = (editor) => {
  console.log('created', editor);
  editorRef.value = editor
}

const handleChange = (editor) => {
  console.log('change:', editor.getHtml());
}

const handleDestroyed = (editor) => {
  console.log('destroyed', editor)
}

const handleFocus = (editor) => {
  console.log('focus', editor)
}

const handleBlur = (editor) => {
  console.log('blur', editor)
}

const customAlert = (info, type) => {
  alert(`【自定义提示】${type} - ${info}`)
}

const customPaste = (editor, event, callback) => {
  console.log('ClipboardEvent 粘贴事件对象', event)
  callback(true) // 继续默认的粘贴行为
}

// 定义 mode 变量
const mode = ref('default')
</script>
