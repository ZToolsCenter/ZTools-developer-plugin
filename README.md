# ZTools-developer-plugin

`ZTools-developer-plugin` 是从 `ZTools` 设置插件中拆出的独立工作台项目，用来承接“开发中插件”的浏览、切换、操作与后续扩展能力。

## 当前状态

- 已落地左侧开发项目列表
- 已落地顶部 tab 路由导航
- 已落地开发工作台首页
- 已落地开发模式安装/卸载卡片（安装前项目可见但不可重载）
- 已接入宿主兜底访问与统一日志
- 已抽出 `CardGroup`、`CardAtom`、`CommonSectionCard`、`CommonEmptyState` 等共享组件
- `发布历史`、`用户留言`、`增值服务`、`团队协作` 当前仍为占位页

## 路由结构

当前页面通过 `Vue Router` 驱动，核心路径结构如下：

```text
/home/:pluginId/development
/home/:pluginId/history
/home/:pluginId/feedback
/home/:pluginId/services
/home/:pluginId/team
```

说明：

- `pluginId` 是当前选中开发中插件的稳定路由参数
- 顶部 tab 切换必须通过路由完成
- 当路由参数缺失或无效时，页面会回退到首个可用开发中插件

## 宿主依赖

业务能力围绕 `window.ztools.internal` 展开，当前项目已经消费或预留的能力包括：

- `getDevProjects()`
- `getRunningPlugins()`
- `revealInFinder()`
- `reloadPlugin()`
- `packagePlugin()`
- `importDevPlugin()`
- `installDevPlugin()`
- `uninstallDevPlugin()`

本地开发项目的显示与可用状态当前约定如下：

- 侧边栏展示 `getDevProjects()` 返回的本地开发项目
- 仅当项目 `isDevModeInstalled` 为 `true` 时，开发页“重载插件”动作可用
- 开发页支持通过“安装（开发模式）/卸载（开发模式）”切换状态，并触发侧边栏刷新

在本地开发和测试环境中，`src/utils/host.ts` 提供了最小兜底数据，避免没有宿主时页面直接失效。

## AI 浏览器调试支持

当前项目在 `vite.config.ts` 中接入了 `code-inspector-plugin`，用于增强本地开发态下的页面元素定位能力。

这项能力对 AI 协作的直接价值是：

- AI 在浏览器中检查页面元素时，可以读取元素上的 `data-insp-path` 属性
- `data-insp-path` 能提供该元素对应的源码位置，通常可回溯到具体的 `.vue`、`.ts` 或相关组件文件
- 这使得 AI 在处理 UI 异常、结构归属、样式来源等问题时，可以从浏览器元素直接跳回源码，而不必只依赖截图猜测或大范围全文搜索

推荐排查路径：

- 先在浏览器里定位目标元素
- 读取该元素的 `data-insp-path`
- 根据返回路径回到对应组件或视图继续分析
- 如果页面由多层组件组合而成，先从最贴近目标元素的位置开始，再沿组件边界逐层向上核对

能力边界：

- 该能力默认按本地开发态理解，不应直接描述为生产环境保障能力
- 它解决的是“页面元素反查源码位置”，不替代宿主 API 排查、运行时状态分析或日志诊断
- 当元素来自第三方组件、插槽透传或运行时包装层时，返回位置可能更接近包装节点，仍需结合组件树继续判断

## 目录概览

```text
src/
  App.vue
  assets/
    styles/
  components/
    CardAtom/
    CardGroup/
    CommonEmptyState/
    CommonSectionCard/
  router/
    index.ts
  utils/
    host.ts
    logger.ts
  views/
    HomePage/
      components/
        DevPluginSidebar/
        HomeTabPlaceholder/
        WorkbenchNav/
      views/
        DevelopmentView/
        HistoryView/
        FeedbackView/
        ServicesView/
        TeamView/
```

目录原则：

- `src/components` 放共享 UI 组件
- `src/views/HomePage/components` 放布局级业务组件
- `src/views/HomePage/views/*` 放路由页面
- 开发工作台私有区块继续收敛在 `DevelopmentView/components`

## 工程约定

- 组件默认保持三件套结构：`index.ts`、`组件名.vue`、`组件名.ts`
- Vue 单文件组件顺序统一为：`script setup` -> `template` -> `style`
- 项目已配置 `Element Plus` 全量组件自动导入；使用任意 `Element Plus` 组件时，默认直接在模板里写 `<el-*>`，不要手动写 `import { ElXxx } from 'element-plus'`
- 新增或修改组件局部样式时，优先使用 `<style scoped lang="less">`
- `script setup` 内函数统一使用箭头函数
- 注释、字段说明、方法说明统一使用中文
- 日志必须使用 `【模块】【功能】日志内容` 格式
- 样式优先使用 `--u-*` 主题变量，不扩散硬编码颜色

## 安装与启动

### 环境要求

- `Node.js`: `^20.19.0 || >=22.12.0`
- `pnpm`

### 安装依赖

```sh
pnpm install
```

### 本地开发

```sh
pnpm dev
```

### 生产构建

```sh
pnpm build
```

## 质量命令

### 类型检查

```sh
pnpm type-check
```

### 单元测试

```sh
pnpm test:unit --run
```

### 端到端测试

```sh
pnpm test:e2e
```

首次运行 Playwright 如缺浏览器，可先执行：

```sh
pnpm exec playwright install
```

### Lint

```sh
pnpm lint
```

### 格式化

```sh
pnpm format
```

## AI 协作入口

当前项目中和 AI 协作相关的关键说明文件如下：

- `AGENTS.md`
- `docs/superpowers/specs/2026-03-28-pencil-homepage-migration-design.md`
- `docs/superpowers/plans/2026-03-28-homepage-migration.md`
- `.agents/skills/u-styles-variable-usage/SKILL.md`

在修改页面结构、组件边界、主题变量或宿主 API 接入方式时，应同步更新这些文件，确保后续协作基于当前真实状态，而不是旧的脚手架描述。

补充约定：

- 当 AI 使用浏览器进行页面测试或视觉排查时，应优先利用页面元素上的 `data-insp-path` 反查源码位置
- 与页面结构定位相关的问题，优先走“浏览器元素 -> `data-insp-path` -> 源码文件”的路径，再决定是否继续做全文搜索
