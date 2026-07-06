#!/usr/bin/env bash
set -euo pipefail

# Build and run the Prelegal container on macOS.
# App will be available at http://localhost:8000
IMAGE=prelegal:latest
NAME=prelegal
HERE="$(cd "$(dirname "$0")/.." && pwd)"

docker build -t "$IMAGE" "$HERE"
docker rm -f "$NAME" >/dev/null 2>&1 || true
docker run -d --name "$NAME" -p 8000:8000 --env-file "$HERE/.env" "$IMAGE"
echo "Prelegal is starting at http://localhost:8000"
