import http from '@/utils/request';

export default {
    /**
     * 查询部门列表
     */
    async getDepartmentList(param) {
        return await http.get("/api/department/list", param);
    },
    /**
 * 获取所属部门列表
 */
    async getParentTreeList() {
        return await http.get("/api/department/parent/list");
    },

    /**
 * 添加部门
 * @returns 
 */
    async addDept(params) {
        return await http.post("/api/department/add", params);
    },

}