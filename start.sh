#!/usr/bin/env bash
# Start the full stack (after first-time setup.sh has been run).
# Usage:
#   bash start.sh          — start all services
#   bash start.sh stop     — stop containers, keep data
#   bash start.sh reset    — stop and wipe all data (fresh start)
#   bash start.sh logs     — tail logs for all services
#   bash start.sh status   — show container status

set -e

cd "$(dirname "$0")"

CMD="${1:-up}"

case "$CMD" in
  up|"")
    docker compose up
    ;;
  stop)
    docker compose down
    ;;
  reset)
    docker compose down -v
    ;;
  logs)
    docker compose logs -f
    ;;
  status)
    docker compose ps
    ;;
  *)
    echo "Usage: bash start.sh [up|stop|reset|logs|status]"
    exit 1
    ;;
esac
