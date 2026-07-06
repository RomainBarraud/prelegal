#!/usr/bin/env bash
set -euo pipefail
NAME=prelegal
docker rm -f "$NAME" >/dev/null 2>&1 || true
echo "Prelegal stopped."
