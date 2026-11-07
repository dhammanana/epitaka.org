#!/usr/bin/env bash
# Cron-friendly wrapper around dhamma_publisher.py.
#
# Uses the project virtualenv at web_server/env and the .env file in
# web_server/scripts (loaded by the Python script itself), and runs from the
# scripts directory so relative paths and logs stay in one place.
#
# Usage:
#   ./run_dhamma_publisher.sh                      # generate and save one post
#   ./run_dhamma_publisher.sh --post-facebook      # generate and publish
#   ./run_dhamma_publisher.sh --sample --samples 4 # offline previews
#
# Crontab (two posts a day, 06:15 and 19:15):
#   15 6,19 * * * /path/to/epitaka.org/web_server/scripts/run_dhamma_publisher.sh --post-facebook >> /path/to/epitaka.org/web_server/scripts/logs/cron.log 2>&1

set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
WEB_SERVER_DIR="$(dirname -- "$SCRIPT_DIR")"

# Pick the project virtualenv, falling back to a scripts-local one, then PATH.
PYTHON=""
for candidate in "$WEB_SERVER_DIR/env/bin/python" "$SCRIPT_DIR/.venv/bin/python"; do
    if [ -x "$candidate" ]; then
        PYTHON="$candidate"
        break
    fi
done
if [ -z "$PYTHON" ]; then
    PYTHON="$(command -v python3 || true)"
fi
if [ -z "$PYTHON" ]; then
    echo "ERROR: no Python interpreter found (looked in $WEB_SERVER_DIR/env and PATH)." >&2
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
