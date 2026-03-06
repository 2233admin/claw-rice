<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:D97757,50:E8845C,100:F09070&height=200&section=header&text=claw-rice&fontSize=80&fontColor=090909&animation=fadeIn&fontAlignY=35&desc=battle-tested%20claude%20code%20config%20%2B%20terminal%20rice&descSize=16&descColor=8B6B53&descAlignY=55" />
</p>

<div align="center">

[![License](https://img.shields.io/badge/license-MIT-D97757?style=flat-square)](LICENSE)
[![PowerShell](https://img.shields.io/badge/PowerShell-7.x-555577?style=flat-square&logo=powershell&logoColor=999999)](terminal/powershell/)
[![Windows Terminal](https://img.shields.io/badge/Windows%20Terminal-Claude%20Dark-1A1410?style=flat-square)](terminal/windows-terminal/)

**不是收藏夹。是实战踩坑后活下来的配置。**

</div>

---

## 这是什么

一套从真实项目中提炼出来的 Claude Code 工作环境配置：

- **终端美化** — Claude Dark 暗色主题全家桶 (Windows Terminal + Oh My Posh + PSReadLine 语法高亮 + fzf)
- **Clash 智能代理** — Clash Verge Rev 全局扩展脚本 (倍率感知 + GEOSITE + 多级 fallback + 7 功能组)
- **Skills** — Claude Code 可复用技能文件
- **Rules** — 编码规范、安全检查、TDD 工作流
- **Agents** — 8 个专用子代理 (planner, architect, code-reviewer, tdd-guide...)

每一条都是踩过坑的。比如你知道 PowerShell 的 `Write-Host -ForegroundColor` 只支持 16 色吗？ANSI 24-bit 真彩色得用转义序列。这种东西文档不会告诉你。

## 预览

```
  ╔══════════════════════════════════════════════════════════════╗
  ║                                                            ║
  ║    ██╗  ██╗ █████╗ ██╗  ██╗██╗███╗   ███╗██╗              ║
  ║    ██║  ██║██╔══██╗██║ ██╔╝██║████╗ ████║██║              ║
  ║    ███████║███████║█████╔╝ ██║██╔████╔██║██║              ║
  ║    ██╔══██║██╔══██║██╔═██╗ ██║██║╚██╔╝██║██║              ║
  ║    ██║  ██║██║  ██║██║  ██╗██║██║ ╚═╝ ██║██║              ║
  ║    ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝╚═╝   ╚═╝╚═╝              ║
  ║                                                            ║
  ║    PS 7.5.1 · Administrator@HAKIMI                         ║
  ╚══════════════════════════════════════════════════════════════╝

  ⚡ loaded in 482ms
```

暖橙渐变 + 暗灰边框 + 三色加载耗时指示 (绿 <500ms / 橙 <1s / 红 >1s)。

## 调色板

Claude Dark 的核心色板，贯穿终端、编辑器、语法高亮：

| 色值 | 用途 | 预览 |
|------|------|------|
| `#090909` | 背景 | ![](https://via.placeholder.com/16/090909/090909.png) |
| `#D97757` | 主强调 (橙) | ![](https://via.placeholder.com/16/D97757/D97757.png) |
| `#8B6B53` | 变量/标识 (棕) | ![](https://via.placeholder.com/16/8B6B53/8B6B53.png) |
| `#999999` | 前景文字 | ![](https://via.placeholder.com/16/999999/999999.png) |
| `#1A1410` | 选中背景 | ![](https://via.placeholder.com/16/1A1410/1A1410.png) |
| `#CC5555` | 错误 | ![](https://via.placeholder.com/16/CC5555/CC5555.png) |
| `#333333` | 注释/暗元素 | ![](https://via.placeholder.com/16/333333/333333.png) |

## 快速开始

### 一键安装 (PowerShell 7+)

```powershell
irm https://raw.githubusercontent.com/2233admin/claw-rice/main/install.ps1 | iex
```

### 手动安装

```bash
git clone https://github.com/2233admin/claw-rice.git ~/.claw-rice

# 终端美化
cp ~/.claw-rice/terminal/omp/claude-dark.omp.json ~/.config/omp/
cp ~/.claw-rice/terminal/powershell/Microsoft.PowerShell_profile.ps1 $PROFILE

# Claude Code 配置
cp ~/.claw-rice/skills/* ~/.claude/skills/
cp ~/.claw-rice/rules/* ~/.claude/rules/common/
cp ~/.claw-rice/agents/* ~/.claude/agents/
```

> **重要:** PowerShell profile 必须以 UTF-8 with BOM 编码保存，否则 Unicode 字符变乱码。

## 前置依赖

| 工具 | 安装 | 用途 |
|------|------|------|
| [PowerShell 7+](https://github.com/PowerShell/PowerShell) | `winget install Microsoft.PowerShell` | shell |
| [Oh My Posh](https://ohmyposh.dev) | `winget install JanDeDobbeleer.OhMyPosh` | prompt 主题 |
| [JetBrainsMono Nerd Font](https://www.nerdfonts.com) | `oh-my-posh font install JetBrainsMono` | 图标字体 |
| [fzf](https://github.com/junegunn/fzf) | `winget install junegunn.fzf` | 模糊搜索 |
| [zoxide](https://github.com/ajeetdsouza/zoxide) | `winget install ajeetdsouza.zoxide` | 智能 cd |
| [bat](https://github.com/sharkdp/bat) | `winget install sharkdp.bat` | 替代 cat |
| [Terminal-Icons](https://github.com/devblackops/Terminal-Icons) | `Install-Module Terminal-Icons` | ls 图标 |

## 项目结构

```
claw-rice/
├── terminal/
│   ├── powershell/          # PowerShell profile + ANSI splash screen
│   ├── windows-terminal/    # Claude Dark 配色方案
│   └── omp/                 # Oh My Posh 极简提示符主题
├── clash/
│   ├── clawproxy-global-extend.js  # Clash Verge Rev 全局扩展脚本
│   └── README.md            # Clash 模块文档
├── skills/                  # Claude Code 技能文件
│   └── terminal-ricing.md   # 终端美化踩坑知识库
├── rules/                   # 编码规范 + 安全 + TDD + Git
├── agents/                  # 8 个专用子代理
├── install.ps1              # 一键安装脚本
└── LICENSE
```

## 踩坑记录

这些是文档不会告诉你的：

1. **PowerShell `Write-Host -ForegroundColor` 只支持 16 色** — 要真彩色必须用 ANSI `\e[38;2;R;G;Bm`
2. **PowerShell profile 必须 UTF-8 with BOM** — 没 BOM 所有 Unicode 全变乱码
3. **PSReadLine `-Colors` 支持 hex** — 这是例外，只有 Write-Host 不支持
4. **Windows Terminal `-nologo` 参数** — 干掉启动时的版本信息和加载耗时
5. **`chcp 65001` 要在 profile 开头** — 不然后续的 Unicode 输出可能出问题

## 贡献

欢迎 PR。有新的踩坑经验或者好用的配置直接提。

## License

MIT

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:D97757,50:E8845C,100:F09070&height=100&section=footer" />
</p>
