#!/usr/bin/env bash
set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log()   { echo -e "${BLUE}[INFO]${NC} $*"; }
ok()    { echo -e "${GREEN}[OK]${NC} $*"; }
warn()  { echo -e "${YELLOW}[WARN]${NC} $*"; }
fail()  { echo -e "${RED}[ERROR]${NC} $*"; exit 1; }

NODE_MIN_MAJOR=18

detect_os() {
    case "$(uname -s)" in
        Darwin*)  OS="macos" ;;
        Linux*)
            if grep -qi microsoft /proc/version 2>/dev/null; then
                OS="wsl"
            else
                OS="linux"
            fi
            ;;
        MINGW*|MSYS*|CYGWIN*) OS="windows" ;;
        *) fail "Sistema operacional nao suportado: $(uname -s)" ;;
    esac
    log "Sistema detectado: $OS ($(uname -m))"
}

command_exists() { command -v "$1" &>/dev/null; }

version_major() { echo "$1" | sed 's/^v//' | cut -d. -f1; }

install_homebrew() {
    if command_exists brew; then
        ok "Homebrew ja instalado"
        return
    fi
    log "Instalando Homebrew..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    if [[ "$OS" == "macos" ]]; then
        eval "$(/opt/homebrew/bin/brew shellenv 2>/dev/null || /usr/local/bin/brew shellenv 2>/dev/null)"
    else
        eval "$(/home/linuxbrew/.linuxbrew/bin/brew shellenv 2>/dev/null)" || true
    fi
    ok "Homebrew instalado"
}

install_node() {
    if command_exists node; then
        local current
        current=$(node --version)
        local major
        major=$(version_major "$current")
        if (( major >= NODE_MIN_MAJOR )); then
            ok "Node.js $current ja instalado (>= v${NODE_MIN_MAJOR})"
            return
        fi
        warn "Node.js $current encontrado, mas versao >= v${NODE_MIN_MAJOR} e necessaria"
    fi

    log "Instalando Node.js LTS..."
    case "$OS" in
        macos)
            install_homebrew
            brew install node@22
            brew link --overwrite node@22 2>/dev/null || true
            ;;
        linux|wsl)
            if command_exists apt-get; then
                curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash - 2>/dev/null
                sudo apt-get install -y nodejs
            elif command_exists dnf; then
                curl -fsSL https://rpm.nodesource.com/setup_22.x | sudo bash - 2>/dev/null
                sudo dnf install -y nodejs
            elif command_exists yum; then
                curl -fsSL https://rpm.nodesource.com/setup_22.x | sudo bash - 2>/dev/null
                sudo yum install -y nodejs
            elif command_exists brew; then
                brew install node@22
            else
                curl -fsSL https://fnm.vercel.app/install | bash
                export PATH="$HOME/.local/share/fnm:$PATH"
                eval "$(fnm env)"
                fnm install 22
                fnm use 22
            fi
            ;;
        windows)
            if command_exists winget; then
                winget install OpenJS.NodeJS.LTS --accept-source-agreements --accept-package-agreements
            elif command_exists choco; then
                choco install nodejs-lts -y
            else
                fail "Instale o Node.js manualmente: https://nodejs.org"
            fi
            ;;
    esac

    hash -r 2>/dev/null || true
    command_exists node || fail "Falha ao instalar Node.js"
    ok "Node.js $(node --version) instalado"
}

install_git() {
    if command_exists git; then
        ok "Git $(git --version | awk '{print $3}') ja instalado"
        return
    fi

    log "Instalando Git..."
    case "$OS" in
        macos)
            install_homebrew
            brew install git
            ;;
        linux|wsl)
            if command_exists apt-get; then
                sudo apt-get update -qq && sudo apt-get install -y git
            elif command_exists dnf; then
                sudo dnf install -y git
            elif command_exists yum; then
                sudo yum install -y git
            else
                install_homebrew
                brew install git
            fi
            ;;
        windows)
            if command_exists winget; then
                winget install Git.Git --accept-source-agreements --accept-package-agreements
            elif command_exists choco; then
                choco install git -y
            else
                fail "Instale o Git manualmente: https://git-scm.com"
            fi
            ;;
    esac

    hash -r 2>/dev/null || true
    command_exists git || fail "Falha ao instalar Git"
    ok "Git $(git --version | awk '{print $3}') instalado"
}

install_claude_cli() {
    if command_exists claude; then
        local current
        current=$(claude --version 2>/dev/null || echo "desconhecida")
        ok "Claude Code CLI ja instalado (versao: $current)"
        log "Atualizando para a versao mais recente..."
    fi

    log "Instalando Claude Code CLI via npm..."
    npm install -g @anthropic-ai/claude-code 2>/dev/null || {
        warn "npm global falhou, tentando com sudo..."
        sudo npm install -g @anthropic-ai/claude-code
    }

    hash -r 2>/dev/null || true
    command_exists claude || fail "Falha ao instalar Claude Code CLI"
    ok "Claude Code CLI instalado"
}

configure_path() {
    local npm_prefix
    npm_prefix=$(npm config get prefix 2>/dev/null || echo "")
    local npm_bin="${npm_prefix}/bin"

    if [[ -n "$npm_bin" ]] && [[ ":$PATH:" != *":$npm_bin:"* ]]; then
        export PATH="$npm_bin:$PATH"
        log "Adicionado $npm_bin ao PATH"

        local shell_rc=""
        case "$(basename "${SHELL:-bash}")" in
            zsh)  shell_rc="$HOME/.zshrc" ;;
            bash) shell_rc="$HOME/.bashrc" ;;
            fish) shell_rc="$HOME/.config/fish/config.fish" ;;
        esac

        if [[ -n "$shell_rc" ]]; then
            local export_line="export PATH=\"$npm_bin:\$PATH\""
            if [[ -f "$shell_rc" ]] && grep -qF "$npm_bin" "$shell_rc" 2>/dev/null; then
                ok "PATH ja configurado em $shell_rc"
            else
                echo "" >> "$shell_rc"
                echo "# Claude Code CLI" >> "$shell_rc"
                echo "$export_line" >> "$shell_rc"
                ok "PATH adicionado a $shell_rc"
            fi
        fi
    fi
}

validate() {
    echo ""
    log "=== Validacao ==="
    echo ""

    local all_ok=true

    if command_exists node; then
        ok "Node.js: $(node --version)"
    else
        fail "Node.js nao encontrado"
        all_ok=false
    fi

    if command_exists npm; then
        ok "npm: v$(npm --version)"
    else
        fail "npm nao encontrado"
        all_ok=false
    fi

    if command_exists git; then
        ok "Git: $(git --version | awk '{print $3}')"
    else
        fail "Git nao encontrado"
        all_ok=false
    fi

    if command_exists claude; then
        local cli_version
        cli_version=$(claude --version 2>/dev/null || echo "desconhecida")
        ok "Claude CLI: $cli_version"
    else
        fail "Claude CLI nao encontrado"
        all_ok=false
    fi

    echo ""
    if $all_ok; then
        log "Testando Claude CLI..."
        if claude --help &>/dev/null; then
            ok "Claude CLI funcionando corretamente"
        else
            warn "Claude CLI instalado, mas 'claude --help' retornou erro"
        fi
    fi

    echo ""
    ok "Instalacao concluida com sucesso!"
    echo ""
    log "Proximo passo: execute 'claude' para iniciar o Claude Code CLI"
    log "Para autenticar, use: claude login"
}

main() {
    echo ""
    echo -e "${BLUE}============================================${NC}"
    echo -e "${BLUE}   Instalador do Claude Code CLI${NC}"
    echo -e "${BLUE}============================================${NC}"
    echo ""

    detect_os
    install_git
    install_node
    install_claude_cli
    configure_path
    validate
}

main "$@"
