#!/bin/sh

# Start Nginx in background
nginx

# Change to backend directory and start server
cd /app/backend && pm2-runtime start src/server.js