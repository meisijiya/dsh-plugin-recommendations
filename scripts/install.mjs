#!/usr/bin/env node
/**
 * DSH 插件推荐仓库 —— 一键安装核心（跨平台）
 *
 * 设计原则：
 *   1. 逐字回放【上游仓库 README / 源码】给出的 DSH 安装命令，不自造命令、不改写参数。
 *   2. 命令模板来自 plugins.json 的 upstreamInstall 字段，{profile} 占位符在执行时替换。
 *   3. 默认 --dry-run 预览，确认无误再 --install 实装。
 *
 * 两种壳（install.sh / install.ps1）都只调用本文件，保证逻辑单一来源。
 */
import { readFileSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..');
const CATALOG_PATH = join(ROOT, 'plugins.json');

const C = {
  red: (s) => `\x1b[31m${s}\x1b[0m`,
  green: (s) => `\x1b[32m${s}\x1b[0m`,
  yellow: (s) => `\x1b[33m${s}\x1b[0m`,
  cyan: (s) => `\x1b[36m${s}\x1b[0m`,
  dim: (s) => `\x1b[2m${s}\x1b[0m`,
  bold: (s) => `\x1b[1m${s}\x1b[0m`,
};

function die(msg) {
  process.stderr.write(C.red('[错误] ') + msg + '\n');
  process.exit(1);
}

function parseArgs(argv) {
  const opts = {
    profile: 'web',
    mode: 'dry-run',
    categories: [],
    only: [],
    presets: [],
  };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    const need = (name) => {
      const v = argv[i + 1];
      if (v === undefined) die(`${name} 缺少参数`);
      i += 1;
      return v;
    };
    switch (arg) {
      case '--profile': opts.profile = need('--profile'); break;
      case '--category': opts.categories.push(...need('--category').split(',').map((s) => s.trim()).filter(Boolean)); break;
      case '--only': opts.only.push(...need('--only').split(',').map((s) => s.trim()).filter(Boolean)); break;
      case '--preset': opts.presets.push(...need('--preset').split(',').map((s) => s.trim()).filter(Boolean)); break;
      case '--install': opts.mode = 'install'; break;
      case '--dry-run': opts.mode = 'dry-run'; break;
      case '--list': opts.mode = 'list'; break;
      case '-h':
      case '--help': opts.mode = 'help'; break;
      default: die(`未知参数：${arg}（用 --help 看用法）`);
    }
  }
  return opts;
}

const HELP = `
DSH 插件推荐仓库 —— 一键安装

用法:
  install.mjs --list                      列出所有插件及其上游安装命令
  install.mjs --dry-run                   预览全部（默认模式，不执行任何安装）
  install.mjs --category market,dev       按分类选择
  install.mjs --only dshmarket,dsh-ops    按插件 id 选择
  install.mjs --preset shell              按预设分组选择
  install.mjs --profile dsh-tui           指定 profile（默认 web）
  install.mjs --install --category safety 真正执行安装

可用的 --category:
  market              插件市场与分发
  ui-shell            界面外壳与交互
  agent-orchestration 智能体编排与协作
  dev-workflow        开发工作流
  skills              技能包与提示词
  tools-runtime       工具与运行时
  office-media        办公文档与多媒体
  search-knowledge    联网搜索与知识
  integration         外部集成与通信
  safety              安全与治理

可用的 --preset:
  market / shell / orchestration / dev / skills / tooling / office / search / integration / safety / public-full
`;

let catalog;
try {
  catalog = JSON.parse(readFileSync(CATALOG_PATH, 'utf8'));
} catch (error) {
  die(`无法读取 plugins.json：${error.message}`);
}

const opts = parseArgs(process.argv.slice(2));

if (opts.mode === 'help') {
  process.stdout.write(HELP);
  process.exit(0);
}

if (opts.mode === 'list') {
  const pad = (s, n) => String(s).padEnd(n);
  process.stdout.write(`\n${pad('ID', 26)}${pad('包名', 42)}${pad('版本', 12)}${pad('分类', 22)}仓库\n`);
  process.stdout.write('-'.repeat(120) + '\n');
  for (const p of catalog.plugins) {
    const mark = p.selfDeveloped ? '  🏠 自研' : p.notPublic ? '  🔒 不可公开安装' : '';
    process.stdout.write(
      `${pad(p.id, 26)}${pad(p.name, 42)}${pad(p.version, 12)}${pad(p.category, 22)}${p.repo || '(私有生成，无公开仓库)'}${mark}\n`,
    );
  }
  process.stdout.write(`\n${C.dim(`共 ${catalog.plugins.length} 个插件。安装请用 --install。`)}\n\n`);
  process.exit(0);
}

const byId = new Map(catalog.plugins.map((p) => [p.id, p]));
const chosen = [];
const push = (id) => {
  if (byId.has(id) && !chosen.includes(id)) chosen.push(id);
};

if (opts.categories.length === 0 && opts.only.length === 0 && opts.presets.length === 0) {
  for (const p of catalog.plugins) push(p.id);
} else {
  for (const id of opts.only) {
    if (!byId.has(id)) die(`未知插件 id：${id}`);
    push(id);
  }
  const validCats = new Set(catalog.categories.map((c) => c.id));
  for (const c of opts.categories) {
    if (!validCats.has(c)) die(`未知分类：${c}（用 --help 看可用分类）`);
    for (const p of catalog.plugins) if (p.category === c) push(p.id);
  }
  for (const pid of opts.presets) {
    const pre = catalog.meta.presets.find((x) => x.id === pid);
    if (!pre) die(`未知预设：${pid}（用 --help 看可用预设）`);
    for (const id of pre.pluginIds) push(id);
  }
}

const plan = chosen.map((id) => {
  const p = byId.get(id);
  const cmd = (p.upstreamInstall || '')
    .split('{profile}').join(opts.profile)
    // 上游用尖括号/花括号占位版本号时，回落到本机实测版本，避免装出 404
    .split('{version}').join(p.version)
    .split('<version>').join(p.version)
    .split('{clawdGenerationDir}').join(p.clawdGenerationDir || '<Clawd on Desk 生成目录>');
  const notes = (p.installNotes || '')
    .split('{version}').join(p.version)
    .split('<version>').join(p.version)
    .split('{clawdGenerationDir}').join(p.clawdGenerationDir || '<Clawd on Desk 生成目录>');
  return { ...p, cmd, notes };
});

process.stdout.write(C.cyan('══ DSH 插件安装计划 ══') + '\n');
process.stdout.write(
  C.dim(`profile: ${opts.profile}    目标: ${plan.length} 个插件    模式: ${opts.mode}`) + '\n\n',
);

/** 逐字执行上游命令（不经 shell 二次解析），保留原始退出码。 */
function runCommand(cmd) {
  return new Promise((resolve) => {
    const child = spawn(cmd, {
      shell: true,
      stdio: 'inherit',
      windowsHide: true,
    });
    child.on('error', () => resolve(1));
    child.on('close', (code) => resolve(code ?? 1));
  });
}

let succeeded = 0;
let failed = 0;
let skipped = 0;

for (let i = 0; i < plan.length; i += 1) {
  const p = plan[i];
  const head = C.cyan(`[${String(i + 1).padStart(2, '0')}/${String(plan.length).padStart(2, '0')}]`);
  process.stdout.write(`${head} ${C.green(p.name)} ${C.dim(`(${p.version})`)}\n`);
  process.stdout.write(`        ${C.dim(p.cmd)}\n`);

  if (p.notPublic) {
    process.stdout.write(`        ${C.yellow('⏭  不可公开安装（私有 / 本地 link），跳过')}\n`);
    if (p.notes) process.stdout.write(`        ${C.dim(`ℹ ${p.notes}`)}\n`);
    skipped += 1;
    continue;
  }

  if (opts.mode === 'dry-run') {
    if (p.notes) process.stdout.write(`        ${C.dim(`ℹ ${p.notes}`)}\n`);
    continue;
  }

  const code = await runCommand(p.cmd);
  if (code === 0) {
    process.stdout.write(`        ${C.green('✅ 成功')}\n`);
    succeeded += 1;
  } else {
    process.stdout.write(`        ${C.red(`❌ 失败（退出码 ${code}）`)}\n`);
    if (p.notes) process.stdout.write(`        ${C.dim(`ℹ ${p.notes}`)}\n`);
    failed += 1;
  }
}

process.stdout.write('\n');
if (opts.mode === 'dry-run') {
  process.stdout.write(C.cyan('━━ 以上为预览，未执行任何安装。加 --install 真正执行。') + '\n');
  process.stdout.write(C.dim(`   例：install --install --profile ${opts.profile} --category market,dev`) + '\n');
  process.exit(0);
}

process.stdout.write(
  C.cyan(`━━ 安装结束：成功 ${succeeded}，失败 ${failed}，跳过 ${skipped}（不可公开安装）`) + '\n',
);
if (failed > 0) {
  process.stdout.write(C.yellow('   失败项不会中断后续安装；请对照各插件 README 的排障章节手工处理。') + '\n');
}
process.stdout.write(C.dim('   装完重启 DSH（dsh web）使新插件生效。') + '\n');
process.exit(failed > 0 ? 1 : 0);
