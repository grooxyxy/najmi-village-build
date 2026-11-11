#!/usr/bin/env bash
# Download the offline Piper binary and the Indonesian news voice into .cache/piper.
# CI runs this before scripts/generate-tts.mjs. Nothing is installed system-wide.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PIPER_DIR="${PIPER_DIR:-$ROOT/.cache/piper}"
PIPER_VERSION="${PIPER_VERSION:-2023.11.14-2}"
VOICE="${PIPER_VOICE:-id_ID-news_tts-medium}"
VOICE_BASE="https://huggingface.co/rhasspy/piper-voices/resolve/main/id/id_ID/news_tts/medium"
BIN_URL="https://github.com/rhasspy/piper/releases/download/${PIPER_VERSION}/piper_linux_x86_64.tar.gz"

mkdir -p "$PIPER_DIR"

if [ ! -x "$PIPER_DIR/piper" ]; then
  echo "[piper] downloading binary ${PIPER_VERSION}"
  tmp="$(mktemp -d)"
  trap 'rm -rf "$tmp"' EXIT
  curl -L --fail --retry 3 --retry-delay 2 "$BIN_URL" -o "$tmp/piper.tar.gz"
  tar -xzf "$tmp/piper.tar.gz" -C "$tmp"
  bin="$(find "$tmp" -maxdepth 4 -type f -name piper | head -n 1)"
  if [ -z "$bin" ]; then
    echo "[piper] could not find the piper executable in the archive" >&2
    exit 1
  fi
  cp -a "$(dirname "$bin")/." "$PIPER_DIR/"
  chmod +x "$PIPER_DIR/piper"
  rm -rf "$tmp"
  trap - EXIT
else
  echo "[piper] binary already present"
fi

if [ ! -f "$PIPER_DIR/${VOICE}.onnx" ]; then
  echo "[piper] downloading voice ${VOICE}"
  curl -L --fail --retry 3 --retry-delay 2 \
    "$VOICE_BASE/${VOICE}.onnx" \
    -o "$PIPER_DIR/${VOICE}.onnx"
fi

if [ ! -f "$PIPER_DIR/${VOICE}.onnx.json" ]; then
  curl -L --fail --retry 3 --retry-delay 2 \
    "$VOICE_BASE/${VOICE}.onnx.json" \
    -o "$PIPER_DIR/${VOICE}.onnx.json"
fi

echo "[piper] binary: $PIPER_DIR/piper"
echo "[piper] voice:  $PIPER_DIR/${VOICE}.onnx"

# Sanity check; some archive builds need their sibling libraries on the path.
if LD_LIBRARY_PATH="$PIPER_DIR:${LD_LIBRARY_PATH:-}" "$PIPER_DIR/piper" --help >/dev/null 2>&1; then
  echo "[piper] executable check passed"
else
  echo "[piper] warning: 'piper --help' did not exit cleanly; synthesis will report details" >&2
fi
