# Terminal Ricing / Shell 美化

当用户要求美化终端、定制 shell 启动画面、配色方案或提示符时使用此 skill。

## 核心原则

1. **ANSI 真彩色优先** — 永远用 `\e[38;2;R;G;Bm` 转义序列，不用 `Write-Host -ForegroundColor`（只支持 16 色，垃圾）
2. **UTF-8 BOM** — PowerShell profile 文件必须 UTF-8 with BOM 编码，否则 Unicode 字符全变乱码
3. **`-nologo` 启动** — Windows Terminal 的 pwsh profile 加 `commandline: "pwsh.exe -nologo"` 干掉默认启动信息

## ANSI 颜色模板 (PowerShell)

```powershell
$e = [char]27
# 前景色: $e[38;2;R;G;Bm
# 背景色: $e[48;2;R;G;Bm
# 重置:   $e[0m
# 粗体:   $e[1m
# 暗淡:   $e[2m

# Claude Dark 调色板
$gray    = "$e[38;2;68;68;68m"      # 边框/暗元素
$orange1 = "$e[38;2;217;119;87m"    # 主强调色 (#D97757)
$orange2 = "$e[38;2;232;132;92m"    # 中间渐变
$orange3 = "$e[38;2;240;144;112m"   # 亮渐变
$dim     = "$e[38;2;102;102;102m"   # 次要信息
$brown   = "$e[38;2;139;107;83m"    # 变量/标识
$green   = "$e[38;2;85;204;85m"     # 成功
$red     = "$e[38;2;204;85;85m"     # 错误
$rst     = "$e[0m"
```

## ASCII Art 大字生成

用 Unicode block 字符 `██╗ ██║ ╚═╝` 构建大字横幅。每行渐变色实现层次感。

框架结构:
```
${gray}╔════════════════════════╗
║${rst}  ${color}ASCII ART HERE${rst}  ${gray}║
║${rst}  ${dim}info line${rst}            ${gray}║
╚════════════════════════╝${rst}
```

关键注意事项:
- 每行宽度要对齐（用空格填充到固定宽度）
- 边框用暗灰色，内容用渐变暖色
- 信息行用 dim 色，分隔符用更暗的灰

## 加载耗时显示

```powershell
$splash_start = Get-Date
# ... profile 内容 ...
$ms = [math]::Round(((Get-Date) - $splash_start).TotalMilliseconds)
$tc = if ($ms -lt 500) { $green } elseif ($ms -lt 1000) { $orange1 } else { $red }
Write-Host "  ${tc}⚡ loaded in ${ms}ms${rst}"
```

## 文件编码处理

每次编辑 PowerShell profile 后必须确保 UTF-8 BOM:
```python
# 用 Python 保存 (最可靠)
python3 -c "
path = r'目标文件路径'
with open(path, 'r', encoding='utf-8-sig') as f:
    content = f.read()
with open(path, 'w', encoding='utf-8-sig') as f:
    f.write(content)
"
```

Profile 文件开头加编码声明:
```powershell
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8
chcp 65001 | Out-Null
```

## Windows Terminal 配置

路径: `$env:LOCALAPPDATA/Packages/Microsoft.WindowsTerminal_8wekyb3d8bbwe/LocalState/settings.json`

配色方案定义在 `schemes[]`，profile 默认在 `profiles.defaults`。

关键配置项:
- `colorScheme` — 主题名
- `font.face` — 必须用 Nerd Font 才能显示图标
- `opacity` + `useAcrylic` — 透明/毛玻璃效果
- `padding` — 内边距
- `cursorShape` — 光标形状

## PSReadLine 语法高亮

PSReadLine 的 `-Colors` 参数**支持** hex 字符串 (`'#D97757'`)，这是例外——只有 `Write-Host -ForegroundColor` 不支持。

```powershell
Set-PSReadLineOption -Colors @{
    Command   = '#999999'
    String    = '#D97757'
    Comment   = '#333333'
    Variable  = '#8B6B53'
    Error     = '#CC5555'
}
```

## Oh My Posh 集成

自定义主题放 `~/.config/omp/` 目录，JSON 格式。
初始化: `oh-my-posh init pwsh --config "路径" | Invoke-Expression`

## 检查清单

- [ ] ANSI 真彩色，不用 ConsoleColor 枚举
- [ ] 文件保存为 UTF-8 with BOM
- [ ] Windows Terminal 加 `-nologo`
- [ ] ASCII art 每行宽度对齐
- [ ] 渐变色从上到下（暖→亮）
- [ ] 加载耗时三色显示（绿/橙/红）
- [ ] Nerd Font 字体确认
