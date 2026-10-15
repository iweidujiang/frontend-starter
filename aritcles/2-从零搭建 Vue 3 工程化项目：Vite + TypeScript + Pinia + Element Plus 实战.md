# 从零搭建 Vue 3 工程化项目：Vite + TypeScript + Pinia + Element Plus 实战



## 前言

在 [收藏向 | 2026 前端开发知识体系：React、Vue、Next.js、Nuxt 全解析](https://mp.weixin.qq.com/s/2gcPBYCAYOch70eq3glOxA) 中，我们把前端技术栈拆成了 12 个模块，解决了「有哪些、各管什么」的问题。

但真正动手做项目时，难点往往不是「知不知道 Vite、Pinia」，而是「先装什么、目录怎么分、规范怎么落地、请求怎么封装」。

本篇就沿着第 1 篇的脉络，用 Vue 3 技术栈（Vite + TypeScript + Pinia + Vue Router + Element Plus）串一条完整的落地链路。

读完你应该能独立搭出一个能开发、能规范、能构建的项目骨架，而不是停留在会用某个 API。

本篇技术栈选型如下：

| 关注点 | 选型 | 理由 |
| :--- | :--- | :--- |
| 构建工具 | Vite | 冷启动快、配置轻，Vue 官方推荐 |
| 语言 | TypeScript | 大型项目可维护性与类型提示 |
| 状态管理 | Pinia | Vue 官方推荐，组合式 API 友好 |
| 路由 | Vue Router | 官方路由，支持嵌套与守卫 |
| UI 组件库 | Element Plus | 中后台常用，按需引入 |
| HTTP 客户端 | Axios | 拦截器机制成熟，统一处理 token 与错误 |
| 代码规范 | ESLint + Prettier + Husky | 统一风格、提交前检查 |



## 工程化搭建全景思维导图

先用一张思维导图展示本篇的完整搭建链路，你可以先扫一眼这张图，建立对工程化脚手架的整体认知：

![image-20261014220000001](D:\a-github-project\everything\技术博文\前端杂项\2-从零搭建 Vue 3 工程化项目.assets\image-20261014220000001.png)

> 思维导图结构（供绘制参考）：
>
> ```
> Vue 3 工程化项目搭建
> ├── 一、项目初始化
> │   ├── pnpm create vite（vue-ts 模板）
> │   └── 安装核心依赖
> ├── 二、目录结构设计
> │   ├── api / assets / components / composables
> │   ├── router / stores / utils / views
> │   └── 路径别名配置（vite + tsconfig）
> ├── 三、TypeScript 类型声明
> │   └── env.d.ts（ImportMetaEnv）
> ├── 四、代码规范落地
> │   ├── ESLint 10 flat config
> │   ├── Prettier 格式化
> │   └── Husky + lint-staged 提交前检查
> ├── 五、路由搭建
> │   ├── Vue Router 配置
> │   ├── 嵌套路由与懒加载
> │   └── 全局前置守卫（登录鉴权）
> ├── 六、状态管理（Pinia）
> │   ├── 组合式 Store 定义
> │   └── 组件中消费
> ├── 七、数据请求封装
> │   ├── Axios 实例创建
> │   ├── 请求拦截器（token）
> │   ├── 响应拦截器（错误 & 401）
> │   └── 业务接口层
> ├── 八、UI 方案与按需引入
> │   ├── Element Plus 安装
> │   └── unplugin 自动导入
> ├── 九、环境变量与开发代理
> │   ├── .env.development / .env.production
> │   └── Vite server.proxy
> └── 十、构建与验证
>     ├── pnpm lint
>     └── pnpm build
> ```



---

## 一、项目初始化

先用 pnpm 创建 Vite + Vue + TS 项目。pnpm 的硬链接机制能节省磁盘空间，也方便后续 monorepo。

```bash
pnpm create vite my-app --template vue-ts
cd my-app
pnpm install
pnpm dev
```

`vue-ts` 模板已经内置了 Vite、Vue 3、TypeScript 与 `@vitejs/plugin-vue`，开箱即可运行。

接着安装本篇所需的全部依赖：

```bash
# 运行时依赖
pnpm add vue-router pinia axios element-plus

# 开发依赖
pnpm add -D @types/node unplugin-vue-components unplugin-auto-import
pnpm add -D eslint prettier husky lint-staged
pnpm add -D @eslint/js typescript-eslint eslint-plugin-vue eslint-plugin-prettier eslint-config-prettier
```

> **说明：** ESLint 10 已彻底移除 `.eslintrc.*`  legacy 配置，必须使用 flat config（`eslint.config.mjs`），因此需要额外安装 `@eslint/js` 和 `typescript-eslint`。



## 二、目录结构

一个清晰的分层目录是长期维护的基础。建议按职责划分，而不是按类型堆砌。

```text
src/
── api/           # 接口请求封装
── assets/        # 静态资源
├── components/    # 通用组件
├── composables/   # 组合式函数（useXxx）
├── router/        # 路由配置
├── stores/        # Pinia 状态
├── utils/         # 工具函数（request 等）
├── views/         # 页面级组件
├── App.vue
├── env.d.ts       # 环境变量类型声明
├── main.ts
└── style.css      # 全局样式
```

顺手配置路径别名，避免满屏的 `../../`：

```ts
// vite.config.ts
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
```

配置别名后记得在 `tsconfig.app.json` 中同步。注意 TypeScript 6 已废弃 `baseUrl`，`paths` 必须使用相对路径：

```json
{
  "extends": "@vue/tsconfig/tsconfig.dom.json",
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src/env.d.ts", "src/**/*.ts", "src/**/*.vue"]
}
```

> **踩坑提示：** 旧教程中常见的 `"baseUrl": "."` 写法在 TypeScript 6 中会报 `TS5101` 废弃警告，TS 7 将彻底移除。去掉 `baseUrl` 后，`paths` 的值改为 `"./src/*"` 即可，TypeScript 会相对于 tsconfig 文件位置解析。



## 三、TypeScript 类型声明

Vite 通过 `import.meta.env` 注入环境变量，但 TypeScript 不知道这些变量的存在，需要手动声明类型。

新建 `src/env.d.ts`：

```ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
  readonly VITE_API_BASE_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

这样在代码中使用 `import.meta.env.VITE_API_BASE_URL` 时就有完整的类型提示，写错变量名也会在编译期报错。



## 四、代码规范落地

规范靠自觉是守不住的，要靠工具强制。ESLint 负责检查、Prettier 负责格式化、Husky + lint-staged 在提交前自动跑一遍。

### 4.1 Prettier 配置

```json
// .prettierrc.json
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "none"
}
```

### 4.2 ESLint 10 Flat Config

ESLint 10 不再支持 `.eslintrc.*`，必须使用 `eslint.config.mjs`：

```js
// eslint.config.mjs
import js from '@eslint/js'
import ts from 'typescript-eslint'
import vue from 'eslint-plugin-vue'
import prettier from 'eslint-plugin-prettier/recommended'

export default [
  {
    ignores: ['dist/**', 'node_modules/**', 'src/auto-imports.d.ts', 'src/components.d.ts']
  },
  js.configs.recommended,
  ...ts.configs.recommended,
  ...vue.configs['flat/recommended'],
  prettier,
  {
    files: ['**/*.vue'],
    languageOptions: {
      parserOptions: {
        parser: ts.parser
      }
    }
  },
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'vue/multi-word-component-names': 'off'
    }
  }
]
```

> **踩坑提示：** 旧版 `--ext .vue,.ts` 参数在 flat config 中已不支持，`package.json` 的 lint 脚本应改为 `eslint . --fix`。

### 4.3 Husky + lint-staged

```bash
pnpm exec husky init
echo "npx lint-staged" > .husky/pre-commit
```

在 `package.json` 中声明提交前自动格式化的范围：

```json
{
  "lint-staged": {
    "*.{js,ts,vue}": ["prettier --write", "eslint --fix"]
  }
}
```

这样任何人 `git commit` 时，改动的文件都会被自动检查与格式化，脏代码进不了仓库。



---

## 五、路由搭建

安装并配置 Vue Router，用 `createWebHistory` 启用干净的 URL。

```bash
pnpm add vue-router
```

路由配置支持嵌套与懒加载，路由组件按需引入可减小首屏体积：

```ts
// router/index.ts
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/login', name: 'Login', component: () => import('@/views/Login.vue') },
    {
      path: '/',
      component: () => import('@/views/Layout.vue'),
      children: [
        { path: '', name: 'Home', component: () => import('@/views/Home.vue') }
      ]
    }
  ]
})

export default router
```

配合全局前置守卫做登录鉴权，这是路由里最实用的能力：

```ts
// router/index.ts（追加）
router.beforeEach((to) => {
  const token = localStorage.getItem('token')
  if (to.meta.requiresAuth && !token) {
    return { path: '/login' }
  }
})
```

> **说明：** `import.meta.env.BASE_URL` 是 Vite 内置变量，代表应用的部署基础路径，默认值为 `/`。部署到子路径时（如 `https://example.com/app/`），只需在 Vite 配置中设置 `base: '/app/'`，路由会自动适配。



---

## 六、状态管理（Pinia）

安装 Pinia 并在入口注册：

```bash
pnpm add pinia
```

```ts
// main.ts
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import router from './router'
import App from './App.vue'
import './style.css'

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.use(ElementPlus)
app.mount('#app')
```

> **注意：** Element Plus 的 CSS 必须在 `main.ts` 中显式引入，否则组件样式不会生效。

用组合式写法定义 Store，类型推导更友好：

```ts
// stores/user.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { userApi } from '@/api/user'

export const useUserStore = defineStore('user', () => {
  const token = ref(localStorage.getItem('token') || '')
  const userInfo = ref<{ name: string } | null>(null)

  async function login(username: string, password: string) {
    const res = await userApi.login({ username, password })
    token.value = res.token
    localStorage.setItem('token', res.token)
  }

  async function fetchUserInfo() {
    userInfo.value = await userApi.getUserInfo()
  }

  function logout() {
    token.value = ''
    userInfo.value = null
    localStorage.removeItem('token')
  }

  return { token, userInfo, login, fetchUserInfo, logout }
})
```

组件中直接消费：

```vue
<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

function handleLogout() {
  userStore.logout()
  router.replace('/login')
}
</script>

<template>
  <div>
    <h1>首页</h1>
    <el-button @click="handleLogout">退出登录</el-button>
  </div>
</template>
```



---

## 七、数据请求封装

请求层的价值在于统一处理 baseURL、token、错误与登录失效，而不是每处都手写 fetch。

```bash
pnpm add axios
```

```ts
// utils/request.ts
import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios'
import { ElMessage } from 'element-plus'
import router from '@/router'

const service: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000
})

// 请求拦截：统一带上 token
service.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 响应拦截：统一处理错误与登录失效
service.interceptors.response.use(
  (response: AxiosResponse) => {
    return response.data
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      router.replace('/login')
    }
    ElMessage.error(error.message || '请求失败')
    return Promise.reject(error)
  }
)

export function get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
  return service.get(url, config) as Promise<T>
}

export function post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
  return service.post(url, data, config) as Promise<T>
}
```

> **踩坑提示 1：** 响应拦截器返回了 `response.data`，但 TypeScript 认为 `service.get()` 返回的是 `Promise<AxiosResponse<T>>`，拦截器的类型变换不会被类型系统自动感知。需要在 `get` / `post` 函数中加 `as Promise<T>` 断言。
>
> **踩坑提示 2：** 不要在请求拦截器里调用 `useUserStore()`。Axios 拦截器在模块加载时就会注册，而 Pinia Store 需要等 `app.use(createPinia())` 之后才能使用，在拦截器里调用会导致「Pinia 未激活」的运行时错误。直接从 `localStorage` 读取 token 是最稳妥的做法。

业务接口只关心「调哪个接口、拿什么数据」：

```ts
// api/user.ts
import { get, post } from '@/utils/request'

export interface LoginParams {
  username: string
  password: string
}

export interface UserInfo {
  id: number
  name: string
  role: string
}

export const userApi = {
  login: (data: LoginParams) => post<{ token: string }>('/user/login', data),
  getUserInfo: () => get<UserInfo>('/user/info')
}
```



---

## 八、UI 方案与按需引入

Element Plus 配合 `unplugin-vue-components` 实现按需自动引入，省去手动 import 组件：

```bash
pnpm add element-plus
pnpm add -D unplugin-vue-components unplugin-auto-import
```

```ts
// vite.config.ts
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

export default defineConfig({
  plugins: [
    vue(),
    AutoImport({
      resolvers: [ElementPlusResolver()],
      imports: ['vue', 'vue-router', 'pinia'],
      dts: 'src/auto-imports.d.ts'
    }),
    Components({
      resolvers: [ElementPlusResolver()],
      dts: 'src/components.d.ts'
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  }
})
```

之后模板里可直接使用 `<el-table>`、`<el-button>`，无需手动注册：

```vue
<template>
  <el-table :data="users">
    <el-table-column prop="name" label="姓名" />
    <el-table-column prop="email" label="邮箱" />
  </el-table>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { userApi } from '@/api/user'

const users = ref<UserInfo[]>([])

userApi.getUserList({ page: 1, size: 10 }).then((res) => {
  users.value = res.list
})
</script>
```

> **说明：** `unplugin-auto-import` 的 `imports: ['vue', 'vue-router', 'pinia']` 配置会自动把 `ref`、`computed`、`useRouter`、`defineStore` 等 API 注入为全局可用，无需在每个文件中手动 import。生成的类型声明文件 `src/auto-imports.d.ts` 和 `src/components.d.ts` 应加入 `.gitignore` 或提交到仓库（推荐提交，保证 CI 环境也能获得类型提示）。



---

## 九、环境变量与开发代理

不同环境的接口地址、功能开关用环境变量区分，避免把测试地址带到生产。

```bash
# .env.development
VITE_APP_TITLE=前端项目实战手册
VITE_API_BASE_URL=/api

# .env.production
VITE_APP_TITLE=前端项目实战手册
VITE_API_BASE_URL=https://api.example.com
```

> **注意：** 开发环境中 `VITE_API_BASE_URL` 设为 `/api` 是相对路径，需要配合 Vite 的 `server.proxy` 把请求转发到后端服务（见第八节 vite.config.ts 中的 `server.proxy` 配置）。生产环境则直接填写完整的后端地址。

代码里通过 `import.meta.env.VITE_API_BASE_URL` 读取（见第七节）。构建时 Vite 会按模式注入对应变量：

```bash
pnpm build
pnpm preview
```

`pnpm preview` 用生产构建产物本地预览，是上线前验证构建结果是否正常的最后一道关口。



---

## 本篇小结

到这里，一个 Vue 3 项目的工程骨架已经成型：

- 用 pnpm + Vite 完成初始化与别名配置
- 用 `@vue/tsconfig` + 相对路径 `paths` 配置 TypeScript（兼容 TS 6）
- 用 `env.d.ts` 声明环境变量类型
- 用 ESLint 10 flat config + Husky 强制代码规范
- 用 Vue Router 搭建路由与鉴权守卫
- 用 Pinia 组合式 API 管理全局状态
- 用 Axios 拦截器统一封装请求（避免在拦截器中调用 Store）
- 用 Element Plus + unplugin 按需引入提升开发效率
- 用环境变量 + Vite proxy 隔离多环境配置

这套骨架解决的是「能不能持续开发」的问题。但代码写完只是开始，怎么把它安全、稳定地发到线上，才是很多前端团队的短板。第 3 篇《前端项目部署全流程：Docker + Nginx + CI/CD》会接着本篇，把这份构建产物一路推到线上。
