<template>
  <el-autocomplete
      v-model="props.field"
      :fetch-suggestions="querySearch"
      popper-class="my-autocomplete"
      ref="autocomplete"
      :placeholder="props.placeholder"
      clearable
  >
    <template #default="{ item }">
      <div class="value">{{ item.value }}</div>
    </template>

  </el-autocomplete>
</template>

<script setup>
import {onMounted, ref} from 'vue'
import Fuse from "fuse.js";
import useStore from "@/store";
import {storeToRefs} from "pinia";
import {excutAutoInputMethod} from "@/api/home";

const {user} = useStore()
const {id} = storeToRefs(user)
const links = ref([])
const props = defineProps({
  field: {
    type: String,
    required: true,
    default: ""
  },
  autoInputMethod: {
    type: String,
    default: ""
  },
  placeholder: {
    type: String,
    default: ""
  }
})

const querySearch = (queryString, cb) => {
  if (queryString) {
    console.log(queryString)
    let resultList = []
    const fuse = new Fuse(links.value, {includeScore: false, keys: ["value"]})
    const result = fuse.search(queryString)
    console.log(result)
    result.forEach(function (item) {
      console.log(item.item)
      resultList.push(item.item)
    })
    cb(resultList)
  } else {
    cb(links.value)
  }
}


async function selectData() {
  let params = {'page': 1, 'size': 1000}
  if(props.autoInputMethod){
    let data = await excutAutoInputMethod(props.autoInputMethod,params)
    // 分页返回数据
    const records=data.data.dataList
    for (let i in records) {
      links.value.push(
          {
            'value': records[i][props.field],
            'id': records[i]['id']
          }
      )
    }
  } 
}

onMounted(() => {
  selectData()
})
</script>

<style scoped lang="scss">
.el-menu-vertical-demo:not(.el-menu--collapse) {
  width: 250px;
}
</style>
