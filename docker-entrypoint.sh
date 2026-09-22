#!/bin/sh
# db.js opens the sqlite file at the plain relative path 'f1data.db', which
# resolves to /app/f1data.db in this image. Container filesystems are
# ephemeral — without this, every redeploy silently wipes saved sessions,
# results and standings history.
#
# If a persistent volume is mounted at /data (set that up on whichever host
# you deploy to — Railway/Render/Fly.io volumes all support this), symlink
# the db file into it on first boot, without touching any app code.
set -e

if [ -d /data ] && [ ! -L /app/f1data.db ]; then
  [ -f /app/f1data.db ] && [ ! -f /data/f1data.db ] && mv /app/f1data.db /data/f1data.db
  rm -f /app/f1data.db
  ln -s /data/f1data.db /app/f1data.db
fi

exec "$@"
