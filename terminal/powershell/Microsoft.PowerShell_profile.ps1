#------------------------------- UTF-8 Encoding -------------------------------
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8
chcp 65001 | Out-Null

#------------------------------- Splash Screen --------------------------------
# ANSI 24-bit true color — Write-Host -ForegroundColor only supports 16 colors
# Customize the ASCII art banner to your liking (https://patorjk.com/software/taag/)
$splash_start = Get-Date
$e = [char]27
$gray    = "$e[38;2;68;68;68m"
$orange1 = "$e[38;2;217;119;87m"
$orange2 = "$e[38;2;232;132;92m"
$orange3 = "$e[38;2;240;144;112m"
$dim     = "$e[38;2;102;102;102m"
$brown   = "$e[38;2;139;107;83m"
$rst     = "$e[0m"

# === Replace HAKIMI with your own ASCII art ===
$info = "PS $($PSVersionTable.PSVersion) · $env:USERNAME@$env:COMPUTERNAME"
$pad = 40 - $info.Length
$padding = " " * [Math]::Max($pad, 1)

Write-Host ""
Write-Host "${gray}  ╔══════════════════════════════════════════════════════════════╗"
Write-Host "  ║${rst}                                                            ${gray}║"
Write-Host "  ║${rst}    ${orange1}██╗  ██╗ █████╗ ██╗  ██╗██╗███╗   ███╗██╗${rst}              ${gray}║"
Write-Host "  ║${rst}    ${orange1}██║  ██║██╔══██╗██║ ██╔╝██║████╗ ████║██║${rst}              ${gray}║"
Write-Host "  ║${rst}    ${orange2}███████║███████║█████╔╝ ██║██╔████╔██║██║${rst}              ${gray}║"
Write-Host "  ║${rst}    ${orange2}██╔══██║██╔══██║██╔═██╗ ██║██║╚██╔╝██║██║${rst}              ${gray}║"
Write-Host "  ║${rst}    ${orange3}██║  ██║██║  ██║██║  ██╗██║██║ ╚═╝ ██║██║${rst}              ${gray}║"
Write-Host "  ║${rst}    ${orange3}╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝╚═╝   ╚═╝╚═╝${rst}              ${gray}║"
Write-Host "  ║${rst}                                                            ${gray}║"
Write-Host "  ║${rst}    ${dim}PS $($PSVersionTable.PSVersion)${rst} ${gray}·${rst} ${brown}$env:USERNAME@$env:COMPUTERNAME${rst}${padding}${gray}║"
Write-Host "  ╚══════════════════════════════════════════════════════════════╝${rst}"
Write-Host ""

#------------------------------- Import Modules -------------------------------
Import-Module PSReadLine -MinimumVersion 2.4.0
Import-Module posh-git
Import-Module Terminal-Icons

# Oh My Posh - Claude Dark Theme
oh-my-posh init pwsh --config "$HOME/.config/omp/claude-dark.omp.json" | Invoke-Expression

# Zoxide (smart cd)
Invoke-Expression (& { (zoxide init powershell | Out-String) })

#------------------------------- PSReadLine -----------------------------------
Set-PSReadLineOption -EditMode Emacs
Set-PSReadLineOption -HistorySearchCursorMovesToEnd

# Predictive completion (interactive only)
if ($Host.UI.SupportsVirtualTerminal) {
    Set-PSReadLineOption -PredictionSource HistoryAndPlugin
    if ((Get-Module PSReadLine).Version -ge [version]'2.6.0') {
        Set-PSReadLineOption -PredictiveViewStyle ListView
    }
}

# Claude Dark syntax highlighting
Set-PSReadLineOption -Colors @{
    Command            = '#999999'
    Parameter          = '#666666'
    String             = '#D97757'
    Comment            = '#333333'
    Keyword            = '#888888'
    Variable           = '#8B6B53'
    Operator           = '#555555'
    Number             = '#D97757'
    Type               = '#666666'
    Error              = '#CC5555'
    InlinePrediction   = '#333333'
    ListPrediction     = '#555555'
    ListPredictionSelected = '#1A1410'
}

# fzf history search (Ctrl+r)
Set-PSReadLineKeyHandler -Key "Ctrl+r" -ScriptBlock {
    $line = $null
    $cursor = $null
    [Microsoft.PowerShell.PSConsoleReadLine]::GetBufferState([ref]$line, [ref]$cursor)
    $result = Get-Content (Get-PSReadLineOption).HistorySavePath | fzf --tac --no-sort --height 40% --layout reverse --border --color "bg+:#1A1410,fg:#999999,fg+:#D97757,border:#333333,hl:#D97757,hl+:#D97757,info:#555555,prompt:#D97757,pointer:#D97757"
    if ($result) {
        [Microsoft.PowerShell.PSConsoleReadLine]::RevertLine()
        [Microsoft.PowerShell.PSConsoleReadLine]::Insert($result)
    }
}

#------------------------------- Hot Keys -------------------------------------
Set-PSReadLineKeyHandler -Key Tab -Function MenuComplete
Set-PSReadLineKeyHandler -Key UpArrow -Function HistorySearchBackward
Set-PSReadLineKeyHandler -Key DownArrow -Function HistorySearchForward
Set-PSReadLineKeyHandler -Key "Ctrl+d" -Function ViExit
Set-PSReadLineKeyHandler -Key "Ctrl+z" -Function Undo

#------------------------------- Aliases --------------------------------------
Set-Alias -Name ll -Value Get-ChildItem
Set-Alias -Name which -Value Get-Command
Set-Alias -Name grep -Value Select-String
Set-Alias -Name cat -Value bat

#------------------------------- Load Time ------------------------------------
$splash_ms = [math]::Round(((Get-Date) - $splash_start).TotalMilliseconds)
$e = [char]27
$tc = if ($splash_ms -lt 500) { "$e[38;2;85;204;85m" } elseif ($splash_ms -lt 1000) { "$e[38;2;217;119;87m" } else { "$e[38;2;204;85;85m" }
Write-Host "  ${tc}⚡ loaded in ${splash_ms}ms$e[0m"
Write-Host ""
