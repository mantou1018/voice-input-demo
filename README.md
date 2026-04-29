# Voice Input Demo

移动端 H5 单页，用浏览器原生语音识别完成实时转写，并把文本整理成 mock 信息卡片。

## 当前状态

- 已手工搭好 `React + Vite + TypeScript` 项目结构。
- 语音能力依赖浏览器原生 `SpeechRecognition / webkitSpeechRecognition`。
- 语音转文字后，会通过本地 `/api/resume-agent` 调用 AI 报名助手提取信息。

## AI Agent 配置

先创建 `.env.local`：

```bash
AI_API_KEY=你的_api_key
AI_API_BASE_URL=https://api.openai.com/v1
AI_MODEL=gpt-4.1-mini
```

如果你的接口不是 OpenAI，但兼容 `/chat/completions`，把 `AI_API_BASE_URL` 和 `AI_MODEL` 改成对应服务商给你的值即可。

注意：不要把真实 API Key 写进前端代码，也不要提交到 Git。

## 启动方式

安装 Node 18+ 后执行：

```bash
npm install
npm run dev
```

如果要在 iPhone 上直接打开本机页面，推荐这样用：

```bash
npm run dev:phone
npm run phone:qr
```

说明：

- `npm run dev:phone` 会让 Vite 监听局域网地址。
- `npm run phone:qr` 会自动生成当前 Mac 局域网地址对应的二维码页面，输出文件在 `.tmp/phone-qr.html`。
- iPhone 和电脑连接同一个 Wi‑Fi 后，直接扫屏幕上的二维码即可打开。
- 也可以传具体路径，例如 `npm run phone:qr -- /foo`。

## 目录

```text
src/
  components/       UI 组件
  hooks/            录音会话状态管理
  lib/speech/       浏览器语音识别适配层
  lib/summary/      mock 摘要与示例数据
  types/            公共类型
  utils/            文本处理工具
```
