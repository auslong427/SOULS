#!/bin/sh
set -e

# Default to port 8080 if PORT is not set (Cloud Run will set this)
PORT=${PORT:-8080}

echo "Starting nginx on port $PORT"

# Substitute the PORT variable in nginx.conf.template and write to nginx.conf
envsubst '${PORT}' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf

# Start nginx in the foreground
exec nginx -g 'daemon off;'
