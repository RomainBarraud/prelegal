# syntax=docker/dockerfile:1.7

# ---------- Stage 1: build the Next.js static export ----------
FROM node:20-alpine AS web
WORKDIR /web
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# ---------- Stage 2: FastAPI backend serving the static site ----------
FROM python:3.12-slim AS runtime
ENV UV_LINK_MODE=copy \
    UV_PROJECT_ENVIRONMENT=/opt/venv \
    PATH="/opt/venv/bin:$PATH" \
    PRELEGAL_STATIC_DIR=/app/static \
    PRELEGAL_DB_PATH=/app/data/app.db
COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv
WORKDIR /app

COPY backend/pyproject.toml ./backend/pyproject.toml
COPY backend/src ./backend/src
RUN uv sync --project backend --no-dev

COPY --from=web /web/out /app/static

RUN mkdir -p /app/data
EXPOSE 8000
CMD ["uv", "run", "--project", "backend", "uvicorn", "prelegal.main:app", "--host", "0.0.0.0", "--port", "8000"]
