package com.manong.dao;

import com.manong.entity.Role;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Delete;

import java.util.List;


public interface RoleMapper extends BaseMapper<Role> {
    /**
     * 删除角色权限关系
     * @param roleId
     */
    @Delete("delete from sys_role_permission where role_id = #{roleId}")
    void deleteRolePermission(Long roleId);
    /**
    * 保存角色权限关系
    * @param roleId
    * @param permissionIds
    * @return
    */
    int saveRolePermission(Long roleId, List<Long> permissionIds);
}
