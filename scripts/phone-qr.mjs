import os from 'node:os';
import fs from 'node:fs';
import path from 'node:path';

const DEFAULT_PORT = process.env.PHONE_PORT || '5173';
const OUTPUT_PATH = path.resolve(process.cwd(), '.tmp/phone-qr.html');

function findLocalIPv4() {
  const interfaces = os.networkInterfaces();

  for (const entries of Object.values(interfaces)) {
    for (const entry of entries ?? []) {
      if (
        entry &&
        entry.family === 'IPv4' &&
        !entry.internal &&
        !entry.address.startsWith('169.254.')
      ) {
        return entry.address;
      }
    }
  }

  return null;
}

function buildUrl(input) {
  if (input?.startsWith('http://') || input?.startsWith('https://')) {
    return input;
  }

  const localIP = findLocalIPv4();

  if (!localIP) {
    console.error('没有找到可用的局域网 IPv4 地址，请确认 Mac 已连接 Wi‑Fi。');
    process.exit(1);
  }

  const url = new URL(`http://${localIP}:${DEFAULT_PORT}`);
  const pathname = input ? (input.startsWith('/') ? input : `/${input}`) : '/';
  url.pathname = pathname;
  return url.toString();
}

const input = process.argv[2];
const url = buildUrl(input);
const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=${encodeURIComponent(url)}`;
const html = `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Phone QR</title>
    <style>
      :root {
        color-scheme: light;
        font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "PingFang SC", sans-serif;
      }

      body {
        margin: 0;
        min-height: 100vh;
        display: grid;
        place-items: center;
        background:
          radial-gradient(circle at top, #e8fff6, transparent 32%),
          linear-gradient(180deg, #f7f8fa 0%, #eef2f7 100%);
        color: #152033;
      }

      main {
        width: min(92vw, 420px);
        padding: 28px;
        border-radius: 24px;
        background: rgba(255, 255, 255, 0.92);
        box-shadow: 0 18px 60px rgba(27, 39, 79, 0.12);
        text-align: center;
      }

      img {
        width: min(72vw, 320px);
        height: auto;
        border-radius: 16px;
        background: white;
      }

      code {
        display: block;
        margin-top: 16px;
        padding: 12px;
        border-radius: 14px;
        background: #f3f6fb;
        word-break: break-all;
        font-size: 13px;
      }

      p {
        margin: 0 0 14px;
      }
    </style>
  </head>
  <body>
    <main>
      <p>iPhone 和电脑连同一个 Wi-Fi 后，直接扫码即可打开。</p>
      <img src="${qrImageUrl}" alt="Phone QR Code" />
      <code>${url}</code>
    </main>
  </body>
</html>
`;

fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
fs.writeFileSync(OUTPUT_PATH, html);

console.log(`Phone URL: ${url}`);
console.log(`QR page: ${OUTPUT_PATH}`);
console.log(`QR image URL: ${qrImageUrl}`);
console.log('iPhone 和电脑连同一个 Wi-Fi 后，直接扫码即可打开。');
