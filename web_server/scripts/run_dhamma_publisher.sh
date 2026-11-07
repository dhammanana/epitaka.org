#!/usr/bin/env bash
# Cron-friendly wrapper around dhamma_publisher.py.
#
# Finds a Python interpreter that actually has the publisher's dependencies
# (Pillow), whatever the virtualenv is called on this machine — `env/` on the
# development checkout, `venv/` on the server. The .env file is loaded by the
# Python script itself (scripts/.env or web_server/.env).
#
# Usage:
#   ./run_dhamma_publisher.sh                      # generate and save one post
#   ./run_dhamma_publisher.sh --post-facebook      # generate and publish
#   ./run_dhamma_publisher.sh --sample --samples 4 # offline previews
#
# Crontab (two posts a day, 06:15 and 19:15, server timezone):
#   15 6,19 * * * /home/deploy/apps/epitaka/web_server/scripts/run_dhamma_publisher.sh --post-facebook >> /home/deploy/apps/epitaka/web_server/scripts/logs/cron.log 2>&1

set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
WEB_SERVER_DIR="$(dirname -- "$SCRIPT_DIR")"
APP_ROOT="$(dirname -- "$WEB_SERVER_DIR")"

# Candidate virtualenvs, in preference order (dev checkout, server, generic).
VENV_CANDIDATES=(
    "$WEB_SERVER_DIR/env"
    "$WEB_SERVER_DIR/venv"
    "$WEB_SERVER_DIR/.venv"
    "$SCRIPT_DIR/.venv"
    "$APP_ROOT/env"
    "$APP_ROOT/venv"
    "$APP_ROOT/.venv"
)

has_pillow() {
    "$1" -c "import PIL" >/dev/null 2>&1
}

# 1. Prefer a virtualenv that already has Pillow installed.
PYTHON=""
for venv in "${VENV_CANDIDATES[@]}"; do
    candidate="$venv/bin/python"
    if [ -x "$candidate" ] && has_pillow "$candidate"; then
        PYTHON="$candidate"
        break
    fi
done

# 2. Fall back to the first usable interpreter that has Pillow (e.g. a system
#    install with requirements-dhamma.txt already applied).
if [ -z "$PYTHON" ]; then
    for candidate in $(command -v python3 python 2>/dev/null || true); do
        if has_pillow "$candidate"; then
            PYTHON="$candidate"
            break
        fi
    done
fi

# 3. Nothing suitable: report the virtualenvs that do exist so the fix is clear.
if [ -z "$PYTHON" ]; then
    echo "ERROR: no Python interpreter with Pillow found." >&2
    for venv in "${VENV_CANDIDATES[@]}"; do
        if [ -d "$venv" ]; then
            echo "  found virtualenv without Pillow: $venv" >&2
        fi
    done
    echo "Install the dependencies, e.g.:" >&2
    echo "  $WEB_SERVER_DIR/venv/bin/python -m pip install -r $SCRIPT_DIR/requirements-dhamma.txt" >&2
    exit 1
fi

if [ -f "$SCRIPT_DIR/.env" ]; then
    ENV_FILE="$SCRIPT_DIR/.env"
elif [ -f "$WEB_SERVER_DIR/.env" ]; then
    ENV_FILE="$WEB_SERVER_DIR/.env"
else
    ENV_FILE="(none found)"
fi

mkdir -p "$SCRIPT_DIR/logs"
echo "=== $(date '+%Y-%m-%d %H:%M:%S %Z') run_dhamma_publisher.sh ===" \
    "python=$PYTHON env=$ENV_FILE args=$*"

cd "$SCRIPT_DIR"
exec "$PYTHON" "$SCRIPT_DIR/dhamma_publisher.py" "$@"
