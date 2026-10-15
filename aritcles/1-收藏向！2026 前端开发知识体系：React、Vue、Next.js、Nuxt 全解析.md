# 收藏向 | 2026 前端开发知识体系：React、Vue、Next.js、Nuxt 全解析

## 前言

前端开发早就不再是"写写页面、调调样式"那么简单的事了。

今天的一名前端工程师，需要围绕**语言基础、框架生态、构建工程化、路由与数据、状态管理、样式与 UI、测试、性能、安全、部署**这一整条链路建立起完整的知识体系。

技术更新很快，但底层结构其实相对稳定：HTML 管结构、CSS 管表现、JavaScript 管交互、TypeScript 管类型安全；框架负责把 UI 组件化，工程化工具负责把代码变成可运行的产物，测试和性能负责保证质量。

本文的目的是做 **一份可以长期收藏、按需查阅的前端知识库** 。

下面正式开始。



## 技术栈全景思维导图

先用一张思维导图直观地展示整份知识库的结构，你可以先扫一眼这张图，建立起对现代前端技术栈的整体地图：



![image-20261013183405184](D:\a-github-project\everything\技术博文\前端杂项\1-收藏向！2026 前端开发知识体系：React、Vue、Next.js、Nuxt 全解析.assets\image-20261013183405184.png)





## 一、语言基础：HTML、CSS、JavaScript、TypeScript

语言基础是前端开发的底层能力。

无论框架如何更替，HTML 负责结构，CSS 负责表现，JavaScript 负责交互，TypeScript 负责类型安全和工程化约束。

掌握它们，才能在复杂项目中判断代码质量、排查疑难问题并进行长期维护——这也是为什么很多框架原理最终都会"回到"原生 JavaScript 上。

### 1. HTML

**HTML 是页面的骨架。**

现代 HTML 不只是写标签，更强调语义化、可访问性和 SEO。使用合适的语义标签，可以帮助浏览器、搜索引擎和屏幕阅读器更好地理解页面结构。

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>语义化页面示例</title>
</head>
<body>
  <header>
    <nav>
      <a href="/">首页</a>
      <a href="/about">关于</a>
    </nav>
  </header>

  <main>
    <section>
      <h1>欢迎来到前端知识库</h1>
      <p>这是一个语义化 HTML 示例。</p>
    </section>

    <article>
      <h2>文章标题</h2>
      <p>文章内容...</p>
    </article>
  </main>

  <footer>
    <p>(c) 2026 Frontend Knowledge Base</p>
  </footer>
</body>
</html>
```

常用语义化标签：`<header>` 页头、`<nav>` 导航、`<main>` 主体内容、`<section>` 区块、`<article>` 文章、`<aside>` 侧边栏、`<footer>` 页脚。

核心原则是避免所有结构都用 `div` 堆叠。

### 2. CSS

**CSS 负责页面布局、色彩、动画和响应式适配。**

现代布局主要依赖 Flexbox 和 Grid，配合媒体查询和容器查询可以实现多端适配。

实际开发中，CSS 还需要和组件化、原子化样式、CSS Modules 等方案结合使用（详见下文第八小节）。

Flex 布局（适合一维排列）：

```css
.container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
}

.item {
  flex: 1;
  padding: 12px;
  background: #f5f5f5;
  border-radius: 8px;
}
```

Grid 布局（适合二维网格）：

```css
.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.card {
  padding: 16px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}
```

响应式适配：

```css
@media (max-width: 768px) {
  .grid {
    grid-template-columns: 1fr;
  }
}
```

### 3. JavaScript

**JavaScript 是前端交互的核心。**

现代 JavaScript 开发需要重点关注异步编程、事件机制、DOM 操作、模块化以及错误处理。

很多框架能力最终都会回到 JavaScript 运行机制上，因此扎实理解闭包、`this`、原型链、事件循环等概念，比单纯记 API 更重要。

异步请求（Promise / async-await + 错误处理）：

```js
async function fetchUser(id) {
  try {
    const res = await fetch(`/api/users/${id}`);
    if (!res.ok) {
      throw new Error(`请求失败: ${res.status}`);
    }
    const user = await res.json();
    console.log(user);
  } catch (error) {
    console.error(error);
  }
}

fetchUser(1);
```

事件委托（利用冒泡，减少监听器数量）：

```js
document.getElementById("list").addEventListener("click", (e) => {
  const item = e.target.closest(".list-item");
  if (!item) return;
  console.log("点击了:", item.dataset.id);
});
```

### 4. TypeScript

**TypeScript 为 JavaScript 增加了静态类型能力，能显著提升大型项目的可维护性。**

它可以帮助开发者在编码阶段就发现类型错误，配合 IDE 也能获得更好的自动补全和重构体验。

如今 TS 已经不是"可选项"，而是中大型项目的"必选项"。

基础类型与接口：

```ts
interface User {
  id: number;
  name: string;
  email?: string;
}

function greet(user: User): string {
  return `你好，${user.name}`;
}

const user: User = {
  id: 1,
  name: "前端开发者",
  email: "dev@example.com",
};

console.log(greet(user));
```

常用工具类型：

```ts
type PartialUser = Partial<User>;        // 所有属性变可选
type UserName = Pick<User, "name">;      // 选取部分属性
type WithoutEmail = Omit<User, "email">; // 排除部分属性
type UserMap = Record<string, User>;     // 构建键值类型
```

泛型（组件库开发的灵魂，保证类型在传递过程中不丢失）：

```ts
function firstItem<T>(arr: T[]): T | undefined {
  return arr[0];
}

const num = firstItem([1, 2, 3]);  // number | undefined
const str = firstItem(["a", "b"]); // string | undefined
```

实践建议：项目中尽量少用 `any`；如果确实不确定类型，优先使用 `unknown`，它强制你在操作前进行类型检查，比 `any` 安全得多。



## 二、框架生态：React、Vue、Angular、Svelte

前端框架的核心价值是把 UI 拆分为可复用的组件，并统一管理状态、渲染和生命周期。

React 强调函数式思想和生态扩展，Vue 强调渐进式和开发体验，Angular 适合强规范的大型企业项目，Svelte 则通过编译时方案减少运行时开销。

选框架本质是在"生态成熟度、上手成本、团队规范、性能诉求"之间做权衡。

### 1. React

**React 以组件化和 Hooks 为核心，适合构建复杂交互应用。**

它的生态非常成熟，围绕路由、状态管理、数据请求、服务端渲染都有完善方案，React 是一个专注视图层的库，把选型自由留给了开发者。

函数组件与状态：

```tsx
import { useState } from "react";

export default function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>当前计数：{count}</p>
      <button onClick={() => setCount(count + 1)}>增加</button>
      <button onClick={() => setCount(0)}>重置</button>
    </div>
  );
}
```

Hooks 数据加载：

```tsx
import { useEffect, useState } from "react";

interface User {
  id: number;
  name: string;
}

export default function UserList() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/users")
      .then((r) => r.json())
      .then((data) => {
        setUsers(data);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>加载中...</p>;

  return (
    <ul>
      {users.map((user) => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}
```

### 2. Vue

**Vue 的响应式系统和组合式 API 让状态管理更直观。**

它既适合快速开发中小型项目，也能支撑复杂的企业级应用，文档对初学者尤其友好。`<script setup>` 语法糖已成为 Vue 3 的标准写法。

组合式 API：

```vue
<script setup lang="ts">
import { ref, computed } from "vue";

const count = ref(0);
const double = computed(() => count.value * 2);

function increase() {
  count.value++;
}
</script>

<template>
  <div>
    <p>当前计数：{{ count }}</p>
    <p>双倍值：{{ double }}</p>
    <button @click="increase">增加</button>
  </div>
</template>
```

列表渲染：

```vue
<script setup lang="ts">
import { ref } from "vue";

interface User {
  id: number;
  name: string;
}

const users = ref<User[]>([
  { id: 1, name: "Alice" },
  { id: 2, name: "Bob" },
]);
</script>

<template>
  <ul>
    <li v-for="user in users" :key="user.id">
      {{ user.name }}
    </li>
  </ul>
</template>
```

### 3. Angular

**Angular 是一个完整的框架，内置组件、路由、表单、HTTP 客户端和依赖注入。**

它强制使用 TypeScript，规范严格，更适合团队规模较大、需要统一约束的大型企业项目（如银行、金融系统）。

组件示例：

```ts
import { Component } from "@angular/core";

@Component({
  selector: "app-counter",
  template: `
    <div>
      <p>当前计数：{{ count }}</p>
      <button (click)="increase()">增加</button>
    </div>
  `,
})
export class CounterComponent {
  count = 0;

  increase(): void {
    this.count++;
  }
}
```

### 4. Svelte

**Svelte 把很多工作放到编译阶段完成，因此运行时更轻量。**

它没有虚拟 DOM，状态更新被直接编译成高效的原生 DOM 操作，包体积和性能表现优秀，适合对首屏速度和体积有极致要求的场景。

```svelte
<script>
  let count = 0;

  function increase() {
    count += 1;
  }
</script>

<div>
  <p>当前计数：{count}</p>
  <button on:click={increase}>增加</button>
</div>
```



## 三、元框架：Next.js 与 Nuxt

**元框架在基础框架之上补充了路由、服务端渲染、静态生成、数据加载和部署能力。**

当"只用 React/Vue 写一个 SPA"已经无法满足 SEO、首屏性能和服务端能力的需求时，元框架就成了主流选择。

Next.js 和 Nuxt 分别代表 React 和 Vue 生态中的事实标准，它们让前端项目更容易兼顾 SEO、首屏性能和开发体验。

| 元框架 | 基础框架 | 主要能力 |
| :--- | :--- | :--- |
| Next.js | React | SSR、SSG、ISR、RSC、路由、API |
| Nuxt | Vue | SSR、SSG、模块化、插件系统 |
| Remix | React | Web 标准、嵌套路由、数据加载 |
| SvelteKit | Svelte | 编译时优化、轻量、全栈能力 |

### 1. Next.js

Next.js 支持 SSR、SSG、ISR 和 Server Components，适合需要 SEO、内容型站点或复杂数据加载的应用。组件默认在服务端运行，可以减少发送到客户端的 JS 体积。

页面（App Router）：

```tsx
// app/page.tsx
export default function Home() {
  return <h1>欢迎来到 Next.js</h1>;
}
```

服务端数据获取（含 ISR 重新验证）：

```tsx
// app/users/page.tsx
async function getUsers() {
  const res = await fetch("https://api.example.com/users", {
    next: { revalidate: 60 },
  });
  return res.json();
}

export default async function UsersPage() {
  const users = await getUsers();

  return (
    <ul>
      {users.map((user: { id: number; name: string }) => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}
```

### 2. Nuxt

Nuxt 为 Vue 提供了文件路由、SSR、SSG 和插件系统。对 Vue 开发者来说，Nuxt 可以用较低的门槛搭建全栈应用。

页面：

```vue
<!-- pages/index.vue -->
<template>
  <div>
    <h1>欢迎来到 Nuxt</h1>
  </div>
</template>
```

数据获取（自动 SSR + 水合）：

```vue
<!-- pages/users.vue -->
<script setup lang="ts">
const { data: users } = await useFetch("/api/users");
</script>

<template>
  <ul>
    <li v-for="user in users" :key="user.id">
      {{ user.name }}
    </li>
  </ul>
</template>
```



## 四、构建工具与包管理

构建工具负责把源代码编译打包成浏览器可运行的产物，包管理器负责依赖安装与版本管理。

现代前端项目中，Vite、pnpm、ESLint、Prettier 等工具共同决定了开发体验、构建速度和代码质量——工程化做得好不好，很大程度就体现在这一层。

### 1. Vite

Vite 基于浏览器原生 ESM，实现了秒级冷启动和极快的热更新（HMR），是当前新项目的首选构建工具。

Webpack 则凭借成熟的 Loader/Plugin 机制，在复杂定制和老项目中依然占有一席之地；Turbopack、Rspack 是追求更高构建性能的新选择。

创建项目：

```bash
npm create vite@latest my-app -- --template react-ts
cd my-app
npm install
npm run dev
```

### 2. pnpm

pnpm 使用硬链接和符号链接管理依赖，能显著节省磁盘空间、避免"幽灵依赖"，也天然适合 monorepo（配合 Workspaces）。

常用命令：

```bash
pnpm init
pnpm add react
pnpm add -D typescript
pnpm run dev
```

### 3. ESLint + Prettier

ESLint 负责代码规范检查（发现潜在问题），Prettier 负责代码格式化（统一风格），两者结合可以大幅减少团队代码风格争议。

用 Rust 编写的 Biome 正在把 lint + format 合二为一，速度极快，是新趋势之一。

```json
{
  "scripts": {
    "lint": "eslint src --ext .ts,.tsx",
    "format": "prettier --write src"
  }
}
```

配合 Husky + lint-staged，可以在每次提交前自动跑检查，把问题挡在入库之前。



## 五、路由

**路由决定了页面如何根据 URL 展示不同内容。**

单页应用通常由前端路由（React Router / Vue Router）管理页面切换，而元框架则更多使用文件系统路由。

无论哪种方案，路由设计都会直接影响页面结构、权限控制、代码分割粒度和用户体验。

### 1. React Router

```tsx
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

function Home() {
  return <h2>首页</h2>;
}

function About() {
  return <h2>关于</h2>;
}

export default function App() {
  return (
    <BrowserRouter>
      <nav>
        <Link to="/">首页</Link>
        <Link to="/about">关于</Link>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </BrowserRouter>
  );
}
```

### 2. Vue Router

```ts
import { createRouter, createWebHistory } from "vue-router";
import Home from "../views/Home.vue";
import About from "../views/About.vue";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", component: Home },
    { path: "/about", component: About },
  ],
});

export default router;
```



## 六、状态管理

**状态管理用于在组件之间共享数据。**

现代前端的一个重要共识是：**能不用全局状态就不用**。

通常会把状态分为两类：

- 服务端状态（由 TanStack Query / SWR 等数据请求库管理缓存与同步）
- 客户端全局状态（由 Zustand / Pinia 等管理 UI 相关的全局数据）

这样能避免把所有数据都塞进一个巨型 Store。

### 1. Zustand（React）

Zustand 是 React 生态中轻量的状态管理方案，API 极简、无样板代码，适合中小型项目或局部全局状态。

定义 Store：

```ts
import { create } from "zustand";

type CounterStore = {
  count: number;
  increase: () => void;
  reset: () => void;
};

export const useCounterStore = create<CounterStore>((set) => ({
  count: 0,
  increase: () => set((state) => ({ count: state.count + 1 })),
  reset: () => set({ count: 0 }),
}));
```

组件中使用：

```tsx
import { useCounterStore } from "./store";

export default function Counter() {
  const { count, increase, reset } = useCounterStore();

  return (
    <div>
      <p>计数：{count}</p>
      <button onClick={increase}>增加</button>
      <button onClick={reset}>重置</button>
    </div>
  );
}
```

### 2. Pinia（Vue）

Pinia 是 Vue 官方推荐的状态管理库，支持组合式 API，类型推导友好，是 Vuex 的继任者。

定义 Store：

```ts
import { defineStore } from "pinia";
import { ref } from "vue";

export const useCounterStore = defineStore("counter", () => {
  const count = ref(0);

  function increase() {
    count.value++;
  }

  function reset() {
    count.value = 0;
  }

  return { count, increase, reset };
});
```

组件中使用：

```vue
<script setup lang="ts">
import { useCounterStore } from "@/stores/counter";

const counter = useCounterStore();
</script>

<template>
  <div>
    <p>计数：{{ counter.count }}</p>
    <button @click="counter.increase">增加</button>
    <button @click="counter.reset">重置</button>
  </div>
</template>
```

各框架常见方案对比：

| 框架 | 常见方案 | 特点 |
| :--- | :--- | :--- |
| React | Redux、Zustand、Jotai | Zustand 轻量，Redux 适合大型项目，Jotai 原子化 |
| Vue | Pinia、Vuex | Pinia 是当前推荐方案 |
| Angular | NgRx、Signals | NgRx 偏复杂，Signals 更轻量 |



## 七、数据请求与 TanStack Query

**数据请求不只是发一个 HTTP 请求，还包括缓存、重试、加载状态、错误处理和页面间数据同步。**

把"服务端状态"从业务代码里抽离出来交给专门的数据请求库管理，是现代前端的重要实践，能显著减少手写的 loading / error / 缓存逻辑。

### 1. Axios

Axios 是常用的 HTTP 客户端，支持请求/响应拦截器、请求取消和错误统一处理。

```ts
import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  timeout: 5000,
});

export async function getUser(id: number) {
  const { data } = await api.get(`/users/${id}`);
  return data;
}
```

### 2. TanStack Query

TanStack Query（原 React Query）是服务端状态管理的事实标准，自动处理缓存、重试、加载状态和数据失效，避免手动维护这些状态。

```tsx
import { useQuery } from "@tanstack/react-query";

function UserProfile({ userId }: { userId: number }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["user", userId],
    queryFn: () =>
      fetch(`/api/users/${userId}`).then((r) => r.json()),
  });

  if (isLoading) return <p>加载中...</p>;
  if (error) return <p>加载失败</p>;

  return <p>{data.name}</p>;
}
```



## 八、样式方案与 UI 组件库

**样式方案决定了项目如何组织 CSS。**

原子化 CSS（Tailwind）适合快速开发和统一设计语言，CSS Modules 适合组件级样式隔离，CSS-in-JS 适合动态样式；而 UI 组件库则能在中后台场景里显著提升表单、表格、弹窗等常见界面的搭建效率。

### 1. Tailwind CSS

Tailwind CSS 通过原子类直接在标签上组合样式，减少自定义 CSS 文件，团队协作时设计一致性更好。

```html
<div class="flex items-center justify-center gap-4 p-6">
  <button class="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
    确认
  </button>
  <button class="rounded border border-gray-300 px-4 py-2 hover:bg-gray-100">
    取消
  </button>
</div>
```

### 2. CSS Modules

CSS Modules 会为类名生成唯一哈希，从根本上避免样式冲突，适合组件库或大型项目。

```css
/* Button.module.css */
.button {
  padding: 8px 16px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
}

.primary {
  background: #2563eb;
  color: #fff;
}
```

```tsx
import styles from "./Button.module.css";

export default function Button({ children }: { children: React.ReactNode }) {
  return (
    <button className={`${styles.button} ${styles.primary}`}>
      {children}
    </button>
  );
}
```

### 3. UI 组件库

React 常用：Ant Design（企业级中后台）、Shadcn UI（无头组件 + 高可定制）、MUI、Mantine。Vue 常用：Element Plus、Naive UI、Vant（移动端）、Vuetify。

Element Plus 示例：

```vue
<template>
  <el-button type="primary" @click="handleClick">确认</el-button>
  <el-table :data="users">
    <el-table-column prop="name" label="姓名" />
    <el-table-column prop="email" label="邮箱" />
  </el-table>
</template>

<script setup lang="ts">
import { ref } from "vue";

const users = ref([
  { name: "Alice", email: "alice@example.com" },
  { name: "Bob", email: "bob@example.com" },
]);

function handleClick() {
  console.log("按钮点击");
}
</script>
```



## 九、测试体系

测试不是为了堆工具，而是为了保证代码变更不会破坏已有功能、降低回归风险。

单元测试适合验证纯函数与工具逻辑，组件测试适合验证 UI 渲染与交互，端到端测试适合模拟真实用户流程。

当有 AI 参与生成代码时，自动化测试更是验证输出是否可靠的关键防线。

| 测试类型 | 常见工具 | 用途 |
| :--- | :--- | :--- |
| 单元测试 | Vitest、Jest | 测试纯函数、工具逻辑 |
| 组件测试 | Testing Library | 以用户视角测试组件渲染和交互 |
| 端到端测试 | Playwright、Cypress | 模拟真实用户流程 |
| 视觉回归 | Chromatic、Playwright | 检测 UI 意外变化 |

### 1. Vitest 单元测试

```ts
import { expect, test } from "vitest";

function add(a: number, b: number): number {
  return a + b;
}

test("add 函数应正确求和", () => {
  expect(add(1, 2)).toBe(3);
  expect(add(-1, 1)).toBe(0);
});
```

### 2. Testing Library 组件测试

```tsx
import { render, screen, fireEvent } from "@testing-library/react";
import Counter from "./Counter";

test("点击按钮后计数增加", () => {
  render(<Counter />);
  const button = screen.getByText("增加");
  fireEvent.click(button);
  expect(screen.getByText(/当前计数：1/i)).toBeInTheDocument();
});
```

### 3. Playwright 端到端测试

```ts
import { test, expect } from "@playwright/test";

test("首页应显示标题", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("h1")).toContainText("欢迎来到 Next.js");
});
```



## 十、性能优化

前端性能直接影响首屏速度、交互流畅度和用户体验，并最终影响留存和转化。

优化通常从四个方向入手：

- 减少资源体积（代码分割、压缩）
- 降低请求数量（缓存、合并）
- 提升渲染效率（避免重渲染）
- 监控关键指标（Core Web Vitals：LCP / INP / CLS）

### 1. 代码分割与懒加载

```tsx
import { lazy, Suspense } from "react";

const Dashboard = lazy(() => import("./Dashboard"));

export default function App() {
  return (
    <Suspense fallback={<p>加载中...</p>}>
      <Dashboard />
    </Suspense>
  );
}
```

### 2. 图片优化

```html
<img
  src="/hero.avif"
  alt="首页横幅"
  width="1200"
  height="600"
  loading="lazy"
  decoding="async"
/>
```

### 3. 避免不必要的重渲染

```tsx
import { memo, useMemo } from "react";

const UserItem = memo(function UserItem({ name }: { name: string }) {
  return <li>{name}</li>;
});

function UserList({ users }: { users: string[] }) {
  const sorted = useMemo(() => [...users].sort(), [users]);

  return (
    <ul>
      {sorted.map((name) => (
        <UserItem key={name} name={name} />
      ))}
    </ul>
  );
}
```

### 4. 性能监控

用 Lighthouse 或 Web Vitals 采集真实用户指标（RUM），把优化建立在数据而不是猜测上。

```ts
import { getLCP, getINP, getCLS } from "web-vitals";

getLCP(console.log);
getINP(console.log);
getCLS(console.log);
```



## 十一、安全与可访问性

安全决定系统会不会被攻破，可访问性（a11y）决定不同能力的用户能不能正常使用。

这两点常被忽视，却是生产级前端不可或缺的部分。

### 1. 防止 XSS

永远不要直接渲染不可信的 HTML。

```tsx
// 危险：直接注入用户内容
<div dangerouslySetInnerHTML={{ __html: userContent }} />

// 更安全：作为文本渲染，浏览器会自动转义
<p>{userContent}</p>
```

### 2. 接口与数据安全

- 不在前端暴露密钥、令牌等敏感信息。
- 对所有输入做校验，但后端同样要做校验（前端校验只为体验，安全必须靠后端）。
- 使用 HTTPS，配置 CSP（内容安全策略）头。
- 防范 CSRF，合理使用 SameSite Cookie。

### 3. 可访问性

```html
<button aria-label="关闭对话框" onclick="closeModal()">
  x
</button>

<label for="email">邮箱</label>
<input id="email" type="email" aria-required="true" />

<img src="/logo.png" alt="公司 Logo" />
```

要点：语义化 HTML、保证键盘可操作、表单提供明确标签、颜色对比度达标、图片提供替代文本、动态内容注意屏幕阅读器体验。



## 十二、部署与运维

部署不只是"把文件上传上去"，还包括环境变量管理、缓存策略、CDN 加速、灰度发布、错误监控和回滚机制。

选择合适的部署方式，能让发布更快、更稳、更可观测。

### 1. Vercel 部署 Next.js

```bash
npm run build
vercel deploy
```

Vercel / Netlify 特别适合静态站点和元框架，推送即部署，并自动为每个分支生成预览环境。

### 2. Nginx 部署静态站点

```nginx
server {
  listen 80;
  server_name example.com;
  root /var/www/html;
  index index.html;

  location / {
    try_files $uri $uri/ /index.html;
  }
}
```

`try_files` 兜底到 `index.html`，是单页应用前端路由刷新不 404 的关键配置。

### 3. Docker 多阶段构建部署

多阶段构建只在最终镜像里保留产物，能显著减小体积。

```dockerfile
# ---- 构建阶段 ----
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile
COPY . .
RUN pnpm run build

# ---- 运行阶段 ----
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

构建与运行：

```bash
docker build -t my-frontend .
docker run -d -p 8080:80 --name my-frontend my-frontend
```

### 4. CI/CD 与监控

- **CI/CD**：用 GitHub Actions / GitLab CI 在推送时自动跑测试、构建和部署。
- **错误监控**：接入 Sentry 采集线上 JS 异常，第一时间发现问题。
- **性能与体验监控**：用 Web Vitals 采集真实用户性能指标。



## 总结

回到开头那句话：前端是一套完整的知识体系，而不是某个框架的 API 清单，各个模块其实环环相扣：

- 语言基础决定了你能理解到什么深度
- 框架和元框架决定了应用的组织方式
- 构建与包管理决定了工程化效率
- 路由、数据、状态三件套撑起了应用的数据流动
- 样式与 UI 决定了界面生产力
- 测试、性能、安全、部署则共同保证了它能否稳定地跑在生产环境里。
