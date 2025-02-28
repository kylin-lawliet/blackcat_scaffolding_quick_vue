<template>
  <div class="user-dropdown-container">
    <el-dropdown split-button type="" @command="handle">
      {{ userInfo.userName }}
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item command="password">修改密码</el-dropdown-item>
          <el-dropdown-item command="logout">注销登录</el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>

<script setup>
import { onBeforeRouteUpdate, useRouter } from "vue-router";
import { onMounted, ref } from "vue";
import useStore from "@/store";
import { storeToRefs } from "pinia";
import { ElMessage } from "element-plus";
import axios from "axios"; // 引入 axios

const { user } = useStore();
const { userInfo } = storeToRefs(user);
const router = useRouter();
const emits = defineEmits(["changePassword"]);

// 当前位置
const location = ref([]);

// 注销登录
const handle = async (value) => {
  if (value === "logout") {
    // 清除用户信息和 Token
    user.clearUser();

    // 重置 axios 的请求头
    delete axios.defaults.headers.common["Authorization"];

    ElMessage.success({
      message: "注销成功，正在跳转至登录页！",
      type: "success",
    });

    // 跳转到登录页
    router.replace("/login");
  } else {
    emits("changePassword");
  }
};


onMounted(() => {
  location.value = router.currentRoute.value.meta.location;
});

onBeforeRouteUpdate((to) => {
  location.value = to.meta.location;
});
</script>

<style scoped lang="scss">
div:nth-child(1) {
  flex: 1;
}

div:nth-child(2) {
  width: 100px;
}

.user-dropdown-container {
  position: absolute;
  right: 10px; /* 距离右侧 10 像素，可根据需求调整 */
  top: 10px; /* 距离顶部 10 像素，可根据需求调整 */
}
</style>