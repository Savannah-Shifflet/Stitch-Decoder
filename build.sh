#!/usr/bin/env bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

MODE=""
PLATFORM=""

usage() {
  echo "Usage: ./build.sh --dev <ios|android> | --preview <ios|android|all> | --prod <ios|android|all>"
  echo ""
  echo "  --dev <platform>      Development client build (installs on device, connects to local server)"
  echo "  --preview <platform>  Internal preview build (shareable APK/IPA, no dev tools)"
  echo "  --prod <platform>     Production build (for App Store / Play Store)"
  echo ""
  echo "  Platforms: ios | android | all"
  echo ""
  echo "Examples:"
  echo "  ./build.sh --dev ios          # iOS dev client (on device)"
  echo "  ./build.sh --dev android      # Android dev client APK"
  echo "  ./build.sh --preview all      # Internal preview for both platforms"
  echo "  ./build.sh --prod ios         # Production iOS build"
  echo ""
  echo "After --dev ios build: scan QR code in Xcode to install on your device,"
  echo "or use 'eas build:run' to install on a connected device."
  exit 0
}

if [ $# -lt 2 ]; then
  usage
fi

for arg in "$@"; do
  case $arg in
    --dev) MODE="development" ;;
    --preview) MODE="preview" ;;
    --prod) MODE="production" ;;
    ios) PLATFORM="ios" ;;
    android) PLATFORM="android" ;;
    all) PLATFORM="all" ;;
    --help|-h) usage ;;
  esac
done

if [ -z "$MODE" ] || [ -z "$PLATFORM" ]; then
  echo "Error: must specify a mode and a platform."
  usage
fi

# Validate eas-cli is installed
if ! command -v eas &>/dev/null; then
  echo "Error: eas-cli not found. Run ./setup.sh --eas first."
  exit 1
fi

# Check project is linked
if grep -q "FILL_IN_AFTER_EAS_INIT" app.json 2>/dev/null; then
  echo "Error: project not linked to EAS yet. Run ./setup.sh --eas first."
  exit 1
fi

echo "==> Building [$MODE] for [$PLATFORM]..."
echo ""

if [ "$MODE" = "development" ] && [ "$PLATFORM" = "ios" ]; then
  echo "  Tip: use --dev-simulator for a faster iOS Simulator build (no device provisioning needed):"
  echo "       eas build --profile development-simulator --platform ios"
  echo ""
fi

if [ "$PLATFORM" = "all" ]; then
  eas build --profile "$MODE" --platform all
else
  eas build --profile "$MODE" --platform "$PLATFORM"
fi

echo ""
echo "==> Build submitted to EAS. Check progress at https://expo.dev"
echo ""
if [ "$MODE" = "development" ]; then
  echo "  Once the build finishes:"
  echo "  1. Download and install the .ipa/.apk on your device"
  echo "  2. Run: ./start.sh --dev-client --clear"
  echo "  3. Open the installed dev client app and scan the QR code"
fi
