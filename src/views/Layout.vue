<template>
  <el-container class="layout">
    <el-aside width="200px">菜单</el-aside>
    <el-main>
      <router-view />
    </el-main>
  </el-container>
</template>

<style scoped>
.layout {
  height: 100vh;
}
.el-aside {
  background: #303133;
  color: #fff;
  line-height: 200px;
  text-align: center;
}
</style>