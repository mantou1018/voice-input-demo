# Voice Input Demo

移动端 H5 单页，用浏览器原生语音识别完成实时转写，并把文本整理成 mock 信息卡片。

## 当前状态

- 已手工搭好 `React + Vite + TypeScript` 项目结构。
- 语音能力依赖浏览器原生 `SpeechRecognition / webkitSpeechRecognition`。
- 摘要服务为前端 mock 规则生成器，不依赖后端。

## 启动方式

本机当前缺少 `node` / `npm` / `pnpm`，所以还不能直接安装依赖运行。

安装 Node 18+ 后执行：1

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
