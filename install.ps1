#Requires -Version 7.0
# claw-rice installer for Windows
# Usage: irm https://raw.githubusercontent.com/2233admin/claw-rice/main/install.ps1 | iex

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$ErrorActionPreference = "Stop"

$e = [char]27
$orange = "$e[38;2;217;119;87m"
$dim    = "$e[38;2;102;102;102m"
$green  = "$e[38;2;85;204;85m"
$red    = "$e[38;2;204;85;85m"
$rst    = "$e[0m"

function Log($msg) { Write-Host "  ${dim}>${rst} $msg" }
function Ok($msg)  { Write-Host "  ${green}✓${rst} $msg" }
function Err($msg) { Write-Host "  ${red}✗${rst} $msg" }

Write-Host ""
Write-Host "  ${orange}claw-rice${rst} installer"
Write-Host "  ${dim}─────────────────────${rst}"
Write-Host ""

# Clone or update
$repo = "$env:USERPROFILE\.claw-rice"
if (Test-Path $repo) {
    Log "Updating existing installation..."
    Push-Location $repo
    git pull --quiet
    Pop-Location
    Ok "Updated"
} else {
    Log "Cloning claw-rice..."
    git clone --quiet https://github.com/2233admin/claw-rice.git $repo
    Ok "Cloned to $repo"
}

# Install terminal config
$choice = Read-Host "  Install terminal rice? (powershell profile + windows terminal + omp) [y/N]"
if ($choice -eq 'y' -or $choice -eq 'Y') {
    # Oh My Posh theme
    $ompDir = "$env:USERPROFILE\.config\omp"
    if (-not (Test-Path $ompDir)) { New-Item -ItemType Directory -Path $ompDir -Force | Out-Null }
    Copy-Item "$repo\terminal\omp\claude-dark.omp.json" "$ompDir\claude-dark.omp.json" -Force
    Ok "Oh My Posh theme -> $ompDir"

    # PowerShell profile (backup existing)
    $profileDir = Split-Path $PROFILE -Parent
    if (-not (Test-Path $profileDir)) { New-Item -ItemType Directory -Path $profileDir -Force | Out-Null }
    if (Test-Path $PROFILE) {
        $backup = "$PROFILE.bak.$(Get-Date -Format 'yyyyMMdd-HHmmss')"
        Copy-Item $PROFILE $backup -Force
        Log "Backed up existing profile -> $backup"
    }
    # Write with UTF-8 BOM (critical for Unicode display)
    $content = Get-Content "$repo\terminal\powershell\Microsoft.PowerShell_profile.ps1" -Raw -Encoding UTF8
    $utf8Bom = New-Object System.Text.UTF8Encoding($true)
    [System.IO.File]::WriteAllText($PROFILE, $content, $utf8Bom)
    Ok "PowerShell profile (UTF-8 BOM)"

    # Windows Terminal scheme (merge, don't overwrite)
    Log "Windows Terminal: manually merge settings from $repo\terminal\windows-terminal\settings.json"
    Log "  - Copy the 'Claude Dark' scheme to your schemes[]"
    Log "  - Set colorScheme: 'Claude Dark' in profiles.defaults"
    Log "  - Add -nologo to your pwsh commandline"
}

# Install Claude Code config
$choice = Read-Host "  Install Claude Code skills/rules/agents? [y/N]"
if ($choice -eq 'y' -or $choice -eq 'Y') {
    $claudeDir = "$env:USERPROFILE\.claude"

    # Skills
    $skillsDir = "$claudeDir\skills"
    if (-not (Test-Path $skillsDir)) { New-Item -ItemType Directory -Path $skillsDir -Force | Out-Null }
    Copy-Item "$repo\skills\*" $skillsDir -Force -Recurse
    Ok "Skills -> $skillsDir"

    # Rules
    $rulesDir = "$claudeDir\rules\common"
    if (-not (Test-Path $rulesDir)) { New-Item -ItemType Directory -Path $rulesDir -Force | Out-Null }
    Copy-Item "$repo\rules\*" $rulesDir -Force
    Ok "Rules -> $rulesDir"

    # Agents
    $agentsDir = "$claudeDir\agents"
    if (-not (Test-Path $agentsDir)) { New-Item -ItemType Directory -Path $agentsDir -Force | Out-Null }
    Copy-Item "$repo\agents\*" $agentsDir -Force
    Ok "Agents -> $agentsDir"
}

Write-Host ""
Write-Host "  ${green}Done.${rst} Open a new terminal tab to see the magic."
Write-Host ""
