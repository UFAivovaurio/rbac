<template>
  <el-container :style="{ height: containerHeight + 'px' }">
    <!-- 左侧部门树形菜单列表 -->

    <!-- 右侧用户数据 -->
    <el-main>
      <!-- 查询条件 -->
      <el-form
        :model="searchModel"
        ref="searchForm"
        label-width="80px"
        inline
        size="small"
      >
        <el-form-item>
          <el-input v-model="searchModel.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item>
          <el-input v-model="searchModel.realName" placeholder="请输入真实姓名" />
        </el-form-item>
        <el-form-item>
          <el-input v-model="searchModel.phone" placeholder="请输入电话" />
        </el-form-item>
        <el-form-item>
          <el-button
            icon="el-icon-search"
            type="primary"
            @click="search(departmentId, pageNo, pageSize)"
          >查询</el-button>
          <el-button icon="el-icon-delete" @click="resetValue()">重置</el-button>
          <el-button icon="el-icon-plus" size="small" type="success" @click="openAddWindow()">新增</el-button>
        </el-form-item>
      </el-form>

      <!-- 用户表格数据 -->
      <el-table :height="tableHeight" :data="userList" border stripe style="width: 100%; margin-bottom: 10px">
        <el-table-column prop="username" label="用户名"></el-table-column>
        <el-table-column prop="realName" label="姓名"></el-table-column>
        <el-table-column prop="departmentName" label="所属部门"></el-table-column>
        <el-table-column prop="phone" label="电话"></el-table-column>
        <el-table-column prop="email" label="邮箱"></el-table-column>
        <el-table-column align="center" width="290" label="操作">
          <template slot-scope="scope">
            <el-button icon="el-icon-edit" type="primary" size="mini" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button icon="el-icon-delete" type="danger" size="mini" @click="handleDelete(scope.row)">删除</el-button>
            <el-button icon="el-icon-setting" type="primary" size="mini" @click="assignRole(scope.row)">分配角色</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页工具栏 -->
      <el-pagination
        background
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="pageNo"
        :page-sizes="[10, 20, 30, 40, 50]"
        :page-size="10"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      />

      <!-- 添加和编辑用户窗口 -->
      <system-dialog
        :title="userDialog.title"
        :height="userDialog.height"
        :width="userDialog.width"
        :visible="userDialog.visible"
        @onClose="onClose"
        @onConfirm="onConfirm"
      >
        <div slot="content">
          <el-form
            :model="user"
            ref="userForm"
            :rules="rules"
            label-width="80px"
            inline
            size="small"
          >
            <el-form-item prop="username" label="用户名">
              <el-input v-model="user.username"></el-input>
            </el-form-item>
            <el-form-item prop="password" v-if="user.id === ''" label="密码">
              <el-input type="password" v-model="user.password"></el-input>
            </el-form-item>
            <el-form-item prop="departmentName" label="所属部门">
              <el-input v-model="user.departmentName" :readonly="true" @click.native="selectDepartment()"></el-input>
            </el-form-item>
            <el-form-item prop="realName" label="姓名">
              <el-input v-model="user.realName"></el-input>
            </el-form-item>
            <el-form-item prop="phone" label="电话">
              <el-input v-model="user.phone"></el-input>
            </el-form-item>
            <el-form-item label="昵称">
              <el-input v-model="user.nickName"></el-input>
            </el-form-item>
            <el-form-item label="邮箱">
              <el-input v-model="user.email"></el-input>
            </el-form-item>
            <el-form-item prop="gender" label="性别">
              <el-radio-group v-model="user.gender">
                <el-radio :label="0">男</el-radio>
                <el-radio :label="1">女</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-form>
        </div>
      </system-dialog>

      <!-- 所属部门弹框 -->
      <system-dialog
        :title="parentDialog.title"
        :width="parentDialog.width"
        :visible="parentDialog.visible"
        @onClose="onParentClose"
        @onConfirm="onParentConfirm"
      >
        <div slot="content">
          <el-tree
            ref="parentTree"
            :data="parentList"
            default-expand-all
            node-key="id"
            :props="parentProps"
            :show-checkbox="false"
            :highlight-current="true"
            :expand-on-click-node="false"
            @node-click="parentClick"
          >
            <div class="customer-tree-node" slot-scope="{node, data}">
              <span v-if="data.children.length == 0">
                <i class="el-icon-document"/>
              </span>
              <span v-else @click.stop="openParentBtn(data)">
                <svg-icon v-if="data.open" icon-class="add-s"/>
                <svg-icon v-else icon-class="sub-s"/>
              </span>
              <span style="margin-left: 3px;">{{ node.label }}</span>
            </div>
          </el-tree>
        </div>
      </system-dialog>
    </el-main>
  </el-container>
</template>

<script>
// 导入部门api脚本
import departmentApi from '@/api/department';
// 导入用户api脚本

import SystemDialog from '@/components/system/SystemDialog.vue';
import * as userApi from '@/api/user';  // 确保路径和名称正确

export default {
  name: 'UserList',
  components: {
    SystemDialog
  },
  data() {
    let validatePhone = (rule, value, callback) => {
      if (!value) {
        callback(new Error("请输入手机号码"));
      } else if (!/^1[3456789]\d{9}$/.test(value)) {
        callback(new Error("手机号格式不正确"));
      } else {
        callback();
      }
    };

    return {
      parentDialog: {
        title: '选择所属部门',
        width: 300,
        height: 450,
        visible: false,
      },
      parentProps: {
        children: 'children',
        label: 'departmentName',
      },
      parentList: [],
      userDialog: {
        title: '',
        height: 410,
        width: 610,
        visible: false
      },
      user: {
        id: '',
        departmentId: '',
        departmentName: '',
        email: '',
        realName: '',
        phone: '',
        nickName: '',
        password: '',
        username: '',
        gender: '',
        avatar: ''
      },
      rules: {
        departmentName: [{ required: true, trigger: 'change', message: '请选择所属部门' }],
        realName: [{ required: true, trigger: 'blur', message: '请填写姓名' }],
        phone: [{ trigger: 'blur', validator: validatePhone }],
        username: [{ required: true, trigger: 'blur', message: '请填写登录名' }],
        password: [{ required: true, trigger: 'blur', message: '请填写登录密码' }],
        gender: [{ required: true, trigger: 'change', message: '请选择性别' }]
      },
      searchModel: {
        username: '',
        realName: '',
        phone: '',
        departmentId: '',
        pageNo: 1,
        pageSize: 10,
      },
      userList: [],
      tableHeight: 0,
      pageNo: 1,
      pageSize: 10,
      total: 0,
      departmentId: '',
      deptList: [],
      containerHeight: 0,
    };
  },
  methods: {
    async getDeptList() {
      //发送查询请求
      let res = await departmentApi.getDepartmentList(null)
      //判断是否成功
      if (res.success) {
        this.deptList = res.data;
        //树加载完成后，默认点击第一个节点
        this.$nextTick(() => {
          const firstNode = document.querySelector(".el-tree-node");
          firstNode.click();
       });
     }
   },
  handleNodeClick(data) {
    this.departmentId = data.id;
    this.search(this.departmentId);
  },
  async search(departmentId, pageNo = 1, pageSize = 10) {
      this.searchModel.pageNo = pageNo;
      this.searchModel.pageSize = pageSize;
      this.searchModel.departmentId = departmentId;
      //发送查询请求
      let res = await userApi.getUserList(this.searchModel);
      if (res.success) {
        this.userList = res.data.records;
        this.total = res.data.total;
     }
   },

  handleSizeChange(size) {
    this.pageSize = size;
    this.search(this.departmentId, this.pageNo, this.pageSize);
  },
  handleCurrentChange(page) {
    this.pageNo = page;
    this.search(this.departmentId, this.pageNo, this.pageSize);
  },
  onClose() {
    this.userDialog.visible = false;
  },
  onConfirm() {
    this.$refs.userForm.validate(async (valid) => {
      if (valid) {
        let res = null;
        if (this.user.id === '') {
          res = await userApi.addUser(this.user);
        } else {
          res = await userApi.updateUser(this.user);
        }
        if (res.success) {
          this.$message.success(res.message);
          this.search(this.departmentId, this.pageNo, this.pageSize);
          this.userDialog.visible = false;
        } else {
          this.$message.error(res.message);
        }
      }
    });
  },
  resetValue() {
      //清空查询条件
      this.searchModel = {};
      //重新查询
      this.search(this.departmentId);
   },
  handleEdit(row) {
    this.user = { ...row };
    this.userDialog.title = '编辑用户';
    this.userDialog.visible = true;
  },
  handleDelete(row) {
    this.$confirm('是否确认删除该用户?', '删除', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(async () => {
      const res = await userApi.deleteUser(row.id);
      if (res.success) {
        this.$message.success(res.message);
        this.search(this.departmentId, this.pageNo, this.pageSize);
      } else {
        this.$message.error(res.message);
      }
    });
  },
  assignRole(row) {
    console.log('分配角色', row);
    // 角色分配的逻辑实现
  },
  openAddWindow() {
    this.user = {
      id: '',
      departmentId: '',
      departmentName: '',
      email: '',
      realName: '',
      phone: '',
      nickName: '',
      password: '',
      username: '',
      gender: ''
    };
    this.userDialog.title = '新增用户';
    this.userDialog.visible = true;
  },
  selectDepartment() {
    this.parentDialog.visible = true;
    this.getDeptList();
  },
  parentClick(data) {
    this.user.departmentId = data.id;
    this.user.departmentName = data.departmentName;
    this.parentDialog.visible = false;
  },
  onParentClose() {
    this.parentDialog.visible = false;
  },
  onParentConfirm() {
    this.parentDialog.visible = false;
  },
  handleResize() {
    this.containerHeight = window.innerHeight - 85;
    this.tableHeight = window.innerHeight - 220;
  }
},

mounted() {
    this.$nextTick(() => {
      //内容高度
      this.containerHeight = window.innerHeight - 85;
      //表格高度
      this.tableHeight = window.innerHeight - 220;
   })
 },
  created() {
    //查询部门列表
    this.getDeptList();
    //调用查询用户列表
    this.search(this.departmentId);
 },

};
</script>

<style scoped>
/* 在这里添加页面样式 */
</style>
