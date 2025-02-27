import axios from 'axios'
import {ElMessage} from 'element-plus'
import {onBeforeRouteUpdate, useRouter} from "vue-router";
import useStore from "@/store";
import {storeToRefs} from "pinia";
const {user} = useStore();
const {token} = storeToRefs(user)

// // 从 localStorage 中获取 Token
// const token = localStorage.getItem("token");

// // 如果 Token 存在，设置全局请求头
// if (token) {
//   axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
// }

// // 请求拦截器
// axios.interceptors.request.use(
//   (config) => {
//     // 每次请求前检查 Token 是否存在
//     const token = localStorage.getItem("token");
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

// // 响应拦截器
// axios.interceptors.response.use(
//   (response) => {
//     return response;
//   },
//   (error) => {
//     // 处理 Token 过期或未授权的情况
//     if (error.response.status === 401) {
//       localStorage.removeItem("token");
//       window.location.href = "/login"; // 跳转到登录页
//     }
//     return Promise.reject(error);
//   }
// );

export function request(config) {
	// 创建axios的实例
	const instance = axios.create({
		baseURL: import.meta.env.VITE_APP_BASE_URL,
		timeout: 2 * 60 * 1000
	})
	// 请求拦截器配置
	instance.interceptors.request.use(config => {
		if (token.value) {
			config.headers.Authorization = 'Bearer ' + token.value
		}
		return config
		}, error => {
			console.log(error)
			return Promise.error(error)
		}
	)
	// 响应拦截器配置
	instance.interceptors.response.use(response => {
		return response.data
	}, error => {
		console.log(error)
		if (error.response) {
			switch (error.response.status) {
				case 400:
					return Promise.reject(error.response)
				case 401:
					console.log("无权访问")
					ElMessage.error('对不起，您暂无权限访问此接口，请登录重试！')
					window.localStorage.clear()
					window.sessionStorage.clear()
					window.location.href="/login";
					break
				case 403:
					console.log("token过期啦")
					ElMessage.error('对不起，您的身份信息已过期，请重新登录！')
					window.localStorage.clear()
					window.sessionStorage.clear()
					window.location.href="/login";
					break
				case 404:
					console.log("404啦")
					ElMessage.error('请求地址异常，请稍候重试或联系管理员！')
					break
				case 500:
					console.log("500啦")
					ElMessage.error('后端接口异常，请稍候重试！')
					break
				default:
					return Promise.reject(error)
			}
		}
		else {
			console.log("请求异常")
			ElMessage.error('网络异常，检查网络状态或刷新重试！')
		}
		return Promise.reject(error)
	})
	// 发送真正的网络请求
	return instance(config);
}



export default request
