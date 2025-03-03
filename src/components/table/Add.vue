<template>
  <el-dialog
      v-model="addDialogVisible"
      title="添加"
      width="50%"
      :before-close="closeDialog"
  >
    <el-form ref="addFormRef" :model="form" :rules="rules" label-width="100px" :size="'large'">
        <span v-for="(item,index) in fieldConfig" :key="index">
          <el-form-item v-if="item.type==='text'" :label="item.label" :prop="item.model">
            <el-input v-model="form[item.model]" :placeholder="item.placeholder" type="textarea" autosize/>
          </el-form-item>
          <el-form-item v-if="item.type==='number'" :label="item.label" :prop="item.model">
            <el-input-number v-model="form[item.model]" controls-position="right" :precision="item.precision"
                             :placeholder="item.placeholder"/>
          </el-form-item>
          <el-form-item v-if="item.type==='select'" :label="item.label" :prop="item.model">
            <el-select v-model="form[item.model]" :placeholder="item.placeholder" 
            @change="handleSelectChange(item, form[item.model],'add')
            ">
              <el-option v-for="(itemOption,indexOption) in selectOption[item.model]" :key="indexOption"
                         :label="itemOption.label" :value="itemOption.value"/>
            </el-select>
          </el-form-item>
          <el-form-item v-if="item.type==='auto-input'" :label="item.label" :prop="item.model">
            <AutoInput :field="item.model" v-model="form[item.model]" :placeholder="item.placeholder"></AutoInput>
          </el-form-item>
          <el-form-item v-if="item.type==='datetime'" :label="item.label" :prop="item.model" class="input-datetime">
            <el-date-picker
                v-model="form[item.model]"
                type="datetime"
                :placeholder="item.placeholder"
            />
          </el-form-item>
          <el-form-item v-if="item.type==='date'" :label="item.label" :prop="item.model">
            <el-date-picker v-model="form[item.model]" type="date" :placeholderText="item.placeholder"
                            value-format="YYYY-MM-DD"/>
          </el-form-item>


          <!-- <el-form-item v-if="item.type==='textarea'" :label="item.label" :prop="item.model">
            <el-input v-model="form[item.model]" :placeholderText="item.placeholder" type="textarea" autosize/>
          </el-form-item> -->

          <el-form-item v-if="item.type==='editor'" :label="item.label" :prop="item.model">
            <BasicEditor  v-model="form[item.model]" :placeholderText="item.placeholder"></BasicEditor>
            <!-- <BasicEditor  v-model="form[item.model]" :placeholderText="item.placeholder"></BasicEditor> -->
          </el-form-item>
         

        </span>
      <slot name="item"></slot>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="closeDialog(addFormRef)">取消</el-button>
        <el-button type="primary" @click="addData(addFormRef)">确定</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import {onMounted, reactive, ref, defineExpose} from "vue";
import {storeToRefs} from "pinia";
import useStore from "@/store";
import {ElMessage} from "element-plus";
import AutoInput from "@/components/common/AutoInput.vue";
import BasicEditor from '@/components/common/BasicEditor.vue';

const {common} = useStore()

// 添加弹窗是否显示
const {addDialogVisible} = storeToRefs(common)
const emits = defineEmits(['addData'])
const props = defineProps({
  components: {
    BasicEditor,
  },
  fieldConfig: {
    type: Array,
    required: true,
    default: []
  },// 表单配置
  selectOption: {
    type: Object,
    required: false,
    default: {}
  },// 选择框选项
})

// 添加表单对象
const addFormRef = ref(null)
// 添加表单
let form = reactive({})
// 添加项配置
const fieldConfig = ref([])
// 表单校验规则
const rules = reactive({})
// 关闭弹窗
const closeDialog = () => {
  common.changeAddDialogVisible(false)
}

const addData = async (addFormRef) => {
  await addFormRef.validate((valid) => {
    if (valid) {
      // 提取可编辑字段的数据
      const data = {};
      for (const item of fieldConfig.value) {
        if (item.is_edit) {
          data[item.model] = form[item.model];
        }
      }

      console.log("提交的表单数据:", data); // 调试输出

      // 提交数据
      emits('addData', data);
      common.changeAddDialogVisible(false);

      // 清空表单
      for (const key in form) {
        form[key] = '';
      }
    } else {
      ElMessage.error('请检查表单填写项，然后再提交');
    }
  });
};

// 动态处理 select 的 change 事件
const handleSelectChange = (field, value,type) => {
  if (field.change && typeof field.change === 'function') {
    field.change(value,type); // 调用 fieldConfig 中定义的 change 方法
  }
};

// 修改表单信息方法
const setFormField = (field, value) => {
  console.log("修改字段:", field);
  console.log("修改内容:", value);
  if (field in form) {
    form[field] = value; // 修改表单字段
  } else {
    console.error(`字段 ${field} 不存在于表单中`);
  }
};

// 暴露表单数据和方法
defineExpose({
  form,
  setFormField,
});

onMounted(() => {
  fieldConfig.value = props.fieldConfig.filter(item => item.is_edit);
  // console.log("可编辑的字段配置:", fieldConfig.value); // 调试输出
  // 初始化 form 对象
  for (const item of fieldConfig.value) {
    if (!form[item.model]) {
      form[item.model] = ''; // 设置默认值为空字符串
    }
  }

  // 生成验证表单规则
  for (const j in fieldConfig.value) {
    if (fieldConfig.value[j].is_required) {
      rules[fieldConfig.value[j].model] = [{
        required: true,
        message: fieldConfig.value[j].placeholder,
        trigger: 'change'
      }]
    }
    // console.log(rules)
  }

})
</script>

<style scoped lang="scss">
.el-select {
  width: 100%;
}

:deep(.el-date-editor) {
  width: 100% !important;
}

:deep(.el-input__wrapper) {
  width: 90% !important;
}

:deep(.el-autocomplete) {
  width: 100% !important;
}
</style>