#!/usr/bin/env bash
set -euo pipefail

IMAGE="ghcr.io/adamou0408/reqagent:v0.1"
WORKSPACE="${REQAGENT_WORKSPACE:-$HOME/.reqagent}"
PORT="${REQAGENT_PORT:-3000}"
SERVICE_NAME="reqagent"
KEYCHAIN_SERVICE="reqagent-api-key"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

info()  { echo -e "${GREEN}[reqagent]${NC} $*"; }
warn()  { echo -e "${YELLOW}[reqagent]${NC} $*"; }
error() { echo -e "${RED}[reqagent]${NC} $*" >&2; }

# 1. Check Docker
if ! command -v docker &>/dev/null; then
  error "Docker is not installed."
  echo "Please install Docker Desktop from https://www.docker.com/products/docker-desktop/"
  exit 1
fi

if ! docker info &>/dev/null; then
  error "Docker daemon is not running. Please start Docker Desktop."
  exit 1
fi

# 2. Read API key from OS keychain or env or prompt
get_api_key() {
  # Check env first
  if [[ -n "${ANTHROPIC_API_KEY:-}" ]]; then
    echo "$ANTHROPIC_API_KEY"
    return
  fi

  local key=""
  case "$(uname -s)" in
    Darwin)
      key=$(security find-generic-password -s "$KEYCHAIN_SERVICE" -w 2>/dev/null || true)
      ;;
    Linux)
      if command -v secret-tool &>/dev/null; then
        key=$(secret-tool lookup service "$KEYCHAIN_SERVICE" 2>/dev/null || true)
      fi
      ;;
  esac

  if [[ -n "$key" ]]; then
    echo "$key"
    return
  fi

  # Prompt user
  warn "No API key found in keychain or environment."
  read -rsp "Enter your Anthropic API key: " key
  echo
  if [[ -z "$key" ]]; then
    error "API key cannot be empty."
    exit 1
  fi

  # Store in keychain
  case "$(uname -s)" in
    Darwin)
      security add-generic-password -s "$KEYCHAIN_SERVICE" -a "$USER" -w "$key" 2>/dev/null || true
      info "API key stored in macOS Keychain."
      ;;
    Linux)
      if command -v secret-tool &>/dev/null; then
        echo -n "$key" | secret-tool store --label="REQ Agent API Key" service "$KEYCHAIN_SERVICE" 2>/dev/null || true
        info "API key stored in Linux keyring."
      fi
      ;;
  esac

  echo "$key"
}

API_KEY=$(get_api_key)

# 3. Ensure workspace directory exists
mkdir -p "$WORKSPACE/data" "$WORKSPACE/projects"

# 4. Pull latest image (if available)
info "Checking for image updates..."
docker pull "$IMAGE" 2>/dev/null || warn "Could not pull latest image, using local."

# 5. Run container
info "Starting REQ Agent on http://localhost:$PORT"
exec docker run --rm \
  --name "$SERVICE_NAME" \
  -p "$PORT:3000" \
  -v "$WORKSPACE:/workspace" \
  -e "ANTHROPIC_API_KEY=$API_KEY" \
  -e "REQAGENT_DB_PATH=/workspace/data/reqagent.db" \
  "$IMAGE"
