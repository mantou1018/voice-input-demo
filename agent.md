# Agent Guide

这个仓库是一个移动端 H5 语音报名 demo。用户在职位详情页点击“说话报名”，浏览器用原生语音识别实时转写自然语言，再通过本地 `/api/resume-agent` 调用 AI 报名助手，抽取报名所需的四个字段并展示成确认卡片。

## 项目背景

- 产品形态：面向手机浏览器的单页 React 应用，桌面端通过 414 x 896 的手机外壳预览。
- 核心体验：职位页 -> 语音报名浮层 -> 按住说话 -> AI 抽取信息 -> 用户确认报名 -> 成功提示。
- 语音能力：依赖浏览器原生 `SpeechRecognition` / `webkitSpeechRecognition`，重点适配中文 `zh-CN`。
- AI 能力：开发环境里由 Vite 插件注册 `/api/resume-agent`，服务端读取 `.env.local` 中的兼容 OpenAI Chat Completions 配置。
- 当前 AI 只应识别四个报名字段：年龄、手机号、意向城市、意向职位。不要扩展到姓名、薪资、经验等字段，除非产品需求明确改变。

## 技术栈

- React 18 + TypeScript + Vite 5
- Tailwind CSS 4，通过 `@tailwindcss/vite` 接入
- Vitest 单元测试
- Vite dev middleware 承担本地 AI 接口代理

## 常用命令

```bash
npm install
npm run dev
npm run dev:phone
npm run phone:qr
npm run test
npm run build
```

- `npm run dev`：本机开发预览。
- `npm run dev:phone`：监听局域网地址，方便真机访问。
- `npm run phone:qr`：生成 `.tmp/phone-qr.html`，用手机扫码打开当前局域网预览页。
- `npm run test`：跑 Vitest。
- `npm run build`：先 `tsc -b`，再 `vite build`。

## 环境变量

本地创建 `.env.local`，不要提交真实密钥：

```bash
AI_API_KEY=你的_api_key
AI_API_BASE_URL=https://api.openai.com/v1
AI_MODEL=gpt-4.1-mini
```

只要服务商兼容 `/chat/completions`，就可以替换 `AI_API_BASE_URL` 和 `AI_MODEL`。

## 关键文件

- `src/App.tsx`：主要 UI 和手机壳预览，包含职位页、语音报名浮层、聊天气泡、识别结果确认态。
- `src/hooks/useVoiceSession.ts`：录音会话状态机，负责权限申请、开始/结束识别、错误处理、调用 AI、合并补充信息、提交成功态。
- `src/lib/speech/createSpeechRecognizerAdapter.ts`：浏览器语音识别适配层，封装原生 Web Speech API 的结果、生命周期和错误映射。
- `src/lib/resumeAgentClient.ts`：前端调用 `/api/resume-agent` 的客户端。
- `vite.config.ts`：Vite 配置和本地 AI 报名助手 API。这里定义 agent system prompt、JSON 解析、字段归一化、城市/职位数量限制、出生年份转换。
- `src/data/lookupTables.ts`：城市别名和职位关键词，用于补强多城市、多职位的归一化。
- `src/types/speech.ts`：语音识别、摘要、简历卡片和抽取项类型。
- `src/styles.css`：Tailwind 入口、主题变量和浮层/聊天动画。
- `scripts/phone-qr.mjs`：生成手机扫码预览页。

## 数据流

1. `JobScreen` 点击“说话报名”，调用 `useVoiceSession().actions.openApply()`。
2. 用户按住说话，`startHoldToTalk()` 先申请麦克风权限，再启动 `createSpeechRecognizerAdapter()`。
3. Web Speech API 返回 final/interim 文本，hook 维护 `transcriptChunks` 和 `interimText`。
4. 用户松手后，hook 等待一个短暂 grace period，再停止识别并组合完整 transcript。
5. `analyzeResumeWithAgent(transcript)` POST 到 `/api/resume-agent`。
6. Vite middleware 调用 AI，要求只返回 JSON，并由 `buildAnalysis()` 转为 `ResumeAnalysis`。
7. 前端按抽取项播放阶段式反馈，进入 review 态。
8. 用户确认后回到职位页，并展示报名成功 toast。

## AI 抽取约定

`/api/resume-agent` 的输出必须最终符合：

```ts
{
  phone: { value: string; detected: boolean; sourceText: string | null };
  age: { value: string; detected: boolean; sourceText: string | null };
  city: { value: string; detected: boolean; sourceText: string | null };
  position: { value: string; detected: boolean; sourceText: string | null };
}
```

注意事项：

- `detected` 只有原文明确提到时才为 `true`。
- `sourceText` 必须是原文依据，没有依据填 `null`。
- 城市最多保留最后 3 个，职位最多保留最后 5 个，用顿号连接。
- 同一字段前后冲突、否定、改口或补充时，以最后明确表达为准。
- 不要编造缺失字段。

## UI 与交互注意事项

- 这是手机 H5 demo，很多布局是按 414 x 896 设计稿尺寸写的绝对定位。改 UI 时要同时检查桌面缩放预览和手机尺寸。
- 不要随意替换现有视觉资源；`src/assets/` 里包含职位页背景、浮层背景、麦克风、关闭按钮、状态图标等素材。
- 按住说话流程里，`requestingPermission`、`recording`、`recognizing`、`summarizing`、`result`、`error` 都有意义，改状态机前先读完整 `useVoiceSession.ts`。
- `preserveExisting` 用于继续补充已有信息；合并逻辑会保留上一轮已识别字段，不要轻易删除。
- Web Speech API 在 iOS/内嵌 WebView 里支持情况不稳定，错误文案要保持可恢复、可理解。

## 测试策略

- 改字段抽取、归一化、城市/职位词表时，优先补 `src/utils/resumeCard.test.ts` 或针对 `vite.config.ts` 中归一化逻辑加测试。
- 改通用文本处理或 mock 摘要时，跑 `src/lib/summary/mockSummaryService.test.ts`。
- 改语音状态机时，至少跑 `npm run test` 和 `npm run build`；有条件的话用真机或浏览器手动走一遍按住说话流程。
- 涉及 AI 接口时，除了 happy path，也要验证缺少 `AI_API_KEY`、空 transcript、AI 返回非 JSON、AI 接口 4xx/5xx 的错误展示。

## 开发约定

- 代码风格以现有文件为准：TypeScript、函数组件、局部 helper、小范围状态。
- 保持中文产品文案自然直接，错误提示要告诉用户下一步怎么恢复。
- 不要把真实 API key 写进前端代码、README、测试或提交记录。
- 不要提交 `dist/`、`.tmp/`、`node_modules/` 或本地环境文件。
- 仓库可能存在用户未提交改动。修改前先看相关文件当前内容，只改任务需要的部分，不回滚无关改动。
- 每次修改完成后，都把可访问的预览链接或相关文件链接贴出来。
