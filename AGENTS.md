# ZTools-developer-plugin AGENTS

## 作用域

本文件只作用于 `/Users/xiaou/code/ztools/ZTools-developer-plugin`。

- 除非用户明确要求，否则改动范围限定在当前子项目内。
- 不要顺带修改 `/Users/xiaou/code/ztools` 下的其他项目、共享文档或宿主工程。

## 当前项目定位

`ZTools-developer-plugin` 是一个独立运行的 Vue 3 子项目，用来承接原本位于 `ZTools` 设置插件中的“开发中插件工作台”。

当前已经落地的主线能力：

- 基于 `HomePage` 的工作台父布局
- 基于路由的顶部 tab 切换，路径结构为 `/home/:pluginId/<tab>`
- 左侧开发中插件列表
- 开发工作台主页面
- `History`、`Feedback`、`Services`、`Team` 四个占位页
- 面向开发工作台的共享卡片组件 `CardGroup`、`CardAtom`
- 宿主 API 访问兜底与统一日志能力

当前明确的产品边界：

- `development` 是唯一落地真实业务的 tab
- 其他 tab 目前只提供占位信息，不要擅自补全业务闭环
- 页面信息架构以 Pencil 主页面设计稿为基线，但允许少量工程化微调

## 技术栈

- 框架：`Vue 3`、`Vite`、`TypeScript`
- 路由：`Vue Router`
- 样式：`UnoCSS`、`@xiaou66/u-styles`、`@xiaou66/u-element-plus`
- UI 依赖：`Element Plus`
- 状态：已安装 `Pinia`，但当前主流程未接入全局 store，`src/stores` 仍为空
- 测试：`Vitest`、`Playwright`
- 质量工具：`ESLint`、`oxlint`、`oxfmt`

## 关键业务约束

### 路由与页面

- 路由入口统一收敛在 `src/router/index.ts`。
- `HomePage` 是父布局路由，子路由按 tab 划分。
- 顶部 tab 必须通过路由驱动，不要退回到本地状态切换。
- 子路由必须保留 `pluginId` 路径参数，用于与左侧选中插件联动。

### 组件边界

- 组件默认保持三件套结构：
  - `index.ts`
  - `组件名.vue`
  - `组件名.ts`
- `src/components` 只放跨页面或跨区块可复用的通用组件。
- `src/views/HomePage/components` 只放 `HomePage` 布局级业务组件。
- `src/views/HomePage/views/*` 只放真正受路由驱动的页面。
- `src/views/HomePage/views/DevelopmentView/components` 只放开发工作台私有区块。

### 宿主 API

- `window.ztools.internal` 允许在页面级或区块级业务组件内部直接使用，以保证功能内聚。
- `src/components` 下的共享组件禁止直接依赖 `window.ztools.internal`。
- 如果同一类宿主读取逻辑需要在多个位置复用，优先复用 `src/utils/host.ts` 中的能力，而不是在多个组件里复制判断逻辑。

### AI 浏览器定位能力

- 当前项目开发态已接入 `code-inspector-plugin`，配置入口位于 `vite.config.ts`。
- AI 在浏览器里检查页面元素时，可以读取元素上的 `data-insp-path` 属性，用于反查对应源码位置。
- 涉及页面结构、样式归属、区块来源、组件边界定位时，优先走“浏览器元素 -> `data-insp-path` -> 对应源码文件”的路径，不要只靠截图或关键词猜测。
- `data-insp-path` 更适合作为定位入口，不是最终结论。遇到第三方组件包裹、插槽透传、运行时包装层时，仍需继续沿组件树和业务代码向上核对。
- 这项能力默认按本地开发态理解，不要把它描述成生产环境保障能力。

### 共享卡片约定

- `CardGroup` 负责组边界、分隔线和组内容器。
- `CardAtom` 负责单个卡片项的图标、标题、描述、状态和点击态。
- 可复用展示组件优先采用“`props` 优先、插槽兜底”。
- group 之间的间距由外部布局容器控制，不要把组间距写死到 `CardGroup` 内部。

## 代码风格约定

### Vue SFC

- 单文件组件顺序必须保持：
  1. `<script setup lang="ts">`
  2. `<template>`
  3. `<style ...>`
- 新增或修改组件局部样式时，优先使用 `<style scoped lang="less">`。
- 存量纯 CSS 样式块不要求为了“统一”而全量迁移，但新代码不要继续新增不带 `lang="less"` 的局部样式块。
- 即使样式为空，也优先保留样式块，默认写成 `<style scoped lang="less"></style>`，避免不同文件结构漂移。
- `script setup` 中的函数统一使用箭头函数，不要使用 `function` 声明式写法。

### 注释与命名

- 当前项目新增注释统一使用中文。
- 方法、字段、导出类型、导出常量在存在语义门槛时必须补中文注释。
- `setup` 语法块中的注释优先使用单行注释。
- 注释只解释约束、边界和原因，不写机械废话。

### 导入与组织

- `src` 内导入优先使用 `@/` 别名。
- 项目已配置 `Element Plus` 全量组件自动导入，这条规则适用于所有 `Element Plus` 组件，不是某一个组件的特例。
- 使用任意 `Element Plus` 组件时，默认都应走自动导入；在模板中统一直接写成 `<el-*>` 标签，不要再在 `script setup` 中手动写 `import { ElXxx } from 'element-plus'`。
- 禁止把 `Element Plus` 组件当作普通业务组件手动注册；如果同一处同时出现“大驼峰组件名 + 手动 import”和“小写标签”两套写法，视为违规写法。
- 优先保持低影响面修改，不做与当前需求无关的大范围重构。
- 已有业务边界已经拆开时，优先在现有边界内扩展，不重新发明一套目录结构。

## 样式与主题

- 主题颜色、边框、背景、文本色优先使用 `--u-*` 系列变量。
- 组件内局部样式默认使用 Less 语法组织，优先利用嵌套能力提升可读性。
- 新增页面样式不要继续扩散 `--el-*` 变量作为业务样式来源。
- 不要在业务组件里硬编码 hex、rgb、hsl 颜色值，除非用户明确要求。
- 共享样式入口以 `src/assets/styles/index.ts` 为准。
- 涉及主题变量、共享 token、旧样式迁移时，必须先阅读 `./.agents/skills/u-styles-variable-usage/SKILL.md`。

## 日志约定

- 统一使用 `src/utils/logger.ts`。
- 日志格式必须是：`【模块】【功能】日志内容`
- 不要在业务代码里散落不带前缀的 `console.log`。

## README 与 AI 文档维护约定

以下文件属于当前子项目的 AI 协作入口，变更较大时应同步维护：

- `AGENTS.md`
- `README.md`
- `./.agents/skills/u-styles-variable-usage/SKILL.md`

要求：

- 这些文件描述的是“当前项目真实状态”，不是脚手架模板。
- 如果实现已经落地，不要继续保留“待创建文件”“待实现任务”“英文注释约定”这类过期信息。
- 如果文档中的引用路径不存在，必须一并修正。
- 如果 AI 协作方式依赖新的定位能力、浏览器侧元信息或调试入口，也要同步写入 `README.md` 与 `AGENTS.md`。

## 常用命令

- `pnpm dev`
- `pnpm build`
- `pnpm type-check`
- `pnpm lint`
- `pnpm test:unit --run`
- `pnpm test:e2e`

## 验证要求

按改动范围执行最小必要验证：

- 改动文档和 AI 说明文件：至少自检 diff 与关键路径引用是否存在
- 改动 Vue 组件、组合式逻辑、普通 TS 逻辑：`pnpm test:unit --run`
- 改动类型、入口、路由、构建相关配置：`pnpm type-check`
- 改动源码风格、样式约定或 lint 相关内容：`pnpm lint`
- 改动页面路由跳转、宿主交互主流程或端到端流程时，再执行 `pnpm test:e2e`

如果某项验证因环境缺失无法执行，需要在结果说明里明确指出阻塞项。
