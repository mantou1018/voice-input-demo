# Voice Input Demo

移动端 H5 单页，用浏览器原生语音识别完成实时转写，并把文本整理成 mock 信息卡片。

## 当前状态

- 已手工搭好 `React + Vite + TypeScript` 项目结构。
- 语音能力依赖浏览器原生 `SpeechRecognition / webkitSpeechRecognition`。
- 摘要服务为前端 mock 规则生成器，不依赖后端。

## 启动方式

本机当前缺少 `node` / `npm` / `pnpm`，所以还不能直接安装依赖运行。

安装 Node 18+ 后执行：

```bash
npm install
npm run dev
```

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
