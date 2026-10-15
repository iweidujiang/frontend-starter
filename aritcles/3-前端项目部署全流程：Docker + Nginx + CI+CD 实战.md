# 前端项目部署全流程：Docker + Nginx + CI/CD 实战



## 前言

在第 2 篇 [从零搭建 Vue 3 工程化项目](https://mp.weixin.qq.com/s/xxxxx) 中，我们完成了从项目初始化、路由搭建、状态管理到请求封装的完整工程骨架，最终通过 `pnpm build` 产出了 `dist/` 目录下的静态文件。

但 `dist/` 躺在本地磁盘上并不能服务用户。怎么把它安全、稳定、可重复地部署到线上，才是从「能开发」到「能上线」的最后一公里。

本篇沿着第 2 篇的产物，把部署链路补全：

| 关注点 | 选型 | 理由 |
| :--- | :--- | :--- |
| 容器化 | Docker 多阶段构建 | 构建产物与运行环境隔离，镜像体积小 |
| Web 服务器 | Nginx | SPA 路由兜底、静态资源缓存、gzip 压缩 |
| CI/CD | GitHub Actions | 推送即构建，自动化 lint + build + 镜像推送 |
| 部署编排 | Docker Compose | 本地一键起服务，生产可平滑迁移到 K8s |
| 监控告警 | Sentry + Web Vitals | 线上异常采集 + 真实用户性能指标 |

读完你应该能独立把一份 Vue 3 构建产物推到线上，并具备回滚与监控能力。



## 部署全流程思维导图

![image-20261014230000001](D:\a-github-project\everything\技术博文\前端杂项\3-前端项目部署全流程.assets\image-20261014230000001.png)

> 思维导图结构（供绘制参考）：
>
> ```
> 前端项目部署全流程
> ├── 一、Docker 多阶段构建
> │   ├── 构建阶段（node 镜像）
> │   │   ├── pnpm install --frozen-lockfile
> │   │   └── pnpm build → dist/
> │   └── 运行阶段（nginx 镜像）
> │       ├── COPY dist → /usr/share/nginx/html
> │       └── 自定义 nginx.conf
> ├── 二、Nginx 核心配置
> │   ├── SPA 路由兜底（try_files）
> │   ├── 静态资源长期缓存（带 hash 文件名）
> │   ├── 接口反向代理（/api → backend）
> │   └── gzip 压缩
> ├── 三、CI/CD 流水线
> │   ├── GitHub Actions 触发条件
> │   ├── lint + build 质量门禁
> │   ├── Docker 镜像构建与推送
> │   └── Secrets 管理（DOCKER_USERNAME/PASSWORD）
> ├── 四、环境管理
> │   ├── .env.development / .env.production
> │   └── Vite base 路径配置
> ├── 五、本地与生产部署
> │   ├── Docker Compose 一键起服务
> │   └── 生产环境部署策略
> └── 六、监控与回滚
>     ├── Sentry 异常采集
>     ├── Web Vitals 性能监控
>     └── 镜像版本回滚
> ```



---

## 一、Docker 多阶段构建

单阶段 Dockerfile 会把 Node.js 运行时、node_modules 和构建工具全部打进最终镜像，体积动辄 1GB+。多阶段构建只在最终镜像里保留 Nginx 和 `dist/` 产物，通常能压到 30MB 以内。

### 1.1 构建阶段（Builder）

```dockerfile
# ---- 构建阶段 ----
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile

COPY . .
RUN pnpm run build
```

关键点：

- **`--frozen-lockfile`**：锁定依赖版本，避免 CI 环境因 lockfile 不同步装错包。
- **先 COPY lockfile 再 COPY 源码**：Docker 层缓存机制下，只要 `package.json` 没变，`pnpm install` 这一层就会命中缓存，大幅加速后续构建。
- **`node:20-alpine`**：alpine 基础镜像只有 5MB 左右，比 debian 系小一个数量级。

### 1.2 运行阶段（Runner）

```dockerfile
# ---- 运行阶段 ----
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

运行阶段只依赖 `nginx:alpine`（约 25MB），把上一阶段产出的 `dist/` 和自定义 `nginx.conf` 拷进去即可。

### 1.3 .dockerignore

和 `.gitignore` 同理，避免把无关文件打进镜像上下文：

```text
# .dockerignore
node_modules
dist
.git
.github
.idea
.vscode
*.md
Dockerfile
deploy/
```

### 1.4 完整 Dockerfile

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
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

本地验证构建：

```bash
docker build -t frontend-starter .
docker run -d -p 8080:80 --name frontend frontend-starter
# 浏览器打开 http://localhost:8080
```



---

## 二、Nginx 核心配置

SPA 项目部署到 Nginx 有几个必配项，漏一个就会踩坑。

### 2.1 SPA 路由兜底（必配）

Vue Router 使用 `createWebHistory` 后，URL 路径（如 `/users/123`）不再对应真实文件。用户直接访问或刷新该路径时，Nginx 默认会返回 404。

```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

`try_files` 依次尝试：精确匹配文件 → 匹配目录 → 兜底返回 `index.html`。这是单页应用前端路由刷新不 404 的关键配置。

### 2.2 静态资源长期缓存

Vite 构建产物的文件名自带内容 hash（如 `index-DLw8aaYi.js`），内容不变则文件名不变。因此可以安全地设置长期缓存：

```nginx
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

`immutable` 告诉浏览器「这个文件在有效期内绝对不会变」，避免不必要的 304 协商请求。

> **注意：** `index.html` 本身不能加长期缓存，否则新版本发布后用户拿到的还是旧入口文件。Nginx 默认对 html 文件不设置强缓存，保持默认即可。

### 2.3 接口反向代理

如果前端和后端部署在同一台机器上，可以用 Nginx 做反向代理，避免跨域问题：

```nginx
location /api/ {
    proxy_pass http://backend:3000/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

这样前端代码里 `VITE_API_BASE_URL` 仍然写 `/api`，开发环境和生产环境保持一致。

### 2.4 gzip 压缩

开启 gzip 能显著减少文本类资源的传输体积（JS/CSS/JSON 通常能压缩 60%-80%）：

```nginx
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css application/json application/javascript
             text/xml application/xml text/javascript image/svg+xml;
```

`gzip_min_length 1024` 避免对小文件压缩（压缩后反而更大）。

### 2.5 完整 nginx.conf

```nginx
server {
    listen 80;
    server_name _;

    root /usr/share/nginx/html;
    index index.html;

    # SPA 路由兜底
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 静态资源长期缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # 接口反向代理
    location /api/ {
        proxy_pass http://backend:3000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # gzip 压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript
                 text/xml application/xml text/javascript image/svg+xml;
}
```



---

## 三、CI/CD 流水线

手动构建、手动上传、手动部署是事故之源。CI/CD 的核心价值是：每次代码变更都自动走一遍「检查 → 构建 → 部署」，把人为失误的可能性降到最低。

### 3.1 GitHub Actions 工作流

```yaml
# .github/workflows/deploy.yml
name: Build & Deploy

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  lint-and-build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4
        with:
          version: 9

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Lint
        run: pnpm lint

      - name: Build
        run: pnpm build

      - name: Upload build artifact
        if: github.ref == 'refs/heads/main'
        uses: actions/upload-artifact@v4
        with:
          name: dist
          path: dist/

  docker-build-and-push:
    needs: lint-and-build
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Login to Docker Hub
        uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}

      - name: Build and push
        uses: docker/build-push-action@v6
        with:
          context: .
          push: true
          tags: |
            ${{ secrets.DOCKER_USERNAME }}/frontend-starter:latest
            ${{ secrets.DOCKER_USERNAME }}/frontend-starter:${{ github.sha }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
```

流水线分两个 Job：

1. **lint-and-build**：每次 push 和 PR 都跑，lint 不通过则阻断合并。
2. **docker-build-and-push**：仅在 main 分支推送时触发，构建 Docker 镜像并推送到 Docker Hub。

> **踩坑提示：** 敏感信息（Docker Hub 账号密码）必须放在 GitHub Secrets 里，绝不能硬编码在 workflow 文件中。在仓库 Settings → Secrets and variables → Actions 中添加 `DOCKER_USERNAME` 和 `DOCKER_PASSWORD`。

### 3.2 镜像版本策略

每次推送打两个 tag：

- **`latest`**：始终指向最新构建，方便快速部署。
- **`${{ github.sha }}`**：用 Git commit hash 做版本标识，出问题时可以精确回滚到任意一次提交对应的镜像。

### 3.3 构建缓存加速

```yaml
cache-from: type=gha
cache-to: type=gha,mode=max
```

GitHub Actions 原生支持构建缓存（`type=gha`），后续构建可以复用之前的中间层，Docker 构建时间通常能从 3-5 分钟降到 30 秒以内。



---

## 四、环境管理

### 4.1 多环境变量

```bash
# .env.development
VITE_APP_TITLE=前端项目实战手册
VITE_API_BASE_URL=/api

# .env.production
VITE_APP_TITLE=前端项目实战手册
VITE_API_BASE_URL=https://api.example.com
```

开发环境用相对路径 `/api`，配合 Vite 的 `server.proxy` 转发到本地后端；生产环境直接填完整的后端地址。

### 4.2 Vite base 路径

如果项目部署在子路径下（如 `https://example.com/app/`），需要在 `vite.config.ts` 中设置 `base`：

```ts
export default defineConfig({
  base: '/app/',
  // ...
})
```

同时路由也要适配：

```ts
const router = createRouter({
  history: createWebHistory('/app/'),
  // ...
})
```

> **建议：** 把 `base` 也抽到环境变量里（`VITE_BASE_PATH`），这样同一份代码可以通过不同环境变量部署到不同子路径。



---

## 五、本地与生产部署

### 5.1 Docker Compose 一键起服务

```yaml
# deploy/docker-compose.yml
services:
  frontend:
    build: .
    ports:
      - "8080:80"
    restart: unless-stopped
```

```bash
# 本地一键构建并启动
cd deploy
docker compose up -d --build

# 查看日志
docker compose logs -f frontend

# 停止服务
docker compose down
```

`restart: unless-stopped` 保证容器意外退出后自动重启，适合单机部署场景。

### 5.2 生产部署策略

单机场景用 Docker Compose 就够了；如果团队规模扩大、需要多实例和滚动更新，可以平滑迁移到 Kubernetes：

```yaml
# k8s-deployment.yaml（示意）
apiVersion: apps/v1
kind: Deployment
metadata:
  name: frontend-starter
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxUnavailable: 1
  template:
    spec:
      containers:
        - name: frontend
          image: your-dockerhub/frontend-starter:${{ github.sha }}
          ports:
            - containerPort: 80
```

滚动更新保证部署过程中始终有可用实例，用户无感知。



---

## 六、监控与回滚

部署上线不是终点，能发现问题、能快速回滚才是生产级交付的闭环。

### 6.1 异常监控：Sentry

Sentry 是前端异常监控的事实标准，能自动采集 JS 运行时错误、Promise 未捕获异常、资源加载失败等。

```bash
pnpm add @sentry/vue
```

```ts
// main.ts
import * as Sentry from "@sentry/vue";

Sentry.init({
  app,
  dsn: import.meta.env.VITE_SENTRY_DSN,
  tracesSampleRate: 0.1,
});
```

在 Sentry Dashboard 中可以看到错误堆栈、影响用户数、浏览器分布等信息，比翻 Nginx 日志高效得多。

### 6.2 性能监控：Web Vitals

Google 提出的 Core Web Vitals（LCP / INP / CLS）是衡量用户体验的核心指标。

```bash
pnpm add web-vitals
```

```ts
// main.ts
import { onLCP, onINP, onCLS } from 'web-vitals';

onLCP(console.log);  // 最大内容绘制
onINP(console.log);  // 交互到下一次绘制
onCLS(console.log);  // 累积布局偏移
```

把这些指标上报到后端或 Sentry，就能用真实用户数据（RUM）驱动性能优化，而不是靠 Lighthouse 跑分猜测。

### 6.3 回滚

当新版本出现严重问题时，最快的回滚方式是切 Docker 镜像 tag：

```bash
# 回滚到上一个版本
docker pull your-dockerhub/frontend-starter:abc1234
docker tag your-dockerhub/frontend-starter:abc1234 your-dockerhub/frontend-starter:latest
docker compose up -d
```

因为每次 CI 构建都打了 commit hash tag，回滚到任意历史版本都只需要一条命令。

> **最佳实践：** 生产环境不要用 `latest` tag 部署，而是用具体的 commit hash 或语义化版本号。`latest` 只作为开发环境的快捷方式。这样回滚时只需要改 tag 名，不需要重新构建。



---

## 本篇小结

到这里，从代码提交到线上运行的完整链路已经打通：

- 用 Docker 多阶段构建把镜像体积从 1GB+ 压到 30MB
- 用 Nginx 配置 SPA 路由兜底、静态资源缓存、gzip 压缩
- 用 GitHub Actions 实现推送即构建、lint 质量门禁、镜像自动推送
- 用 Docker Compose 一键起服务，生产可平滑迁移到 K8s
- 用 Sentry + Web Vitals 采集线上异常与真实性能指标
- 用 commit hash tag 实现秒级回滚

第 2 篇解决了「能不能持续开发」，本篇解决了「能不能稳定上线」。但线上跑起来之后，用户量上来、接口变多、首屏变慢怎么办？第 4 篇《前端性能优化与监控实战》会深入 LCP / INP / CLS 的优化手段、代码分割策略、以及如何让监控数据真正驱动性能改进。
