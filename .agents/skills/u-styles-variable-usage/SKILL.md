---
name: u-styles-variable-usage
description: Use when editing theme-aware UI code, replacing hardcoded colors, or consuming shared style tokens in this project.
---

# u-styles-variable-usage

## Overview

本项目的 UI 已经切到 `@xiaou66/u-styles` / `@xiaou66/u-element-plus` 主题体系，业务页面新增样式应优先消费语义化 `--u-*` 变量，而不是继续复制具体色值、扩散 `--el-*` 变量，或直接把 Element Plus 默认变量当业务层 API。

## When to Use

- 修改页面样式、组件样式、交互态样式
- 替换硬编码颜色、边框、背景、圆角、间距
- 新增共享 UI 组件
- 迁移旧样式写法到当前主题变量体系
- 判断某个视觉意图应该落到文本色、背景色、边框色还是 fill token

以下场景不要滥用这份规则：

- 修改宿主 API 逻辑
- 修改纯数据结构或纯路由逻辑
- 改 `u-styles` 包本身源码之外的实现细节猜测

## Decision Order

1. 先判断当前意图是否能被现有语义 token 表达。
2. 文本、背景、边框优先使用 `--u-color-*` 语义变量。
3. 交互态优先复用 `fill`、`text`、`border` 系列层级变量，不要重新发明 hover 色。
4. 只有在明确无法表达时，才考虑补充局部样式；即便如此，也优先贴近现有 token 体系。
5. 新增业务组件不要把 `--el-*` 当成主要视觉来源。

## Safe Usage

- 优先复用当前页面已经在使用的变量家族，例如：
  - `--u-color-text-*`
  - `--u-color-bg-*`
  - `--u-color-fill-*`
  - `--u-color-border-*`
  - `--u-color-primary-*`
  - `--u-color-success-*`
  - `--u-color-danger-*`
- 共享组件与业务组件尽量保持同一套变量来源，避免一个页面同时维护两套语义体系。
- 样式入口统一从 `src/assets/styles/index.ts` 接入，不要在业务组件里重复引入主题 CSS。
- 组件内局部样式优先使用 `<style scoped lang="less">`，通过 Less 嵌套组织状态、修饰符和子元素样式。
- 如果只是消费层写样式，不要依赖包内部路径或猜测 token 生成逻辑。

## Project-Specific Rules

- 当前 HomePage 工作台及其子视图，新增样式优先沿用开发工作台已出现的变量组合。
- 新增或修改 Vue 组件局部样式时，默认采用 Less；存量纯 CSS 样式不要求无意义全量迁移。
- `CardGroup`、`CardAtom`、`CommonSectionCard` 这类共享组件的视觉规则应保持一致，不要随意引入新半径、新阴影、新边框颜色。
- 允许少量工程化微调，但不能破坏 Pencil 稿对应的信息层级和视觉节奏。
- 组间距由外层布局控制，组件内部只负责自己的边界和内容排版。

## Quick Reference

- 页面底色：优先 `fill`/`bg` 语义变量
- 卡片边框：优先 `--u-color-border-*`
- 卡片正文文本：优先 `--u-color-text-1`
- 次级描述文本：优先 `--u-color-text-2` 或 `--u-color-text-3`
- hover 背景：优先 `--u-color-fill-*`
- 成功、危险、主色状态：优先 `--u-color-success-*`、`--u-color-danger-*`、`--u-color-primary-*`

## Red Flags

- 新代码直接写 hex、rgb、hsl 颜色
- 新代码继续引入 `--el-*` 作为业务层主题方案
- 新增 Vue 局部样式块时继续使用纯 CSS，却没有明确理由
- 在多个组件里复制同一组颜色值、圆角值、间距值
- 为了局部效果跳过现有主题变量体系
- skill 文档继续引用仓库内不存在的样式说明文件

## Repo References

- `src/assets/styles/index.ts`
- `src/assets/styles/base.css`
- `src/components/CardAtom/CardAtom.vue`
- `src/components/CardGroup/CardGroup.vue`
- `src/components/CommonSectionCard/CommonSectionCard.vue`
- `src/views/HomePage/HomePage.vue`
- `src/views/HomePage/views/DevelopmentView/components/PluginOverviewPanel/PluginOverviewPanel.vue`
