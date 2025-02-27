import {defineStore} from 'pinia'

const useUserStore = defineStore('user', {
  state: () => ({
    // userid: '',
    // token: '',
    // username: '',
    userInfo: {},
    token: localStorage.getItem("token") || "",
  }),
  // 修改数据
  actions: {
    // 更改用户信息
    // changeUser(value) {
    //   this.userid = value['userId']
    //   this.token = value['token']
    //   this.username = value['userName']
    // }
    // 保存用户信息和 Token
    changeUser(data) {
      this.userInfo = data.userInfo;
      this.token = data.token;
      localStorage.setItem("token", data.token);
    },
    // 清除用户信息和 Token
    clearUser() {
      this.userInfo = {};
      this.token = "";
      localStorage.removeItem("token");
    },
  },
  // 持久化存储插件其他配置
  persist: {
    // 修改存储中使用的键名称，默认为当前 Store的 id
    key: 'useStore',
    // 修改为 sessionStorage，默认为 localStorage
    storage: window.sessionStorage,
    // 部分持久化状态的点符号路径数组，[]意味着没有状态被持久化(默认为undefined，持久化整个状态)
  }
})

export default useUserStore