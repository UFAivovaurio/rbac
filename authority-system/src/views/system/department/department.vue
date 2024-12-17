<template>
  <el-main>
    <!-- 查询条件 -->
    <el-form :model="searchModel" ref="searchForm" label-width="80px" :inline="true" size="small">
      <el-form-item>
        <el-input placeholder="请输入部门名称" v-model="searchModel.departmentName"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="search">查询</el-button>
        <el-button icon="el-icon-refresh-right" @click="resetValue">重置</el-button>
        <el-button type="success" icon="el-icon-plus" @click="openAddWindow">新增</el-button>
      </el-form-item>
    </el-form>

    <!-- 数据表格 -->
    <el-table :data="tableData" border stripe style="width: 100%; margin-bottom: 20px" row-key="id" default-expand-all :tree-props="{ children: 'children' }">
      <el-table-column prop="departmentName" label="部门名称"></el-table-column>
      <el-table-column prop="parentName" label="所属部门"></el-table-column>
      <el-table-column prop="phone" label="部门电话"></el-table-column>
      <el-table-column prop="address" label="部门位置"></el-table-column>
      <el-table-column label="操作" width="200" align="center">
        <template slot-scope="scope">
          <el-button
            icon="el-icon-edit-outline"
            type="primary"
            size="small"
            @click="handleEdit(scope.row)"
          >
            编辑
          </el-button>
          <el-button
            icon="el-icon-close"
            type="danger"
            size="small"
            @click="handleDelete(scope.row)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 添加和编辑部门窗口 -->
    <system-dialog :title="deptDialog.title" :visible="deptDialog.visible" :width="deptDialog.width" :height="deptDialog.height" @onClose="onClose" @onConfirm="onConfirm">
      <div slot="content">
        <el-form :model="dept" ref="deptForm" :rules="rules" label-width="80px" inline="true" size="small">
          <el-form-item label="所属部门" prop="parentName">
            <el-input v-model="dept.parentName" :readonly="true" @click.native="selectDepartment()"></el-input>
          </el-form-item>
          <el-form-item label="部门名称" prop="departmentName">
            <el-input v-model="dept.departmentName"></el-input>
          </el-form-item>
          <el-form-item label="部门电话">
            <el-input v-model="dept.phone"></el-input>
          </el-form-item>
          <el-form-item label="部门地址">
            <el-input v-model="dept.address"></el-input>
          </el-form-item>
          <el-form-item label="序号">
            <el-input v-model="dept.orderNum"></el-input>
          </el-form-item>
        </el-form>
      </div>
    </system-dialog>

    <!-- 选择所属部门窗口 -->
    <system-dialog
      :title="parentDialog.title"
      :visible="parentDialog.visible"
      :width="parentDialog.width"
      :height="parentDialog.height"
      @onClose="parentOnClose"
      @onConfirm="parentOnConfirm"
    >
      <div slot="content">
        <el-tree
          ref="parentTree"
          :data="treeList"
          node-key="id"
          :props="defaultProps"
          :default-expand-all="true"
          :highlight-current="true"
          :expand-on-click-node="false"
          @node-click="handleNodeClick"
        >
          <div class="customer-tree-node" slot-scope="{ node, data }">
            <span v-if="data.children.length === 0">
              <i class="el-icon-document"></i>
            </span>
            <span v-else @click="openBtn(data)">
              <svg-icon v-if="data.open" icon-class="add-s" />
              <svg-icon v-else icon-class="sub-s" />
            </span>
            <span style="margin-left: 5px">{{ node.label }}</span>
          </div>
        </el-tree>
      </div>
    </system-dialog>
  </el-main>
</template>

<script>
import departmentApi from '@/api/department';
import SystemDialog from '@/components/system/SystemDialog.vue';

export default {
  name: 'department',
  components: {
    SystemDialog,
  },
  data() {
    return {
      searchModel: {
        departmentName: '',
      },
      tableData: [],
      deptDialog: {
        title: '新增部门',
        visible: false,
        width: 560,
        height: 170,
      },
      dept: {
        id: '',
        pid: '',
        parentName: '',
        departmentName: '',
        address: '',
        phone: '',
        orderNum: '',
      },
      rules: {
        parentName: [{ required: true, trigger: 'change', message: '请选择所属部门' }],
        departmentName: [{ required: true, trigger: 'blur', message: '请输入部门名称' }],
      },
      parentDialog: {
        title: '选择所属部门',
        visible: false,
        width: 300,
        height: 400,
      },
      treeList: [],
      defaultProps: {
        children: 'children',
        label: 'departmentName',
      },
    };
  },
  methods: {
    async search() {
      const res = await departmentApi.getDepartmentList(this.searchModel);
      if (res.success) {
        this.tableData = res.data;
      }
    },
    resetValue() {
      this.searchModel.departmentName = '';
      this.search();
    },
    onClose() {
      this.deptDialog.visible = false;
    },
    async onConfirm() {
      this.$refs.deptForm.validate(async (valid) => {
        if (valid) {
          let res = null;
          if (this.dept.id === '') {
            res = await departmentApi.addDept(this.dept);
          } else {
            res = await departmentApi.updateDept(this.dept);
          }
          if (res.success) {
            this.$message.success(res.message);
            this.search();
            this.deptDialog.visible = false;
          } else {
            this.$message.error(res.message);
          }
        }
      });
    },
    openAddWindow() {
      this.$resetForm('deptForm', this.dept);
      this.deptDialog.title = '新增部门';
      this.deptDialog.visible = true;
    },
    handleEdit(row) {
      this.$objCopy(row, this.dept);
      this.deptDialog.title = '编辑部门';
      this.deptDialog.visible = true;
    },
    async handleDelete(row) {
      let result = await departmentApi.checkDepartment({ id: row.id });
      if (!result.success) {
        this.$message.warning(result.message);
      } else {
        let confirm = await this.$myconfirm('确定要删除该数据吗?');
        if (confirm) {
          let res = await departmentApi.deleteById({ id: row.id });
          if (res.success) {
            this.$message.success(res.message);
            this.search();
          } else {
            this.$message.error(res.message);
          }
        }
      }
    },
    async selectDepartment() {
      this.parentDialog.visible = true;
      this.parentDialog.title = '选择所属部门';
      let res = await departmentApi.getParentTreeList();
      if (res.success) {
        this.treeList = res.data;
      }
    },
    parentOnClose() {
      this.parentDialog.visible = false;
    },
    parentOnConfirm() {
      this.parentDialog.visible = false;
    },
    handleNodeClick(data) {
      this.dept.pid = data.id;
      this.dept.parentName = data.departmentName;
    },
    openBtn(data) {
      data.open = !data.open;
      this.$refs.parentTree.store.nodesMap[data.id].expanded = !data.open;
    },
  },
  created() {
    this.search();
  },
};
</script>

<style lang="scss" scoped>
::v-deep {
  .el-tree {
    .el-tree-node {
      position: relative;
      padding-left: 10px;
    }
    .el-tree-node__children {
      padding-left: 20px;
    }
    .el-tree-node :last-child:before {
      height: 40px;
    }
    .el-tree > .el-tree-node:before {
      border-left: none;
    }
    .el-tree > .el-tree-node:after {
      border-top: none;
    }
    .el-tree-node:before,
    .el-tree-node:after {
      content: "";
      left: -4px;
      position: absolute;
      right: auto;
      border-width: 1px;
    }
    .tree :first-child .el-tree-node:before {
      border-left: none;
    }
  }
}
</style>
