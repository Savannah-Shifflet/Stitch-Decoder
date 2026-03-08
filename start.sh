#!/usr/bin/env bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

CLEAR=false
PLATFORM=""
DEV_CLIENT=false

usage() {
  echo "Usage: ./start.sh [--clear] [--dev-client] [--ios | --android | --web]"
  echo ""
  echo "  --clear       Wipe metro bundler cache before starting"
  echo "  --dev-client  Start in dev-client mode (use with installed dev build on device)"
  echo "  --ios         Open on iOS simulator"
  echo "  --android     Open on Android emulator/device"
  echo "  --web         Open in browser"
  echo ""
  echo "  Expo Go (limited):     ./start.sh --clear"
  echo "  Dev client (full):     ./start.sh --dev-client --clear"
  exit 0
}

for arg in "$@"; do
  case $arg in
    --clear) CLEAR=true ;;
    --dev-client) DEV_CLIENT=true ;;
    --ios) PLATFORM="--ios" ;;
    --android) PLATFORM="--android" ;;
    --web) PLATFORM="--web" ;;
    --help|-h) usage ;;
  esac
done

clear_cache() {
  echo "==> Clearing metro cache..."
  rm -rf /tmp/metro-* 2>/dev/null || true
  rm -rf "$TMPDIR/metro-*" 2>/dev/null || true
  if command -v watchman &>/dev/null; then
    watchman watch-del-all
  fi
}

if [ "$DEV_CLIENT" = true ]; then
  echo "==> Starting in dev-client mode..."
  echo "    Make sure the dev client app is installed on your device/simulator."
  echo "    (Run ./build.sh --dev ios  or  ./build.sh --dev android to create it)"
  echo ""
  if [ "$CLEAR" = true ]; then
    clear_cache
  fi
  npx expo start --dev-client $PLATFORM
else
  echo "==> Starting with Expo Go..."
  echo "    NOTE: Some native modules (WatermelonDB, RevenueCat) won't work in Expo Go."
  echo "          Use --dev-client for the full experience."
  echo ""
  if [ "$CLEAR" = true ]; then
    clear_cache
    npx expo start --clear $PLATFORM
  else
    npx expo start $PLATFORM
  fi
fi
