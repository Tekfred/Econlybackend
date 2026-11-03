#!/bin/sh
set -eu

MONGOD_BIN="${MONGOD_BIN:-$HOME/.local/opt/mongodb-macos-x86_64--8.0.34/bin/mongod}"
DB_PATH="$HOME/.local/var/mongodb"

if [ ! -x "$MONGOD_BIN" ]; then
  echo "mongod not found at $MONGOD_BIN. Set MONGOD_BIN to its executable path." >&2
  exit 1
fi

exec "$MONGOD_BIN" --dbpath "$DB_PATH" --shutdown
