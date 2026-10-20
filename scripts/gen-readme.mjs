#!/usr/bin/env node
/**
 * 从 plugins.json 生成 README.md 的分类总表与安装说明。
 * 单一事实源：plugins.json —— README 不手写插件条目，避免两处不一致。
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..');
const cat = JSON.parse(readFileSync(join(ROOT, 'plugins.json'), 'utf8'));

const byCat = new Map(cat.categories.map((c) => [c.id, c]));
const esc = (s) => String(s ?? '').replace(/\|/g, '\\|');

/** 分类小节：每个插件一行，含上游仓库链接与上游原生安装命令。 */
function section(catId) {
  const c = byCat.get(catId);
  const items = cat.plugins.filter((p) => p.category === catId);
  const lines = [];
  // 显式锚点：GitHub 按标题文字生成锚点，中文标题的锚点不可预测，
  // 这里用 <a id> 固定为分类 id，保证目录里的链接一定跳得到。
  lines.push(`<a id="${esc(catId)}"></a>`);
  lines.push(`### ${c.name} · ${items.length} 个`);
  lines.push('');
  lines.push(c.summary);
  lines.push('');
  lines.push('| 插件 | 上游仓库 | 版本 | 许可 | 上游原生安装命令 |');
  lines.push('| --- | --- | --- | --- | --- |');
  for (const p of items) {
    const repoCell = p.repo
      ? `[${esc(p.repo.replace('https://github.com/', ''))}](${p.repo})`
      : '_(私有生成，无公开仓库)_';
    const cmd = '`' + esc(p.upstreamInstall) + '`';
    const license = p.license ?? '—';
    const ver = p.notPublic ? `${p.version} 🔒` : p.version;
    lines.push(`| **${esc(p.name)}** | ${repoCell} | ${ver} | ${license} | ${cmd} |`);
  }
  lines.push('');
  lines.push('> 详情（含上游其它等价安装方式、注意事项）见 [plugins.json](./plugins.json) 对应条目，或运行 `install.sh --list`。');
  lines.push('');
  return lines.join('\n');
}

const total = cat.plugins.length;
const publicCount = cat.plugins.filter((p) => !p.notPublic).length;
const catIndex = cat.categories
  .map((c) => {
    const n = cat.plugins.filter((p) => p.category === c.id).length;
    return `| [${esc(c.name)}](#${c.id.replace(/[^a-z0-9-]/g, '')}) | ${n} | ${esc(c.summary)} |`;
  })
  .join('\n');

const presetIndex = cat.meta.presets
  .map((p) => `| \`${p.id}\` | ${esc(p.name)} | ${p.pluginIds.length} | ${esc(p.description)} |`)
  .join('\n');

const readme = `# DSH 插件推荐仓库

> 收录本机 **已安装**的 ${total} 个 DSH（DeepSeek Harness）插件：上游 GitHub 仓库地址、功能分类、以及**逐字来自上游仓库的原生安装命令**。
>
> 每条安装命令都取自对应上游仓库的 README 或源码原文，本仓库不重写、不简化、不自造命令。
> 全部 ${publicCount} 条可公开安装，${total - publicCount} 条为私有/本地生成（见 [不可公开安装的条目](#不可公开安装的条目)）。

- **机器可读目录**：[\`plugins.json\`](./plugins.json) —— 单一事实源，README 与安装脚本都从它派生
- **安装脚本**：[\`install.sh\`](./install.sh)（bash / Git Bash）、[\`install.ps1\`](./install.ps1)（Windows PowerShell）
- **采集口径**：\`dsh plugin --profile web list\`，快照于 ${cat.meta.generatedAt}，DSH ${cat.meta.dshVersion}
- **仓库地址校验**：全部 ${total} 条均经 GitHub API 实测存在（非 404、未归档）

---

## 一键安装

三种入口，按需选：

### 1. 脚本（推荐）

\`\`\`bash
# 先预览，不动你的环境
./install.sh --dry-run

# 按分类装
./install.sh --install --category market,dev-workflow

# 按预设分组装
./install.sh --install --preset shell

# 指定 profile（web / dsh-tui / desktop / headless）
./install.sh --install --profile dsh-tui --category integration
\`\`\`

Windows PowerShell：

\`\`\`powershell
.\\install.ps1 --dry-run
.\\install.ps1 --install --preset public-full
\`\`\`

> \`--dry-run\` 是**默认模式**：不执行任何安装，只打印将要运行的命令。必须显式加 \`--install\` 才会真正安装。

### 2. 手动配置（把插件挂进 profile）

若你想手工控制 profile 的组成，直接编辑 \`%USERPROFILE%\\.dsh\\profiles\\<profile>\\package.json\` 的 \`dsh.profile.bundles\` 数组，把包名按需追加进去（顺序即配置优先级）：

\`\`\`json
{
  "dsh": {
    "profile": {
      "bundles": [
        "@deepseek-ai/dsh-base",
        "@deepseek-ai/dsh-web-app",
        "dshmarket",
        "dsh-ops",
        "dsh-context"
      ]
    }
  }
}
\`\`\`

**同时**要把对应包写进 \`dependencies\`，否则 DSH 解析不到 bundle 会跳过该层（源码 \`resolveBundleDir\` 找不到即报 \`cannot resolve profile bundle\`）。

### 3. 逐条复制

下方分类总表里每个插件都带一行现成命令，直接复制到终端即可。

> **为什么不提供一个"打包 bundle"？**
> DSH 源码 \`loadProfileDirectory\` 逐个遍历 \`dsh.profile.bundles\`，**每个 bundle 只贡献自己那一层的 \`cordis.patch.yml\`**——依赖包各自的 patch 不会自动生效。造一个聚合包会得到"装上了但不生效"的假象。所以本仓库选择**回放上游各自的安装命令**，这是唯一真能跑通的路径。
> 真正可用的聚合包请用上游自己提供的，例如 \`@linxin666/dsh-web-all\`。

---

## 分类总表

| 分类 | 数量 | 说明 |
| --- | --- | --- |
${catIndex}

## 预设分组

\`--preset\` 可直接使用的分组：

| 预设 id | 名称 | 条目数 | 说明 |
| --- | --- | --- | --- |
${presetIndex}

---

## 分类详情

${cat.categories.map((c) => section(c.id)).join('\n')}
## 不可公开安装的条目

以下条目**无法从公共渠道安装**（私有包 / 本机 link 生成），安装脚本会自动跳过并说明原因，不给出必然 404 的命令：

| 插件 | 版本 | 情况 |
| --- | --- | --- |
${cat.plugins.filter((p) => p.notPublic).map((p) => `| **${esc(p.name)}** | ${p.version} | ${esc(p.repoNote || p.installNotes)} |`).join('\n')}

---

## 采集与校验口径

- **清单来源**：\`dsh plugin --profile web list\`（本机 \`web\` profile 实测输出），另含 \`headless\` / \`markettest\` profile 中的本地插件。
- **上游仓库地址**：取自各插件 \`package.json\` 的 \`repository.url\`，并逐个用 GitHub API 复验存在性、归档状态与许可证。
- **安装命令**：逐字来自上游仓库 README / 源码。MichengAI 系列上游统一要求 \`--registry=https://registry.npmjs.org/\`，该参数**原样保留**。
- **占位符**：命令中的 \`{profile}\` 由脚本替换为目标 profile；\`{version}\` 替换为本机实测版本（上游用 \`<version>\` 占位的情况同理）；\`{clawdGenerationDir}\` 需手工替换为本机路径。
- **不造轮子**：本仓库不提供自造的安装协议，所有条目走**上游仓库的 DSH 安装方式**。

## 目录结构

\`\`\`
dsh-plugin-recommendations/
├── README.md            # 本文件（分类总表由 plugins.json 生成）
├── plugins.json         # 机器可读目录 —— 单一事实源
├── install.sh           # 一键安装（bash 壳）
├── install.ps1          # 一键安装（PowerShell 壳，UTF-8 BOM）
├── scripts/
│   ├── install.mjs      # 安装核心（跨平台，两壳共用）
│   └── gen-readme.mjs   # 从 plugins.json 重新生成 README
└── .gitignore
\`\`\`

## 免责声明

本仓库只是一份**索引与安装说明**，不含任何插件代码。所有插件版权归各自作者，行为与安全性以其上游仓库为准；安装前请自行审阅上游许可证与源码。
`;

writeFileSync(join(ROOT, 'README.md'), readme, 'utf8');
process.stdout.write(`README.md 已生成：${total} 个插件，${cat.categories.length} 个分类，${cat.meta.presets.length} 个预设。\n`);
