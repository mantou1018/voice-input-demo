import { spawnSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(process.cwd());
const distDir = resolve(root, 'dist');
const outputDir = resolve(root, '.tmp', 'edgeone-preview');

rmSync(outputDir, { recursive: true, force: true });
mkdirSync(outputDir, { recursive: true });

const buildResult = spawnSync(
  'npx',
  ['vite', 'build', '--mode', 'production'],
  {
    cwd: root,
    env: {
      ...process.env,
      VITE_FORCE_LOCAL_RESUME_ANALYSIS: 'true',
    },
    stdio: 'inherit',
  },
);

if (buildResult.status !== 0) {
  process.exit(buildResult.status ?? 1);
}

if (!existsSync(distDir)) {
  console.error('缺少 dist 目录，无法生成 EdgeOne 预览包。');
  process.exit(1);
}

cpSync(distDir, outputDir, { recursive: true });

writeFileSync(
  resolve(outputDir, 'edgeone-preview-note.txt'),
  [
    '这个目录是给 EdgeOne Pages 临时预览用的部署包。',
    '已启用 VITE_FORCE_LOCAL_RESUME_ANALYSIS=true。',
    '因此预览链接上的报名结果走本地规则兜底，不依赖 /api/resume-agent 云端接口。',
  ].join('\n'),
  'utf8',
);

console.log(outputDir);
