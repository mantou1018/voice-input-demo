# 语音报名 Demo

这是一个面向移动端 H5 的语音报名演示项目。

用户长按说话后，页面会调用浏览器原生语音识别，把语音实时转成文字；随后再通过 `/api/resume-agent` 把转写内容整理成 4 个报名字段：

- 年龄
- 手机号
- 意向城市
- 意向职位

整个项目主要用于演示“语音输入 -> 信息抽取 -> 报名确认”的完整交互流程。

## 技术栈

- React 18
- Vite 5
- TypeScript
- Tailwind CSS 4
- 浏览器原生 `SpeechRecognition / webkitSpeechRecognition`

## 当前功能

- 职位详情页 + 语音报名入口
- 长按录音、实时转写、自动结束
- 识别结果回填到报名确认表单
- 年龄 / 城市 / 手机号 / 职位的手动补充与修改
- 报名成功页
- 本地开发时通过 Vite 中间件提供 `/api/resume-agent`
- 生产环境可走 Vercel 或 Cloudflare Worker

## 本地启动

先安装依赖：

```bash
npm install
```

启动开发环境：

```bash
npm run dev
```

如果要让手机访问本机开发环境：

```bash
npm run dev:phone
```

如果你想生成一个局域网二维码页面：

```bash
npm run phone:qr
```

## 环境变量

项目根目录新建 `.env.local`，至少需要：

```bash
AI_API_KEY=你的密钥
AI_API_BASE_URL=https://api.openai.com/v1
AI_MODEL=gpt-4.1-mini
```

说明：

- `AI_API_KEY`：模型服务密钥
- `AI_API_BASE_URL`：模型服务地址
- `AI_MODEL`：使用的模型名

没有配置这些变量时，前端页面能打开，但 AI 抽取接口不能正常工作。

## 常用命令

```bash
npm run dev
npm run dev:phone
npm run build
npm run preview
npm run test
npm run phone:qr
```

## 目录说明

```text
api/                       Vercel 的服务端接口
docs/                      过程文档和交互方案文件
scripts/                   辅助脚本
src/
  assets/                  页面图片和图标资源
  components/              React 组件
  components/voiceApply/   语音报名主流程界面
  data/                    城市、职位、文本匹配数据
  hooks/                   语音会话状态管理
  lib/                     接口处理、语音识别适配、文本整理
  types/                   类型定义
  utils/                   通用工具函数
worker/                    Cloudflare Worker 入口
```

## 接口说明

前端调用：

- `POST /api/resume-agent`

请求体示例：

```json
{
  "transcript": "我今年三十五岁，想去苏州，当仓管，电话是13800138000"
}
```

接口会返回结构化结果，供页面做确认和补充。

## 部署说明

### Vercel

项目包含：

- `api/resume-agent.ts`

适合直接部署到 Vercel。

### Cloudflare

项目包含：

- `worker/index.ts`
- `worker/resume-agent-handler.ts`
- `wrangler.jsonc`

适合通过 Cloudflare Worker + 静态资源方式部署。

## 测试

运行测试：

```bash
npm run test
```

## 说明

- 这个项目依赖浏览器原生语音识别能力，所以不同手机浏览器的兼容性会有差异。
- 如果是在某些内嵌 WebView 里打不开语音识别，优先换到系统浏览器测试。
- 当前 AI 抽取字段只包含 4 项：年龄、手机号、意向城市、意向职位。
