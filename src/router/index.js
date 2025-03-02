import {createRouter, createWebHistory} from 'vue-router';

const router = createRouter({
    // history: createWebHashHistory(),  // hash模式，
    history: createWebHistory(),  //h5模式createWebHistory
    routes: [
        {
            path: "",
            name: "redirect",
            redirect: "/login"
        },
        {
            path: '/login',
            component: () => import('@/views/Login.vue'),
            meta: {
                title: '登录',
            }
        },
        {
            path: '/',
            name: 'Home',
            component: () => import('@/views/Home.vue'),
            children: [
                {
                    path: 'index',
                    name: 'index',
                    component: () => import('@/views/Index.vue'),
                    meta: {
                        title: '首页',
                    },
                },
                {
                    path: 'user',
                    name: 'user',
                    component: () => import('@/views/User.vue'),
                    meta: {
                        title: '用户管理',
                    },
                },
                {
                    path: 'form',
                    name: 'form',
                    component: () => import('@/views/Form.vue'),
                    meta: {
                        title: '演示页面',
                        location: ['示例页', '演示页面'],
                    },
                },
                {
                    path: 'demo',
                    name: 'demo',
                    component: () => import('@/views/Tables.vue'),
                    meta: {
                        title: '演示表格',
                        location: ['示例页', '演示表格'],
                    },
                }
            ]
        }
    ]
})
// 路由导航守卫
router.beforeEach((to, from, next) => {
    document.title = to.meta.title
    next()
})
export default router;
