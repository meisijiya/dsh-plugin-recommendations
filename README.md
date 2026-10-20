# DSH 插件推荐仓库

> 收录本机 **已安装**的 34 个 DSH（DeepSeek Harness）插件：上游 GitHub 仓库地址、功能分类、以及**逐字来自上游仓库的原生安装命令**。
>
> 每条安装命令都取自对应上游仓库的 README 或源码原文，本仓库不重写、不简化、不自造命令。
> 全部 33 条可公开安装，1 条为私有/本地生成（见 [不可公开安装的条目](#不可公开安装的条目)）。

- **机器可读目录**：[`plugins.json`](./plugins.json) —— 单一事实源，README 与安装脚本都从它派生
- **安装脚本**：[`install.sh`](./install.sh)（bash / Git Bash）、[`install.ps1`](./install.ps1)（Windows PowerShell）
- **采集口径**：`dsh plugin --profile web list`，快照于 2026-10-20，DSH 0.2.0-rc.2
- **仓库地址校验**：全部 34 条均经 GitHub API 实测存在（非 404、未归档）

---

## 一键安装

三种入口，按需选：

### 1. 脚本（推荐）

```bash
# 先预览，不动你的环境
./install.sh --dry-run

# 按分类装
./install.sh --install --category market,dev-workflow

# 按预设分组装
./install.sh --install --preset shell

# 指定 profile（web / dsh-tui / desktop / headless）
./install.sh --install --profile dsh-tui --category integration
```

Windows PowerShell：

```powershell
.\install.ps1 --dry-run
.\install.ps1 --install --preset public-full
```

> `--dry-run` 是**默认模式**：不执行任何安装，只打印将要运行的命令。必须显式加 `--install` 才会真正安装。

### 2. 手动配置（把插件挂进 profile）

若你想手工控制 profile 的组成，直接编辑 `%USERPROFILE%\.dsh\profiles\<profile>\package.json` 的 `dsh.profile.bundles` 数组，把包名按需追加进去（顺序即配置优先级）：

```json
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
```

**同时**要把对应包写进 `dependencies`，否则 DSH 解析不到 bundle 会跳过该层（源码 `resolveBundleDir` 找不到即报 `cannot resolve profile bundle`）。

### 3. 逐条复制

下方分类总表里每个插件都带一行现成命令，直接复制到终端即可。

> **为什么不提供一个"打包 bundle"？**
> DSH 源码 `loadProfileDirectory` 逐个遍历 `dsh.profile.bundles`，**每个 bundle 只贡献自己那一层的 `cordis.patch.yml`**——依赖包各自的 patch 不会自动生效。造一个聚合包会得到"装上了但不生效"的假象。所以本仓库选择**回放上游各自的安装命令**，这是唯一真能跑通的路径。
> 真正可用的聚合包请用上游自己提供的，例如 `@linxin666/dsh-web-all`。

---

## 分类总表

| 分类 | 数量 | 说明 |
| --- | --- | --- |
| [插件市场与分发](#market) | 3 | 插件的发现、搜索与分发入口。装这些等于给 DSH 装上"应用商店"。 |
| [界面外壳与交互](#ui-shell) | 4 | 改变 DSH Web 界面形态与交互体验的客户端侧插件。 |
| [智能体编排与协作](#agent-orchestration) | 3 | 多智能体团队、专家智能体、Agent 预设等编排能力。 |
| [开发工作流](#dev-workflow) | 7 | 代码审查、简化、上下文管理、任务回退等日常开发辅助。 |
| [技能包与提示词](#skills) | 4 | 以 Skill / Prompt 形式交付的方法论、模板与提示词资产。 |
| [工具与运行时](#tools-runtime) | 1 | 文件、Shell、终端等底层执行能力的替代或增强实现。 |
| [办公文档与多媒体](#office-media) | 2 | Office 文档、表格、演示稿与视频创作能力。 |
| [联网搜索与知识](#search-knowledge) | 1 | 全网检索、网页读取、站内搜索与知识库能力。 |
| [外部集成与通信](#integration) | 8 | 浏览器控制、IM 平台、模型来源、跨 Agent 记忆等对外连接。 |
| [安全与治理](#safety) | 1 | 危险命令拦截、敏感文件保护等执行前安全闸门。 |

## 预设分组

`--preset` 可直接使用的分组：

| 预设 id | 名称 | 条目数 | 说明 |
| --- | --- | --- | --- |
| `market` | 市场与入口 | 3 | 先把插件市场装上，后面所有插件都能在里面图形化安装。 |
| `shell` | 界面与外壳 | 4 | 改变 DSH Web 观感与操作方式的一组插件。 |
| `orchestration` | 多智能体协作 | 3 | 团队协作、专家智能体与 Agent 预设。 |
| `dev` | 开发效率 | 7 | 代码审查、简化、上下文治理、任务回退与归档。 |
| `skills` | 技能与提示词 | 4 | 以 Skill / Prompt 形式交付的方法论资产。 |
| `tooling` | 工具与运行时 | 1 | 文件 / Shell / 终端等底层执行能力。 |
| `office` | 办公与多媒体 | 2 | Office 文档、表格、演示稿与视频。 |
| `search` | 联网搜索 | 1 | 让 Agent 能查全网、读网页。 |
| `integration` | 外部集成 | 8 | 浏览器、IM、模型来源、跨 Agent 记忆。 |
| `safety` | 安全闸门 | 1 | 危险命令与敏感文件访问的拦截。 |
| `public-full` | 全部可公开安装的插件 | 33 | 除私有条目（clawd-bridge）外的全部插件。 |

---

## 分类详情

<a id="market"></a>
### 插件市场与分发 · 3 个

插件的发现、搜索与分发入口。装这些等于给 DSH 装上"应用商店"。

| 插件 | 上游仓库 | 版本 | 许可 | 上游原生安装命令 |
| --- | --- | --- | --- | --- |
| **dshmarket** | [dsh-market/dsh-market](https://github.com/dsh-market/dsh-market) | 1.66.44 | MIT | `dsh plugin --profile {profile} add dshmarket` |
| **dsh-prompt** | [FeatherHunter/dsh-prompt](https://github.com/FeatherHunter/dsh-prompt) | 0.4.37 | MIT | `dsh plugin --profile {profile} add dsh-prompt` |
| **dsh-mattpocock-skills-deck** | [FeatherHunter/dsh-mattpocock-skills-deck](https://github.com/FeatherHunter/dsh-mattpocock-skills-deck) | 1.9.0-beta.5 | MIT | `dsh plugin --profile {profile} add dsh-mattpocock-skills-deck` |

> 详情（含上游其它等价安装方式、注意事项）见 [plugins.json](./plugins.json) 对应条目，或运行 `install.sh --list`。

<a id="ui-shell"></a>
### 界面外壳与交互 · 4 个

改变 DSH Web 界面形态与交互体验的客户端侧插件。

| 插件 | 上游仓库 | 版本 | 许可 | 上游原生安装命令 |
| --- | --- | --- | --- | --- |
| **dsh-better-sidebar** | [omdsh-dev/DSH-better-sidebar](https://github.com/omdsh-dev/DSH-better-sidebar) | 0.28.0 | MIT | `dsh plugin --profile {profile} add dsh-better-sidebar@latest` |
| **@linxin666/dsh-client-ui-git-graph** | [zhu1090093659/dsh-web](https://github.com/zhu1090093659/dsh-web) | 0.4.8 | Apache-2.0 | `dsh plugin --profile {profile} add @linxin666/dsh-client-ui-git-graph@latest` |
| **@michengai/dsh-codex-ui** | [MichengAI/dsh-codex-ui](https://github.com/MichengAI/dsh-codex-ui) | 1.1.43 | Apache-2.0 | `dsh plugin --profile {profile} add @michengai/dsh-codex-ui@latest --registry=https://registry.npmjs.org/` |
| **@changfenhuang/dsh-genui** | [omdsh-dev/dsh-genui](https://github.com/omdsh-dev/dsh-genui) | 0.13.0 | MIT | `dsh plugin --profile {profile} add @changfenhuang/dsh-genui` |

> 详情（含上游其它等价安装方式、注意事项）见 [plugins.json](./plugins.json) 对应条目，或运行 `install.sh --list`。

<a id="agent-orchestration"></a>
### 智能体编排与协作 · 3 个

多智能体团队、专家智能体、Agent 预设等编排能力。

| 插件 | 上游仓库 | 版本 | 许可 | 上游原生安装命令 |
| --- | --- | --- | --- | --- |
| **@nanmicoder/dsh-agent-teams** | [NanmiCoder/dsh-agent-teams](https://github.com/NanmiCoder/dsh-agent-teams) | 0.1.25 | MIT | `dsh plugin --profile {profile} add --save-exact @nanmicoder/dsh-agent-teams` |
| **@michengai/dsh-agency-agents** | [MichengAI/dsh-agency-agents](https://github.com/MichengAI/dsh-agency-agents) | 1.2.8 | Apache-2.0 | `dsh plugin --profile {profile} add @michengai/dsh-agency-agents@latest --registry=https://registry.npmjs.org/` |
| **clearai-dsh** | [Clearailhc/clearai-dsh](https://github.com/Clearailhc/clearai-dsh) | 0.5.6 | Apache-2.0 | `dsh plugin --profile {profile} add clearai-dsh@0.5.6` |

> 详情（含上游其它等价安装方式、注意事项）见 [plugins.json](./plugins.json) 对应条目，或运行 `install.sh --list`。

<a id="dev-workflow"></a>
### 开发工作流 · 7 个

代码审查、简化、上下文管理、任务回退等日常开发辅助。

| 插件 | 上游仓库 | 版本 | 许可 | 上游原生安装命令 |
| --- | --- | --- | --- | --- |
| **@michengai/dsh-code-review** | [MichengAI/dsh-code-review](https://github.com/MichengAI/dsh-code-review) | 1.0.1 | Apache-2.0 | `dsh plugin --profile {profile} add @michengai/dsh-code-review@latest --registry=https://registry.npmjs.org/` |
| **@michengai/dsh-simplify** | [MichengAI/dsh-simplify](https://github.com/MichengAI/dsh-simplify) | 1.0.1 | Apache-2.0 | `dsh plugin --profile {profile} add @michengai/dsh-simplify@1.0.1 --registry=https://registry.npmjs.org/` |
| **dsh-context** | [bowenliang123/dsh-context](https://github.com/bowenliang123/dsh-context) | 0.73.3 | Apache-2.0 | `dsh plugin --profile {profile} add dsh-context` |
| **dsh-rewind-plugin** | [SiriLee/dsh-rewind](https://github.com/SiriLee/dsh-rewind) | 0.17.1 | MIT | `dsh plugin --profile {profile} add dsh-rewind-plugin@{version}` |
| **@michengai/dsh-archive-manager** | [MichengAI/dsh-archive-manager](https://github.com/MichengAI/dsh-archive-manager) | 1.1.6 | Apache-2.0 | `dsh plugin --profile {profile} add @michengai/dsh-archive-manager@latest --registry=https://registry.npmjs.org/` |
| **@michengai/dsh-btw** | [MichengAI/dsh-btw](https://github.com/MichengAI/dsh-btw) | 1.0.0 | Apache-2.0 | `dsh plugin --profile {profile} add @michengai/dsh-btw@latest --registry=https://registry.npmjs.org/` |
| **@michengai/dsh-automation** | [MichengAI/dsh-automation](https://github.com/MichengAI/dsh-automation) | 1.0.4 | Apache-2.0 | `dsh plugin --profile {profile} add @michengai/dsh-automation@latest --registry=https://registry.npmjs.org/` |

> 详情（含上游其它等价安装方式、注意事项）见 [plugins.json](./plugins.json) 对应条目，或运行 `install.sh --list`。

<a id="skills"></a>
### 技能包与提示词 · 4 个

以 Skill / Prompt 形式交付的方法论、模板与提示词资产。

| 插件 | 上游仓库 | 版本 | 许可 | 上游原生安装命令 |
| --- | --- | --- | --- | --- |
| **@michengai/dsh-skills-manager** | [MichengAI/dsh-skills-manager](https://github.com/MichengAI/dsh-skills-manager) | 1.2.8 | Apache-2.0 | `dsh plugin --profile {profile} add @michengai/dsh-skills-manager@latest --registry=https://registry.npmjs.org/` |
| **dsh-qa-skills** | [fishzjp/qa-skills](https://github.com/fishzjp/qa-skills) | 0.6.0 | MIT | `dsh plugin --profile {profile} add dsh-qa-skills` |
| **@tt-a1i/archify-dsh** | [tt-a1i/archify](https://github.com/tt-a1i/archify) | 1.0.0 | MIT | `dsh plugin --profile {profile} add @tt-a1i/archify-dsh@1.0.0` |
| **lunheng-article-pipeline** | [zuoyunlai/lunheng-article-pipeline-dsh](https://github.com/zuoyunlai/lunheng-article-pipeline-dsh) | 19.21.0 | MIT | `dsh plugin --profile {profile} add lunheng-article-pipeline` |

> 详情（含上游其它等价安装方式、注意事项）见 [plugins.json](./plugins.json) 对应条目，或运行 `install.sh --list`。

<a id="tools-runtime"></a>
### 工具与运行时 · 1 个

文件、Shell、终端等底层执行能力的替代或增强实现。

| 插件 | 上游仓库 | 版本 | 许可 | 上游原生安装命令 |
| --- | --- | --- | --- | --- |
| **dsh-ops** | [T-Auto/dsh-ops](https://github.com/T-Auto/dsh-ops) | 0.4.0 | NOASSERTION | `dsh plugin --profile {profile} add dsh-ops` |

> 详情（含上游其它等价安装方式、注意事项）见 [plugins.json](./plugins.json) 对应条目，或运行 `install.sh --list`。

<a id="office-media"></a>
### 办公文档与多媒体 · 2 个

Office 文档、表格、演示稿与视频创作能力。

| 插件 | 上游仓库 | 版本 | 许可 | 上游原生安装命令 |
| --- | --- | --- | --- | --- |
| **dsh-univer-office** | [dream-num/dsh-univer-office](https://github.com/dream-num/dsh-univer-office) | 0.3.7 | Apache-2.0 | `dsh plugin --profile {profile} add dsh-univer-office` |
| **dsh-remotion** | [STARDUSTLC666/dsh-remotion](https://github.com/STARDUSTLC666/dsh-remotion) | 0.6.0 | MIT | `dsh plugin --profile {profile} add dsh-remotion` |

> 详情（含上游其它等价安装方式、注意事项）见 [plugins.json](./plugins.json) 对应条目，或运行 `install.sh --list`。

<a id="search-knowledge"></a>
### 联网搜索与知识 · 1 个

全网检索、网页读取、站内搜索与知识库能力。

| 插件 | 上游仓库 | 版本 | 许可 | 上游原生安装命令 |
| --- | --- | --- | --- | --- |
| **@liustack/modsearch** | [liustack/modsearch](https://github.com/liustack/modsearch) | 5.10.10 | MIT | `npx -y @deepseek-ai/dsh plugin --profile {profile} add @liustack/modsearch@5.10.10` |

> 详情（含上游其它等价安装方式、注意事项）见 [plugins.json](./plugins.json) 对应条目，或运行 `install.sh --list`。

<a id="integration"></a>
### 外部集成与通信 · 8 个

浏览器控制、IM 平台、模型来源、跨 Agent 记忆等对外连接。

| 插件 | 上游仓库 | 版本 | 许可 | 上游原生安装命令 |
| --- | --- | --- | --- | --- |
| **@wxg-prc-cpg/browser-skill-dsh-plugin** | [Tencent/BrowserSkill](https://github.com/Tencent/BrowserSkill) | 0.3.3 | MIT | `dsh plugin --profile {profile} add @wxg-prc-cpg/browser-skill-dsh-plugin` |
| **@michengai/dsh-im-connect** | [MichengAI/dsh-im-connect](https://github.com/MichengAI/dsh-im-connect) | 1.0.8 | Apache-2.0 | `dsh plugin --profile {profile} add @michengai/dsh-im-connect@latest --registry=https://registry.npmjs.org/` |
| **@opencode2dsh/dsh-plugin** | [FishBottle7/opencode2dsh](https://github.com/FishBottle7/opencode2dsh) | 0.3.13 | MIT | `dsh plugin --profile {profile} add @opencode2dsh/dsh-plugin` |
| **dsh-workbuddy-connect** | [corrinehu/dsh-workbuddy-connect](https://github.com/corrinehu/dsh-workbuddy-connect) | 0.7.9 | MIT | `dsh plugin --profile {profile} add dsh-workbuddy-connect@0.7.9` |
| **dsh-subusage** | [KouzakiUmi/dsh-subusage](https://github.com/KouzakiUmi/dsh-subusage) | 0.14.2 | MIT | `dsh plugin --profile {profile} add dsh-subusage` |
| **dsh-pocket** | [shaobeichen/dsh-pocket](https://github.com/shaobeichen/dsh-pocket) | 2.12.0 | GPL-2.0 | `dsh plugin --profile {profile} add dsh-pocket -w` |
| **omp-memory-dsh** | [meisijiya/omp-memory-dsh](https://github.com/meisijiya/omp-memory-dsh) | 0.2.0 | MIT | `dsh plugin --profile {profile} add https://github.com/meisijiya/omp-memory-dsh/releases/download/v0.2.0/omp-memory-dsh-0.2.0.tgz` |
| **@dsh-external/dsh-clawd-bridge** | _(私有生成，无公开仓库)_ | 0.1.0 🔒 | MIT | `dsh plugin --profile {profile} add link:{clawdGenerationDir}` |

> 详情（含上游其它等价安装方式、注意事项）见 [plugins.json](./plugins.json) 对应条目，或运行 `install.sh --list`。

<a id="safety"></a>
### 安全与治理 · 1 个

危险命令拦截、敏感文件保护等执行前安全闸门。

| 插件 | 上游仓库 | 版本 | 许可 | 上游原生安装命令 |
| --- | --- | --- | --- | --- |
| **cc-safety-net** | [kenryu42/cc-safety-net](https://github.com/kenryu42/cc-safety-net) | 2.6.16 | MIT | `npx -y @deepseek-ai/dsh plugin --profile {profile} add cc-safety-net@{version}` |

> 详情（含上游其它等价安装方式、注意事项）见 [plugins.json](./plugins.json) 对应条目，或运行 `install.sh --list`。

## 不可公开安装的条目

以下条目**无法从公共渠道安装**（私有包 / 本机 link 生成），安装脚本会自动跳过并说明原因，不给出必然 404 的命令：

| 插件 | 版本 | 情况 |
| --- | --- | --- |
| **@dsh-external/dsh-clawd-bridge** | 0.1.0 | 私有生成物：由 Clawd on Desk 桌面端在 %USERPROFILE%\.clawd\integrations\deepseek-harness 下生成，owner 为 clawd-on-desk，无公开 GitHub 仓库。 |

---

## 采集与校验口径

- **清单来源**：`dsh plugin --profile web list`（本机 `web` profile 实测输出），另含 `headless` / `markettest` profile 中的本地插件。
- **上游仓库地址**：取自各插件 `package.json` 的 `repository.url`，并逐个用 GitHub API 复验存在性、归档状态与许可证。
- **安装命令**：逐字来自上游仓库 README / 源码。MichengAI 系列上游统一要求 `--registry=https://registry.npmjs.org/`，该参数**原样保留**。
- **占位符**：命令中的 `{profile}` 由脚本替换为目标 profile；`{version}` 替换为本机实测版本（上游用 `<version>` 占位的情况同理）；`{clawdGenerationDir}` 需手工替换为本机路径。
- **不造轮子**：本仓库不提供自造的安装协议，所有条目走**上游仓库的 DSH 安装方式**。

## 目录结构

```
dsh-plugin-recommendations/
├── README.md            # 本文件（分类总表由 plugins.json 生成）
├── plugins.json         # 机器可读目录 —— 单一事实源
├── install.sh           # 一键安装（bash 壳）
├── install.ps1          # 一键安装（PowerShell 壳，UTF-8 BOM）
├── scripts/
│   ├── install.mjs      # 安装核心（跨平台，两壳共用）
│   └── gen-readme.mjs   # 从 plugins.json 重新生成 README
└── .gitignore
```

## 免责声明

本仓库只是一份**索引与安装说明**，不含任何插件代码。所有插件版权归各自作者，行为与安全性以其上游仓库为准；安装前请自行审阅上游许可证与源码。
