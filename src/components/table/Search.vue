<template>
  <el-card shadow="hover" class="search-card">
    <el-form ref="searchFormRef" :inline="true" :model="form">
    <span v-for="(item,index) in fieldConfig" :key="index">
      <el-form-item v-if="item.type==='input'" :label="item.label">
        <el-input v-model="form[item.model]" :placeholder="item.placeholder"/>
      </el-form-item>
      <el-form-item v-if="item.type==='select'" :label="item.label">
        <el-select v-model="form[item.model]" :placeholder="item.placeholder">
          <el-option v-for="(itemOption,indexOption) in selectOption[item.model]" :key="indexOption"
                     :label="itemOption.label" :value="itemOption.value"/>
        </el-select>
      </el-form-item>
      <el-form-item v-if="item.type==='auto-input'" :label="item.label">
        <AutoInput :field="item.model" v-model="form[item.model]" :autoInputMethod="item.autoInputMethod" :placeholder="item.placeholder"></AutoInput>
      </el-form-item>
      <el-form-item v-if="item.type==='date'" :label="item.label">
        <el-date-picker v-model="form[item.model]" type="date" :placeholder="item.placeholder"/>
      </el-form-item>
      <el-form-item v-if="item.type==='datetime'" :label="item.label">
        <el-date-picker
            v-model="dateTimeRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始日期时间"
            end-placeholder="结束日期时间"
        />
      </el-form-item>

    </span>
      <slot name="search-item"></slot>
      <el-form-item>
        <el-button type="primary" @click="onSubmit">
          <el-icon>
            <Search/>
          </el-icon>
          查询
        </el-button>
        <el-button @click="reset">
          <el-icon>
            <Refresh/>
          </el-icon>
          清空
        </el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script setup>
import {onMounted, reactive, ref, watch} from "vue";
import {Search, Refresh} from "@element-plus/icons-vue"
import AutoInput from "@/components/common/AutoInput.vue";
import {timeFormatConversion} from "@/utils/timeFormat";

const emits = defineEmits(['submitSearch'])
const props = defineProps({
  fieldConfig: {
    type: Array,
    required: false,
    default: []
  },// 表单配置
  selectOption: {
    type: Object,
    required: false,
    default: {}
  }// 选择框选项
})
// 日期时间范围选择器
const dateTimeRange = ref('')
// 搜索表单对象
const searchFormRef = ref(null)
// 搜索表单
let form = reactive({})
// 搜索项配置
let fieldConfig = ref([])
watch(
    () => form.value,
    (newValue) => {
      form = newValue
    }, {
      deep: true,
    }
)
// 提交搜索
const onSubmit = () => {
  console.log(dateTimeRange.value)
  console.log(form)
  if (dateTimeRange.value) {
    form['created_time_after'] = timeFormatConversion(dateTimeRange.value[0], 'YYYY-MM-DD HH:mm:ss')
    form['created_time_before'] = timeFormatConversion(dateTimeRange.value[1], 'YYYY-MM-DD HH:mm:ss')
  }
  emits('submitSearch', form);
}
// 表单清空
const reset = () => {
  for (const key in form) {
    form[key] = ''
  }
  dateTimeRange.value = ''
}
onMounted(() => {
  console.log("fieldConfig",props.fieldConfig)
  setTimeout(() => {
    fieldConfig.value = props.fieldConfig.filter(item => {
      return item.is_search
    })
    // 新增默认值
    console.log("fieldConfig")
    console.log(fieldConfig)
    for (let j in fieldConfig.value) {
      if (fieldConfig.value[j].type === 'date') {
        // console.log(fieldConfig.value[j])
        form['date'] = new Date()
      }
      // autoInputMethodValue=
    }
  }, 0)
})
</script>

<style scoped lang="scss">
.search-card {
  margin-bottom: 15px;
  display: flex;
  justify-content: center;
  align-items: center;
}

//:deep(.el-form-item__label) {
//  min-width: 68px !important;
//}
:deep(.el-form-item__content) {
  min-width: 130px !important;
}
</style>