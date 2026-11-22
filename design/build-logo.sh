#!/bin/sh
# Bygger om logotyp, favicon, vattenmärke och PNG-ikoner ur design/vector_003_clean.psd.
# Kräver bara Docker eller Podman. Kör från repots rot: design/build-logo.sh
set -eu
cd "$(dirname "$0")/.."
ENGINE=$(command -v docker || command -v podman)
$ENGINE build -q -t ambrosias-logo-tools -f design/Dockerfile.logo design >/dev/null
$ENGINE run --rm --user "$(id -u):$(id -g)" -e HOME=/tmp \
  -v "$PWD/design:/in:ro" -v "$PWD/static:/site/static" \
  ambrosias-logo-tools python -W ignore -I /in/psd_to_svg.py "$@"
