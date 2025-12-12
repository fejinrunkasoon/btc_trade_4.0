# BTC Trade 4.0

Vue 3 + Vuetify 的 BTC 合约策略前端，基于 Supabase 提供登录、Binance API 管理、策略编排、交易历史查看，以及仅管理员可见的多账户管理。前端会调用自托管的服务端接口（`https://jp.sdk250.cn:8443`）拉取币安余额/持仓、验证 API、同步数据变更。

## 功能概览
- 登录与路由守卫：Supabase Auth 校验，未登录统一重定向 `/login`。登录名会自动拼接 `@openprimion.com`。
- 多 API 管理：`/api-management` 对 `api_configs` 表进行增删改查，保存前会调后台验证 API Key；支持测试网/主网标记与启用状态切换。
- 策略仪表盘：`/dashboard` 展示当前用户的策略列表，支持新增/编辑/启停/删除/重置，实时展示选中 API 的 USDT 余额、持仓及盈亏（通过外部接口查询币安期货）。
- 策略配置：`/strategy/new` 创建或编辑策略，支持杠杆、开仓数量、上涨/下跌触发方向、止盈止损百分比、DCA 补仓（多级触发次数配置），并关联可用的 API 配置。
- 交易历史：`/trading-history` 从 `trading_history` 表加载记录，提供时间/方向/策略/交易对筛选、分页、详情弹窗及导出 CSV。
- 多账户（管理员）：`/account-management` 仅超级管理员可见，使用 `supabase_admin` 管理用户，需提供 Service Role Key。
- 全局通知：`GlobalNotifications` 组件集中展示成功/错误提示。

## 技术栈
- 前端：Vue 3、TypeScript、Vite、Vuetify 3、Pinia、Vue Router
- 数据与认证：Supabase（PostgreSQL + RLS）
- 其他：axios、crypto-js

## 项目结构
- `src/`
  - `pages/`：业务页面（`dashboard.vue`、`api-management.vue`、`strategy/new.vue`、`trading-history.vue`、`account-management.vue`、`login.vue`）
  - `composables/`：权限、通知（`usePermissions.ts`、`useNotification.js`）
  - `components/`：全局通知（`GlobalNotifications.vue`）
  - `lib/`：Supabase 客户端、业务方法（`supabase.ts`、`util.ts`）
  - `router/index.ts`：路由与登录守卫
  - `plugins/`：Vuetify 等插件注册
  - `stores/`：Pinia 状态
- 其他：`vite.config.ts`、`tsconfig*.json`

## 环境要求
- Node.js ≥ 18，npm（已附 `package-lock.json`）
- 可访问的 Supabase 项目，包含：
  - 表：`api_configs`、`trading_strategies`、`trading_history`
  - 视图：`super_admin_user_overview`（管理员查看用户概览）
  - Auth：启用邮箱登录（或你的登录方式）及 RLS
- 可访问的自托管后台接口：`https://jp.sdk250.cn:8443`（用于 API 验证、余额/持仓查询、数据同步、重置等）

## 环境变量
在项目根目录创建 `.env.local`：
```bash
VITE_SUPABASE_URL=你的Supabase项目URL
VITE_SUPABASE_ANON_KEY=Supabase匿名Key
VITE_SUPABASE_SERVICE_ROLE_KEY=Supabase Service Role Key  # 仅管理员功能需要
```
- 前端运行时只需匿名 Key；若不希望在前端暴露 Service Role Key，请禁用或移除管理员相关功能与 `supabase_admin` 调用。

## 快速开始
```bash
# 安装依赖
npm install

# 开发（http://localhost:5173）
npm run dev

# 类型检查 + 构建
npm run build

# 仅构建
npm run build-only

# 预览构建产物
npm run preview
```

## 主要路由
- `/login`：登录页（用户名自动追加 `@openprimion.com`）。
- `/dashboard`：策略总览、余额/持仓、快捷操作。
- `/api-management`：API 配置 CRUD 与远程验证。
- `/strategy/new`：新增/编辑策略，支持 DCA、止盈止损、方向判定。
- `/trading-history`：交易历史筛选、分页、详情、导出。
- `/account-management`：仅超级管理员可见的用户管理。

## 权限与管理员
- 超级管理员 ID 常量：`src/composables/usePermissions.ts` 中的 `SUPER_ADMIN_ID`（默认 `dd84eede-dbe2-4878-a037-7aeb299f14e6`），请替换为你的 Supabase 用户 ID。
- 路由守卫在 `router/index.ts`；管理员数据依赖 `supabase_admin` 以及 `super_admin_user_overview`。

## 数据同步与外部调用
- `src/lib/util.ts` 在 API/策略增删改后，会向 `https://jp.sdk250.cn:8443/db_updated` 发送回调（参数 `uid` 为记录 ID）。
- 仪表盘与策略页会调用 `https://jp.sdk250.cn:8443` 下的接口（如 `balance`, `positionRisk`, `validate`, `reset`）获取币安期货余额、持仓或校验 API Key。若需替换或关闭，请在对应调用处调整。

## 许可证
MIT
