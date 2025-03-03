<template>
  <el-dialog
      v-model="showDialogVisible"
      title="查看详情"
      width="40%"
      :before-close="closeDialog"
  >
    <el-descriptions
        :column="2"
        size="large"
        border
    >
      <el-descriptions-item v-for="(item,index) in fieldConfig" :key="index">
        <template #label>
          {{ item.label }}
        </template>
        <span v-if="props.tagConfig.hasOwnProperty(item.model)">
          <el-tag :type="tagConfigFind(item.model, props.data[item.model])['type']">
            {{ tagConfigFind(item.model, props.data[item.model])['label'] }}
          </el-tag>
        </span>
        <span v-else-if="item.type === 'editor'">
          <div v-html="props.data[item.model]" class="formatted-text"></div>
         </span>
        <span v-else>{{ props.data[item.model] }}</span>
      </el-descriptions-item>
    </el-descriptions>
  </el-dialog>
</template>

<script setup>
import {onMounted, ref} from "vue";
import {storeToRefs} from "pinia";
import useStore from "@/store";

const {common} = useStore()

// 添加弹窗是否显示
const {showDialogVisible} = storeToRefs(common)
const props = defineProps({
  data: {
    type: Object,
    required: true,
    default: {}
  },//显示表单数据
  fieldConfig: {
    type: Array,
    required: true,
    default: []
  },// 显示项配置
  tagConfig: {
    type: Object,
    required: false,
    default: {}
  }// tag标签显示配置
})
// 详情配置项
const fieldConfig = ref([])
// 关闭弹窗
const closeDialog = () => {
  common.changeShowDialogVisible(false)
}
// 自定义标签正确显示内容
const tagConfigFind = (tag, value) => {
  console.log('props.tagConfig:', props.tagConfig);
  console.log('tag:', tag, 'value:', value);
  // 防御性检查：确保 tag 存在且 value 有效
  if (!tag || !value || !props.tagConfig[tag]) {
    return { label: '未知', type: 'danger' }; // 返回默认值
  }
  // 遍历配置项
  const foundItem = props.tagConfig[tag].find(item => item.value == value);
  console.log('foundItem:', foundItem);
  return foundItem 
    ? { label: foundItem.label, type: foundItem.type || 'danger' } 
    : { label: '未匹配', type: 'danger' };
};

onMounted(() => {
  // 生成配置项
  fieldConfig.value = props.fieldConfig.filter(item => {
    return item.is_info_show
  })
})

</script>

<style scoped lang="scss">
.formatted-text {
  white-space: pre-line; /* 保留换行符 */
  word-wrap: break-word; /* 自动换行 */
}
</style>