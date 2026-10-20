#!/usr/bin/env bash
# DSH 插件推荐仓库 —— 一键安装（bash 壳）
#
# 真正的逻辑在 scripts/install.mjs（跨平台单一来源），本文件只做定位与转发。
# 用法见 ./install.sh --help
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
exec node "$SCRIPT_DIR/scripts/install.mjs" "$@"
