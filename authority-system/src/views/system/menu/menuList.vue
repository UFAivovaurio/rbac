<template>
    <el-main>
      <!-- 新增按钮 -->
      <el-button type="success" icon="el-icon-plus" @click="openAddWindow">新增</el-button>
  
      <!-- 数据表格 -->
      <el-table
        style="margin-top: 10px"
        :height="tableHeight"
        :data="menuList"
        row-key="id"
        default-expand-all
        :tree-props="{ children: 'children' }"
        :border="true"
        stripe
      >
        <el-table-column prop="label" label="菜单名称"></el-table-column>
  
        <el-table-column prop="type" label="菜单类型" align="center">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.type == '0'" size="normal">目录</el-tag>
            <el-tag type="success" v-else-if="scope.row.type == '1'" size="normal">菜单</el-tag>
            <el-tag type="warning" v-else-if="scope.row.type == '2'" size="normal">按钮</el-tag>
          </template>
        </el-table-column>
  
        <el-table-column prop="icon" label="图标" align="center">
          <template slot-scope="scope">
            <i :class="scope.row.icon" v-if="scope.row.icon.includes('el-icon')"></i>
            <svg-icon v-else :icon-class="scope.row.icon"></svg-icon>
          </template>
        </el-table-column>
  
        <el-table-column prop="name" label="路由名称"></el-table-column>
        <el-table-column prop="path" label="路由地址"></el-table-column>
        <el-table-column prop="url" label="组件路径"></el-table-column>
  
        <el-table-column align="center">
    <template slot-scope="scope">
     <el-button
         type="primary"
         icon="el-icon-edit"
        size="small"
        @click="editMenu(scope.row)"
        >编辑
    </el-button>
    <el-button
        type="danger"
        size="small"
        icon="el-icon-delete"
        @click="deleteMenu(scope.row)"
        >删除
    </el-button>
    </template> 
    </el-table-column>
      </el-table>
  
      <!-- 新增或编辑弹框 -->
      <system-dialog
        :title="menuDialog.title"
        :width="menuDialog.width"
        :height="menuDialog.height"
        :visible="menuDialog.visible"
        @onClose="onClose"
        @onConfirm="onConfirm"
      >
        <div slot="content">
          <el-form
            :model="menu"
            ref="menuForm"
            :rules="rules"
            label-width="80px"
            :inline="true"
            size="small"
          >
            <el-row>
              <el-col :span="24">
                <el-form-item prop="type" label="菜单类型">
                  <el-radio-group v-model="menu.type">
                    <el-radio :label="0">目录</el-radio>
                    <el-radio :label="1">菜单</el-radio>
                    <el-radio :label="2">按钮</el-radio>
                  </el-radio-group>
                </el-form-item>
              </el-col>
            </el-row>
            <el-form-item prop="parentName" label="所属菜单">
              <el-input @click.native="selectParentMenu" v-model="menu.parentName" :readonly="true"></el-input>
            </el-form-item>
            <el-form-item prop="label" label="菜单名称">
              <el-input v-model="menu.label"></el-input>
            </el-form-item>
            <el-form-item label="菜单图标">
                <div class="chooseIcons">
  <el-popover placement="bottom" width="450" trigger="click">
    <span
      slot="reference"
      style="
        display: inline-block;
        width: 200px;
        height: 33px;
        line-height: 33px;
      "
    >
      <i :class="userChooseIcon"></i>
     {{ userChooseIcon }}
    </span>
    <div class="iconList">
      <i
        v-for="item in iconList"
            :key="item"
            :class="item"
            @click="setIcon(item)"
            style="font-size: 20px;"
            ></i>
    </div>
  </el-popover>
                </div>
            </el-form-item>
            <el-form-item v-if="menu.type == 1" prop="name" label="路由名称">
              <el-input v-model="menu.name"></el-input>
            </el-form-item>
            <el-form-item v-if="menu.type != 2" prop="path" label="路由地址">
              <el-input v-model="menu.path"></el-input>
            </el-form-item>
            <el-form-item v-if="menu.type == 1" prop="url" label="组件路径">
              <el-input v-model="menu.url"></el-input>
            </el-form-item>
            <el-form-item prop="code" label="权限字段">
              <el-input v-model="menu.code"></el-input>
            </el-form-item>
            <el-form-item label="菜单序号">
              <el-input v-model="menu.orderNum"></el-input>
            </el-form-item>
            <el-form-item size="small" label="菜单图标">
  <my-icon @selecticon="setIcon" ref="child"></my-icon>
</el-form-item>
          </el-form>
        </div>
      </system-dialog>
  
      <!-- 选择所属菜单弹框 -->
      <system-dialog
        :title="parentDialog.title"
        :width="parentDialog.width"
        :height="parentDialog.height"
        :visible="parentDialog.visible"
        @onClose="onParentClose"
        @onConfirm="onParentConfirm"
      >
        <div slot="content">
          <el-tree
            :data="parentMenuList"
            node-key="id"
            :props="defaultProps"
            empty-text="暂无数据"
            show-checkbox="false"
            default-expand-all
            :highlight-current="true"
            :expand-on-click-node="false"
            @node-click="handleNodeClick"
          >
            <span class="customer-tree-node" slot-scope="{ node, data }">
              <span v-if="data.children.length === 0">
                <i class="el-icon-document" style="color: #8c8c8c; font-size: 18px" />
              </span>
              <span v-else @click.stop="openBtn(data)">
                <svg-icon v-if="data.open" icon-class="add-s"/>
                <svg-icon v-else icon-class="sub-s"/>
              </span>
              <span style="margin-left: 3px">{{ node.label }}</span>
            </span>
          </el-tree>
        </div>
      </system-dialog>
      

    </el-main>
  </template>
  
  <script>
  import menuApi from '@/api/menu'
  import SystemDialog from '@/components/system/SystemDialog.vue';
  import { elementIcons } from "@/utils/icons";  // 自定义图标库
  //导入自定义图标组件
import MyIcon from '@/components/system/MyIcon.vue'

  export default {
    name: 'menuList',
    components: {
      SystemDialog,
      MyIcon
    },
    data() {
      return {
        parentDialog: {
          title: '选择所属菜单',
          width: 280,
          height: 450,
          visible: false
        },
        defaultProps: {
          children: 'children',
          label: 'label'
        },
        parentMenuList: [],
        menuDialog: {
          title: "",
          width: 630,
          height: 270,
          visible: false
        },
        menu: {
          id: "",
          type: "",
          parentId: "",
          parentName: "",
          label: "",
          icon: "",
          name: "",
          path: "",
          url: "",
          code: "",
          orderNum: "",
        },
        rules: {
          type: [{ required: true, trigger: "change", message: "请选择菜单类型" }],
          parentName: [{ required: true, trigger: "change", message: "请选择所属菜单" }],
          label: [{ required: true, trigger: "blur", message: "请输入菜单名称" }],
          name: [{ required: true, trigger: "blur", message: "请输入路由名称" }],
          path: [{ required: true, trigger: "blur", message: "请输入路由路径" }],
          url: [{ required: true, trigger: "blur", message: "请输入组件路径" }],
          code: [{ required: true, trigger: "blur", message: "请输入权限字段" }],
        },
        menuList: [],
        tableHeight: 0
      };
    },
    methods: {
      async search() {
        try {
          const res = await menuApi.getMenuList();
          if (res.success) {
            this.menuList = res.data;
          } else {
            this.$message.error('获取菜单数据失败');
          }
        } catch (error) {
          this.$message.error('请求失败');
        }
      },
      /**
     * 打开添加窗口
     */
    openAddWindow() {
      this.$resetForm('menuForm', this.menu) //清空表单数据
      this.menuDialog.title = '新增菜单' //设置窗口标题
      this.menuDialog.visible = true //显示窗口
      this.$nextTick(() => {
        this.$refs["child"].userChooseIcon = "";//清空菜单图标
     })
   },

      /**
     * 给icon绑定的点击事件
     * @param icon
     */
    setIcon(icon) {
      this.menu.icon = icon;
   },

      onClose() {
        this.menuDialog.visible = false;
      },
      /**
 * 添加和修改菜单窗口确认事件
 */
onConfirm() {
  //表单验证
  this.$refs.menuForm.validate(async (valid) => {
    if (valid) {
      let res = null;
      //判断菜单ID是否为空
      if (this.menu.id === "") {
        //发送添加请求
        res = await menuApi.addMenu(this.menu);
     } else {
        //发送修改请求
        res = await menuApi.updateMenu(this.menu);
     }
      //判断是否成功
      if (res.success) {
        this.$message.success(res.message);
        //刷新
        //this.search();
        window.location.reload();
        //关闭窗口
        this.menuDialog.visible = false;
     } else {
        this.$message.error(res.message);
     }
   }
 })
},

      selectParentMenu() {
        this.parentDialog.visible = true;
        menuApi.getParentMenuList().then(res => {
          if (res.success) {
            this.parentMenuList = res.data;
          } else {
            this.$message.error('获取父菜单列表失败');
          }
        });
      },
      handleNodeClick(node) {
        this.menu.parentName = node.label;
        this.menu.parentId = node.id;
        this.parentDialog.visible = false;
      },
      onParentClose() {
        this.parentDialog.visible = false;
      },
     /**
 * 编辑菜单
 * @param row
 */
editMenu(row) {
  //把当前要编辑的数据复制到数据域，给表单回显
  this.$objCopy(row, this.menu);
  //设置弹框属性
  this.menuDialog.title = "编辑菜单";
  this.menuDialog.visible = true;
  this.$nextTick(() => {
    this.$refs["child"].userChooseIcon = row.icon;//菜单图标回显
 })
},

    async deleteMenu(row){
        let result = await menuApi.checkPermission({id:row.id})
        if(!result.success){
            this.$message.warning(result.message);
        }else{
            let confirm = await this.$myconfirm("确定要删除该数据么？");
            if(confirm){
                let res =  await menuApi.deleteById({id:row.id});
                if(res.success){
                    this.message.success(res.message);
                    this.search();
                }else{
                    this.$message.error(res.message);
                }
            }
        }
    },
     
    mounted() {
      this.search();
      this.tableHeight = window.innerHeight - 160;
    },
    created(){
        this.search();
    }
  }
}
  </script>
  
  <style scoped>
  /* 自定义样式 */
  .customer-tree-node {
    cursor: pointer;
  }
  </style>
  