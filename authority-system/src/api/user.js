import http from '@/utils/request'

/**
 * 用户登录方法
 * @param  data 
 * @returns 
 */
export async function login(data) {
  return await http.login("/api/user/login", data)
}

/**
 * 获取登陆用户信息
 * @param {} token 
 * @returns 
 */
export async function getInfo(token) {
  return await http.get("/api/sysUser/getInfo")
}

/**
 * 退出登录
 * @returns 
 */
export async function logout(param) {
  return await http.post("/api/sysUser/logout", param);
}

/**
 * 获取菜单数据
 */
export async function getMenuList() {
  return await http.get("/api/sysUser/getMenuList");
}

/**
 * 查询用户列表
 * @param params
 * @returns
 */
export async function getUserList(params) {
  return await http.get("/api/user/list", params);
}

export async function addUser(params) {
  return await http.post("/api/user/add", params);
}
