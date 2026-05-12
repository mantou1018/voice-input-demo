# Agent Guide

## 项目概览

- 这是一个移动端 H5 语音报名 demo，核心链路是：职位页 -> 语音报名浮层 -> 语音/手动补充 -> AI 抽取 -> 确认报名。
- 桌面端只用于手机壳预览；真实目标是手机系统浏览器。
- 当前基准尺寸优先按 `414 x 818` 校准。

## 技术与关键文件

- 技术栈：React 18、TypeScript、Vite 5、Tailwind CSS 4、Vitest。
- 关键文件：
  - `src/App.tsx`：页面装配、浮层模式映射、手动编辑状态。
  - `src/hooks/useVoiceSession.ts`：语音状态机与 AI 调用。
  - `src/components/voiceApply/*`：职位页、输入页、评审页、成功页及 picker。
  - `vite.config.ts`：本地 `/api/resume-agent`。
  - `src/styles.css`：全局主题与页面视觉样式。

## 产品与逻辑约束

- AI 只抽取 4 个字段：`年龄`、`手机号`、`意向城市`、`意向职位`。不要扩展字段。
- Web Speech API 在 iOS / WebView 中不稳定，错误文案必须可恢复、可理解。
- `preserveExisting` 会保留上一轮已识别字段；不要随意破坏合并逻辑。
- 不要随意替换现有素材；优先复用 `src/assets/`。
- 改状态机前，先完整阅读 `useVoiceSession.ts`。

## Figma 还原规则

- 只要任务涉及前端还原、视觉调整、页面重构，默认必须先查看 Figma 设计稿。
- 必须优先使用精确 node 链接；如果节点过大，拆到子节点继续看。
- 改代码前，至少先拿：
  - `get_design_context`
  - `get_screenshot`
  - 必要时 `get_metadata`
- 改代码前要先校准这些维度：
  - 尺寸与位置
  - 字号、字重、行高
  - 颜色、透明度、渐变
  - 圆角、边框、阴影
  - 当前可见状态对应的文案和控件
- 改完不能直接停，必须把浏览器结果和 Figma 再对一次，继续修正明显不一致的地方。
- 如果浏览器里当前显示状态和 Figma 对应状态不一致，先确认状态分支，再改 UI，不要凭截图误改。

## UI 实施要求

- 每次改 UI，同时检查手机浏览器和桌面手机壳预览。
- 优先保证：
  - 位置正确
  - 字号正确
  - 状态正确
  - 不出现多余元素
- 如果 Figma 与现有实现冲突，优先按当前任务指定的 Figma 节点还原。
- 前端还原前后，都先用 `ui-ux-pro-max` 做快速审美/交互检查。

## 验证要求

- UI 或结构调整后，至少运行：
  - `npm run build`
- 改语音状态机、字段处理、AI 接口相关逻辑后，还要运行：
  - `npm run test`
- 能本地预览时，给出可访问链接。
- 交付时明确说明：
  - 改了哪些文件
  - 当前对齐的是哪个 Figma 节点
  - 还剩哪些可见偏差

## 常用命令

```bash
npm run dev
npm run dev:phone
npm run phone:qr
npm run test
npm run build
```
