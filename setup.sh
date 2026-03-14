#!/usr/bin/env bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

EAS_INIT=false

usage() {
  echo "Usage: ./setup.sh [--eas]"
  echo ""
  echo "  --eas   Also run EAS login + configure (first-time cloud build setup)"
  exit 0
}

for arg in "$@"; do
  case $arg in
    --eas) EAS_INIT=true ;;
    --help|-h) usage ;;
  esac
done

# ── 1. Dependencies ────────────────────────────────────────────────────────────
echo "==> Installing dependencies..."
npm install --legacy-peer-deps

# ── 2. Metro / Watchman cache ──────────────────────────────────────────────────
echo "==> Clearing bundler caches..."
rm -rf /tmp/metro-* 2>/dev/null || true
rm -rf "$TMPDIR/metro-*" 2>/dev/null || true

if command -v watchman &>/dev/null; then
  echo "==> Clearing Watchman..."
  watchman watch-del-all
fi

# ── 3. EAS setup (first-time only) ────────────────────────────────────────────
if [ "$EAS_INIT" = true ]; then
  echo ""
  echo "==> EAS setup..."

  if ! command -v eas &>/dev/null; then
    echo "  Installing eas-cli globally..."
    npm install -g eas-cli
  else
    echo "  eas-cli already installed: $(eas --version)"
  fi

  # Skip login if already authenticated
  if eas whoami &>/dev/null 2>&1; then
    echo "  Already logged in as: $(eas whoami)"
  else
    echo "  Logging in to Expo account (browser will open)..."
    eas login
  fi

  # Skip init if projectId is already set
  CURRENT_ID="$(node -e "const a=require('./app.json'); console.log(a.expo?.extra?.eas?.projectId || '')" 2>/dev/null || echo '')"
  if [ -n "$CURRENT_ID" ] && [ "$CURRENT_ID" != "FILL_IN_AFTER_EAS_INIT" ]; then
    echo "  Project already linked (projectId: $CURRENT_ID)"
  else
    echo "  Linking project to EAS (creates projectId in app.json)..."
    eas init
  fi

  echo ""
  echo "  EAS setup complete."
  echo "  Next: run ./build.sh to create your first dev client build."
fi

echo ""
echo "==> Setup complete."
echo "  Start dev server : ./start.sh --dev-client"
echo "  Build dev client : ./build.sh --dev ios"
echo "  Build dev client : ./build.sh --dev android"
