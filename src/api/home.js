import index from './index'

// 用户登录
export function postLogin(params) {
    const url = '/auth/login/'
    return index.post(url, params)
}
// 用户登出
export function postLoginOut(params) {
    const url = '/auth/loginOut/'
    return index.post(url, params)
}

// 修改密码
export function putChangePassword(id, params) {
    const url = '/user/changePassword/' + id + '/'
    return index.put(url, params)
}

// 查询分页
export function selectPage(params,type) {
    const url ='/' + type + '/selectPage';
    return index.get(url, params)
}
// 数据编辑
export function objectEdit(params,type) {
    const url = '/' + type + '/edit'
    return index.post(url, params)
}
// 获取详情
export function getOne(id,type) {
    const url = '/' + type + '/getOne?id=' + id 
    return index.get(url, null)
}
// 数据删除
export function objectDelete(id,type) {
    return index.delete('/' + type + '/delete?id=' + id)
}

// 输入框方法查询
export function excutAutoInputMethod(url,params){
    return index.get(url, params)
}

// 查询项输入框的方法
export function getAutoInputMethod(type){
    return '/' + type + '/selectPage';
}

// 组装下拉框值
export function getSex(){
    const value= [
    {
      'value': "1", // 字段值
      'label': '男', // 显示名
      'type': 'success' // 样式
    },
    {
      'value': "0", // 字段值
      'label': '女', // 显示名
      'type': 'danger' // 样式
    }
  ]
    return value;
}

// 获取部门数据
export function selectDeptList(params) {
    const url ='/dome/selectDeptList';
    return index.get(url, params)
}
// 获取职位数据
export function selectPositionList(params) {
    const url ='/dome/selectPositionList';
    return index.get(url, params)
}

// // 发送put请求
// export function putDemo(id, params) {
//     const url = '/public/demoUser/' + id + '/'
//     return index.put(url, params)
// }
// // 发送patch请求
// export function patchDemo(id, params) {
//     const url = '/public/demoUser/' + id + '/'
//     return index.patch(url, params)
// }


