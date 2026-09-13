# Instalador do Claude Code CLI para Windows (PowerShell)
# Execute como Administrador para instalacao global

$ErrorActionPreference = "Stop"
$NodeMinMajor = 18

function Write-Log { param([string]$Msg); Write-Host "[INFO] $Msg" -ForegroundColor Cyan }
function Write-Ok  { param([string]$Msg); Write-Host "[OK] $Msg" -ForegroundColor Green }
function Write-Warn { param([string]$Msg); Write-Host "[WARN] $Msg" -ForegroundColor Yellow }
function Write-Fail { param([string]$Msg); Write-Host "[ERROR] $Msg" -ForegroundColor Red; exit 1 }

function Test-Command { param([string]$Name); return [bool](Get-Command $Name -ErrorAction SilentlyContinue) }

function Get-VersionMajor {
    param([string]$Version)
    $clean = $Version -replace '^v', ''
    return [int]($clean.Split('.')[0])
}

function Refresh-Path {
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" +
                [System.Environment]::GetEnvironmentVariable("Path", "User")
}

function Install-Git {
    if (Test-Command "git") {
        $version = (git --version) -replace 'git version ', ''
        Write-Ok "Git $version ja instalado"
        return
    }

    Write-Log "Instalando Git..."
    if (Test-Command "winget") {
        winget install Git.Git --accept-source-agreements --accept-package-agreements --silent
    }
    elseif (Test-Command "choco") {
        choco install git -y
    }
    else {
        Write-Fail "Instale o Git manualmente: https://git-scm.com"
    }

    Refresh-Path
    if (-not (Test-Command "git")) { Write-Fail "Falha ao instalar Git" }
    Write-Ok "Git instalado"
}

function Install-Node {
    if (Test-Command "node") {
        $current = node --version
        $major = Get-VersionMajor $current
        if ($major -ge $NodeMinMajor) {
            Write-Ok "Node.js $current ja instalado (>= v$NodeMinMajor)"
            return
        }
        Write-Warn "Node.js $current encontrado, mas versao >= v$NodeMinMajor e necessaria"
    }

    Write-Log "Instalando Node.js LTS..."
    if (Test-Command "winget") {
        winget install OpenJS.NodeJS.LTS --accept-source-agreements --accept-package-agreements --silent
    }
    elseif (Test-Command "choco") {
        choco install nodejs-lts -y
    }
    else {
        Write-Fail "Instale o Node.js manualmente: https://nodejs.org"
    }

    Refresh-Path
    if (-not (Test-Command "node")) { Write-Fail "Falha ao instalar Node.js" }
    Write-Ok "Node.js $(node --version) instalado"
}

function Install-ClaudeCli {
    if (Test-Command "claude") {
        $current = claude --version 2>$null
        if (-not $current) { $current = "desconhecida" }
        Write-Ok "Claude Code CLI ja instalado (versao: $current)"
        Write-Log "Atualizando para a versao mais recente..."
    }

    Write-Log "Instalando Claude Code CLI via npm..."
    try {
        npm install -g @anthropic-ai/claude-code
    }
    catch {
        Write-Fail "Falha ao instalar Claude Code CLI: $_"
    }

    Refresh-Path
    if (-not (Test-Command "claude")) { Write-Fail "Falha ao instalar Claude Code CLI" }
    Write-Ok "Claude Code CLI instalado"
}

function Confirm-Installation {
    Write-Host ""
    Write-Log "=== Validacao ==="
    Write-Host ""

    if (Test-Command "node") { Write-Ok "Node.js: $(node --version)" }
    else { Write-Fail "Node.js nao encontrado" }

    if (Test-Command "npm") { Write-Ok "npm: v$(npm --version)" }
    else { Write-Fail "npm nao encontrado" }

    if (Test-Command "git") { Write-Ok "Git: $((git --version) -replace 'git version ', '')" }
    else { Write-Fail "Git nao encontrado" }

    if (Test-Command "claude") {
        $cliVersion = claude --version 2>$null
        if (-not $cliVersion) { $cliVersion = "desconhecida" }
        Write-Ok "Claude CLI: $cliVersion"
    }
    else { Write-Fail "Claude CLI nao encontrado" }

    Write-Host ""
    Write-Log "Testando Claude CLI..."
    try {
        claude --help | Out-Null
        Write-Ok "Claude CLI funcionando corretamente"
    }
    catch {
        Write-Warn "Claude CLI instalado, mas 'claude --help' retornou erro"
    }

    Write-Host ""
    Write-Ok "Instalacao concluida com sucesso!"
    Write-Host ""
    Write-Log "Proximo passo: execute 'claude' para iniciar o Claude Code CLI"
    Write-Log "Para autenticar, use: claude login"
}

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "   Instalador do Claude Code CLI (Windows)" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Log "Sistema detectado: Windows ($env:PROCESSOR_ARCHITECTURE)"

Install-Git
Install-Node
Install-ClaudeCli
Confirm-Installation
