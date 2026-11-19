#!/bin/bash
# KitaHub Deploy Script
# Usage: bash deploy.sh
# Requires: /tmp/deploy_key (ED25519 SSH key added to mStudio)

set -e

SSH_KEY="${SSH_KEY:-/tmp/deploy_key}"
SSH_HOST="christian@whatsdigital.de@a-h4qx07@ssh.altgemeinde.project.host"
REMOTE_DIR="~/html/kids-mindry"
PM2="/files/.mwsoftware/node/bin/pm2"

echo "🚀 KitaHub Deploy gestartet..."
echo ""

# 1. Sync files
echo "📦 Dateien übertragen..."
rsync -av --exclude='.git' --exclude='node_modules' --exclude='.next' --exclude='.env*' \
  -e "ssh -i $SSH_KEY -o StrictHostKeyChecking=no" \
  ./ "$SSH_HOST:$REMOTE_DIR/"

# 2. Remote: install deps + build + restart
echo ""
echo "🔨 Remote: npm install + build + restart..."
ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no "$SSH_HOST" "
  set -e
  cd $REMOTE_DIR
  npm install --frozen-lockfile 2>&1 | tail -3
  npm run build
  echo '♻️  App neu starten...'
  $PM2 restart kids-mindry || $PM2 start node_modules/.bin/next --name kids-mindry -- start
  $PM2 save
  echo '✅ Deploy abgeschlossen!'
  $PM2 list
"
