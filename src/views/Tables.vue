<template>
  <Search :fieldConfig="fieldConfig" @submitSearch="submitSearch" :selectOption="selectOption">
  </Search>
  <List :data="tableData" :fieldConfig="fieldConfig" :tableConfig="tableConfig" :templateFileName="templateFileName"
        @pageSize="pageSize" @pageNumber="pageNumber" :tagConfig="tagConfig" @submitEdit="submitEdit"
        @submitShow="submitShow" @submitAdd="submitAdd" @submitDelete="submitDelete" @submitExport="submitExport"
        @submitImport="submitImport" @multipleClick="multipleClick" @submitMultiple="submitMultiple">
  </List>
  <Show :data="operateForm" :fieldConfig="fieldConfig" :tagConfig="tagConfig" :otherConfig="otherConfig" :otherData="otherData" :otherFieldConfig="otherFieldConfig"></Show>
  <Edit :data="operateForm" :fieldConfig="fieldConfig" @editData="editData" :selectOption="selectOption" ref="editComponent"></Edit>
  <Add :fieldConfig="fieldConfig" @addData="addData" :selectOption="selectOption" ref="addComponent"></Add>
  <el-dialog
      v-model="multipleDialogVisible"
      title="批量删除数据"
      width="40%"
  >
    <el-form label-width="120px">
      <el-form-item label="操作数据ID">
        {{ multipleList }}
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="multipleDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="multiplDelete">
          确定
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup name="tables">
import Search from "@/components/table/Search.vue"
import List from "@/components/table/List.vue"
import Edit from "@/components/table/Edit.vue"
import Show from "@/components/table/Show.vue"
import Add from "@/components/table/Add.vue"
import {onMounted, reactive, ref} from "vue";
import useStore from "@/store";
import {objectDelete, selectPage, getOne, objectEdit,getAutoInputMethod,getSex,selectDeptList,selectPositionList} from "@/api/home";
import {ElMessage} from "element-plus";
import {exportFile} from "@/utils/excel";
import {timeFormatConversion} from "@/utils/timeFormat";

const {common} = useStore()

// 操作配置
const tableConfig = {
  'edit': true, // 是否编辑
  'delete': true, // 是否删除
  'add': true, // 是否添加
  'show': true, // 是否查看详情
  'export': false,//是否批量导出
  'import': false,//是否批量导入
  'multiple': true,//是否多选
  'page': {enable: true, size: 10, number: 1, count: 0},//是否开启分页
  'sort': {prop: 'id', order: 'ascending'}, // 是否默认排序
  'requestMapping':'dome',// controller 定义名称
  'modelTitle':'示例',// 模块的名称
  'primaryKey': 'id', // 指定主键字段名
  'otherTitle':'',// 详情中额外加载的模块名称
  'width': 195
}

// 批量导入模板文件名称，模板文件统一放在public/excelTemplate/目录下
const templateFileName = "userTemplate.xlsx";

// 需要绑定事件表单数据
const formData = reactive({
  deptId: null
});
const addComponent = ref(null);
const editComponent = ref(null);

// 定义事件处理方法
const onDeptIdChange = (value,type) => {
  console.log("value changed:", value);
  console.log("type:", type);
  formData.deptId = value; // 新增赋值
  selectOption.serviceId = []; 
  positionList(null,type);
};

// 数据库获取下拉框内容
const deptList = () => {
  selectDeptList().then((response) => {
    // console.log("selectDeptList",response)
    const result=response.data;
    // console.log("result",result)
    const  deptId=[];
    for (let i in result) {
      // console.log("result[i]",result[i])
      // console.log("result[i].dept_name",result[i].dept_name)
      deptId.push({
          label:result[i].dept_name,
          value:String(result[i].id),
          type:'warning'
      });
    }
    selectOption.deptId=deptId;
    tagConfig.deptId=deptId;
  }).catch(response => {
    //发生错误时执行的代码
    console.log(response)
    ElMessage.error('获取数据失败！')
  });
}

// 下拉框值表动加载，下拉框绑定方法要在字段信息定义之前
function positionList(load,type){
  console.log("load",load)
  console.log("type",type)
  // 列表加载时联动参数为空
  if(load){
    formData.deptId=null;
  }
  // 编辑变动是清空联动下拉框数据
  if(type=='edit'){
    editComponent.value.setFormField('positionId', null);
  }else if(type=='add'){
    addComponent.value.setFormField('positionId', null);
  }
  selectPositionList(formData).then((response) => {
    const result=response.data;
    const  positionId=[];
    for (let i in result) {
      positionId.push({
          label:result[i].position_name,
          value:String(result[i].id),
          type:'warning'
      });
    }
    selectOption.positionId=positionId;
    // 级联变动是，不修改列表的tag显示
    if(load){
      tagConfig.positionId=positionId;
    }
  }).catch(response => {
    //发生错误时执行的代码
    console.log(response)
    ElMessage.error('获取数据失败！')
  });
}

// 表格字段配置
const fieldConfig = ref([
  {
    'label': 'ID', // 标签
    'model': 'id',// 字段名
    'is_table_show': true,// 是否在表格显示
    'width': 65,
    'is_export': false,// 是否导出该字段
  },
  {
    'type': 'auto-input',// 表单类型
    'label': '用户名称', // 标签
    'model': 'userName',// 字段名
    'autoInputMethod':getAutoInputMethod(tableConfig.requestMapping),// 输入框实时加载数据,空表示不查询
    'is_table_show': true,// 是否在表格显示
    'is_info_show': true,// 是否在详情显示
    'is_search': true,// 是否可搜索，如果是false，不用填写placeholder
    'is_edit': true,// 是否可以编辑修改
    'placeholder': '请输入用户名称', // 提示文字
    'is_required': true,// 编辑表单时，是否必填
    'is_export': true, // 是否导出该字段
    'width': 160,
  },
  {
    'type': 'select',// 表单类型
    'label': '性别', // 标签
    'model': 'sex',// 字段名
    'autoInputMethod':'',// 输入框实时加载数据,空表示不查询
    'is_table_show': true,// 是否在表格显示
    'is_info_show': true,// 是否在详情显示
    'is_search': false,// 是否可搜索，如果是false，不用填写placeholder
    'is_edit': true,// 是否可以编辑修改
    'placeholder': '请选择性别', // 提示文字
    'is_required': true,// 编辑表单时，是否必填
    'is_export': false, // 是否导出该字段
    'width': 80,
  },
  {
    'type': 'number',// 表单类型
    'label': '年龄', // 标签
    'model': 'age',// 字段名
    'precision': 0,//精度
    'autoInputMethod':'',// 输入框实时加载数据,空表示不查询
    'is_table_show': true,// 是否在表格显示
    'is_info_show': true,// 是否在详情显示
    'is_search': false,// 是否可搜索，如果是false，不用填写placeholder
    'is_edit': true,// 是否可以编辑修改
    'placeholder': '请输入年龄', // 提示文字
    'is_required': false,// 编辑表单时，是否必填
    'is_export': true, // 是否导出该字段
    'width': 80,
  },
  {
    'type': 'number',// 表单类型
    'label': '体重', // 标签
    'model': 'weight',// 字段名
    'precision': 2,//精度
    'autoInputMethod':'',// 输入框实时加载数据,空表示不查询
    'is_table_show': true,// 是否在表格显示
    'is_info_show': true,// 是否在详情显示
    'is_search': false,// 是否可搜索，如果是false，不用填写placeholder
    'is_edit': true,// 是否可以编辑修改
    'placeholder': '请输入体重', // 提示文字
    'is_required': false,// 编辑表单时，是否必填
    'is_export': true, // 是否导出该字段
    'width': 80,
  },
  {
    'type': 'datetime',// 表单类型
    'label': '创建日期', // 标签
    'model': 'createTime',// 字段名
    'autoInputMethod':'',// 输入框实时加载数据,空表示不查询
    'is_table_show': true,// 是否在表格显示
    'is_info_show': true,// 是否在详情显示
    'is_search': false,// 是否可搜索，如果是false，不用填写placeholder
    'is_edit': false,// 是否可以编辑修改
    'placeholder': '', // 提示文字
    'is_required': false,// 编辑表单时，是否必填
    'is_export': true, // 是否导出该字段
    'width': 180,
  }, 
  {
    'type': 'datetime',// 表单类型
    'label': '生日', // 标签
    'model': 'birthday',// 字段名
    'autoInputMethod':'',// 输入框实时加载数据,空表示不查询
    'is_table_show': true,// 是否在表格显示
    'is_info_show': true,// 是否在详情显示
    'is_search': false,// 是否可搜索，如果是false，不用填写placeholder
    'is_edit': true,// 是否可以编辑修改
    'placeholder': '请选择生日', // 提示文字
    'is_required': true,// 编辑表单时，是否必填
    'is_export': true, // 是否导出该字段
    'width': 140,
  },
  {
    'type': 'select',// 表单类型
    'label': '部门', // 标签
    'model': 'deptId',// 字段名
    'autoInputMethod':'',// 输入框实时加载数据,空表示不查询
    'is_table_show': true,// 是否在表格显示
    'is_info_show': true,// 是否在详情显示
    'is_search': false,// 是否可搜索，如果是false，不用填写placeholder
    'is_edit': true,// 是否可以编辑修改
    'placeholder': '请选择部门', // 提示文字
    'is_required': true,// 编辑表单时，是否必填
    'is_export': true, // 是否导出该字段
    'width': 120,
    'change': onDeptIdChange, // 绑定点击事件
  },
  {
    'type': 'select',// 表单类型
    'label': '职位', // 标签
    'model': 'positionId',// 字段名
    'autoInputMethod':'',// 输入框实时加载数据,空表示不查询
    'is_table_show': true,// 是否在表格显示
    'is_info_show': true,// 是否在详情显示
    'is_search': false,// 是否可搜索，如果是false，不用填写placeholder
    'is_edit': true,// 是否可以编辑修改
    'placeholder': '请选择职位', // 提示文字
    'is_required': true,// 编辑表单时，是否必填
    'is_export': true, // 是否导出该字段
    'width': 120,
  },
  {
    'type': 'editor',// 表单类型
    'label': '备注', // 标签
    'model': 'remark',// 字段名
    'autoInputMethod':'',// 输入框实时加载数据,空表示不查询
    'is_table_show': true,// 是否在表格显示
    'is_info_show': true,// 是否在详情显示
    'is_search': false,// 是否可搜索，如果是false，不用填写placeholder
    'is_edit': true,// 是否可以编辑修改
    'placeholder': '请输入备注', // 提示文字
    'is_required': false,// 编辑表单时，是否必填
    'is_export': true, // 是否导出该字段
  }
])
// 标签显示配置
const tagConfig = reactive({
  'sex': getSex(),
  'deptId':[],
  'positionId':[]
})

// 下拉框选择项,结构为{'字段名':[{'label':'X','value':'Y'}]}
const selectOption = reactive({
  'sex': getSex(),
  'deptId':[],
  'positionId':[]
})



const otherConfig={
  'title': tableConfig.otherTitle, // 详情中加载的其他信息标题
  'show': false // 是否
}
const otherFieldConfig=[ {
    'label': 'ID', // 标签
    'model': 'id',// 字段名
    'is_table_show': true,// 是否在表格显示
    'width': 65
  }
]
const otherData = ref([])

// 表格数据
const tableData = ref([])
const heightForm = reactive({
  'height_min': 150,
  'height_max': 200
})
// 提交查询事件
const submitSearch = (value) => {
  console.log("提交查询了", value)
  tableConfig.page.number = 1
  params.page = 1
  params['height_min'] = heightForm.height_min
  params['height_max'] = heightForm.height_max
  for (let i in value) {
    params[i] = value[i]
  }
  getTableData()
}

// 操作表单
let operateForm = reactive({})
// 操作的数据ID
const operateId = ref('')
// 表格查看事件
const submitShow = (value) => {
  operateId.value = value
  getOne(operateId.value,tableConfig.requestMapping).then((response) => {
    response.data['birthday'] = timeFormatConversion(response.data['birthday'], 'YYYY年MM月DD日')
    Object.assign(operateForm, response.data)
  }).catch(response => {
    //发生错误时执行的代码
    console.log(response)
    ElMessage.error('获取详细数据失败！')
  });
  common.changeShowDialogVisible(true)
}
// 表格编辑事件
const submitEdit = (value) => {
  console.log(value)
  operateId.value = value
  getOne(operateId.value,tableConfig.requestMapping).then((response) => {
    // console.log(response)
    // 进入编辑页时，加载级联的下拉框数据
    formData.deptId=response.data.deptId;
    positionList(false,null);
    Object.assign(operateForm, response.data)
  }).catch(response => {
    //发生错误时执行的代码
    console.log(response)
    ElMessage.error('获取详细数据失败！')
  });
  
  common.changeEditDialogVisible(true)
}
// 表格保存事件
const editData = (value) => {
  console.log(value)
  objectEdit(value,tableConfig.requestMapping).then((response) => {
    getTableData()
    ElMessage({
      message: '修改信息成功！',
      type: 'success',
    })
  }).catch(response => {
    //发生错误时执行的代码
    console.log(response)
    ElMessage.error('修改信息失败！')
  });
}
// 表格新增事件
const submitAdd = () => {
  console.log("父组件收到了新增事件")
  common.changeAddDialogVisible(true)
}
// 表格新增保存事件
const addData = (value) => {
  console.log(value)
  objectEdit(value,tableConfig.requestMapping).then((response) => {
    console.log(response)
    getTableData()
    ElMessage({
      message: '新增数据成功！',
      type: 'success',
    })
  }).catch(response => {
    //发生错误时执行的代码
    console.log(response)
    ElMessage.error('添加数据失败！')
  });
}
// 删除数据
const submitDelete = (value) => {
  objectDelete(value,tableConfig.requestMapping).then((response) => {
    console.log(response)
    getTableData()
    ElMessage({
      message: '删除数据成功！',
      type: 'success',
    })
  }).catch(response => {
    //发生错误时执行的代码
    console.log(response)
    ElMessage.error('删除数据失败！')
  });
}
// 批量导出事件
const submitExport = () => {
  ElMessage({
    message: '开始导出数据，请稍候！',
    type: 'success',
  })
  // 导出数据查询参数
  const printParams = {
    'size': 1000,
    'page': 1,
  }
  // 获取需要导出的字段配置
  const export_fields = fieldConfig.value
      .filter(obj => obj['is_export'])
      .map(({label, model}) => ({[model]: label}))
  // 处理数据结构
  selectPage(printParams,tableConfig.requestMapping).then((response) => {
    // console.log(response.data.dataList)
    const export_data = response.data.dataList.map(obj => {
      const newObj = {};
      export_fields.forEach(field => {
        const [key, value] = Object.entries(field)[0];
        // 如果后端日期没有转换可放开注释
        // if (key === 'created_time') {
        //   newObj[value] = timeFormatConversion((obj[key]), 'YYYY-MM-DD HH:mm:ss');
        // } else {
          newObj[value] = obj[key];
        // }
      });
      // console.log(newObj)
      return newObj;
    });
    let filename = tableConfig.modelTitle
    exportFile(export_data, filename);
  }).catch(response => {
    //发生错误时执行的代码
    console.log(response)
    ElMessage.error('获取列表数据失败！')
  });
}

// 数据批量导入
const submitImport = (value) => {
  console.log(value)
  const result = value.map(obj => {
    const newObj = {};
    Object.keys(obj).forEach(key => {
      const matchingKey = fieldConfig.value.find(item => item.label === key);
      if (matchingKey) {
        newObj[matchingKey.model] = obj[key];
      } else {
        newObj[key] = obj[key];
      }
    });
    return newObj;
  });
  console.log(result)
  result.forEach((item, index) => {
    console.log(item, index)
    setTimeout(() => {
      objectEdit(item,tableConfig.requestMapping).then((response) => {
        console.log(response)
        ElMessage({
          message: `成功插入第${parseInt(index) + 1}条数据！`,
          type: 'success',
        })
      }).catch(response => {
        //发生错误时执行的代码
        console.log(response)
        ElMessage.error('添加数据失败！请检查填写项数值是否正确')
      });
    }, 1000)
    setTimeout(() => {
      getTableData()
    }, 1000)
  })
}
// 批量多选弹窗显示
const multipleDialogVisible = ref(false)

// 批量多选确定按钮事件
const multiplDelete = () => {
  console.log(multipleList.value)
  let flag=true;
  for (let i in multipleList.value) {
    objectDelete(multipleList.value[i],tableConfig.requestMapping).then((response) => {

    }).catch(response => {
      //发生错误时执行的代码
      flag=false;
    });
  }
  if(flag){
    ElMessage({
      message: '删除数据成功！',
      type: 'success',
    })
  }else{
    ElMessage({
      message: '删除数据失败！',
      type: 'success',
    })
  }
  getTableData()
  multipleDialogVisible.value = false
}

// 批量多选点击事件
const multipleClick = () => {
  multipleDialogVisible.value = true
}
// 批量多选操作的元素列表
const multipleList = ref([])
// 批量多选更新事件
const submitMultiple = (value) => {
  console.log(value)
  multipleList.value = value
}
// 查询参数
const params = reactive({
  'page': tableConfig.page.number,
  'size': tableConfig.page.size
})
// 改变分页大小
const pageSize = (value) => {
  tableConfig.page.size = value
  params.size = value
  tableConfig.page.number = 1
  params.page = 1
  getTableData()
}
// 改变页码数
const pageNumber = (value) => {
  tableConfig.page.number = value
  params.page = value
  getTableData()
}

// 获取列表数据
function getTableData() {
  selectPage(params, tableConfig.requestMapping).then((response) => {
    tableData.value = response.data.dataList.map(({birthday, ...item}) => ({
     ...item,
     birthday: timeFormatConversion(birthday, 'YYYY年MM月DD日'),
    }));
    tableConfig.page.count = response.data.totalCount;
  }).catch(response => {
    console.log(response);
    ElMessage.error('获取列表数据失败！')
  });
}

onMounted(() => {
  getTableData();
  // 加载下拉框数据
  deptList();
  positionList(true,null);
})
</script>

<style scoped lang="scss">
.view-btn {
  margin-right: 3px;
}

.token {
  text-align: center;
}

.range-icon {
  margin: 0 10px
}
</style>