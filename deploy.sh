#!/bin/bash

# Deployment script for VIBE Dashboard
# Server: 188.225.46.190
# User: root

set -e  # Exit on error

SERVER="root@188.225.46.190"
REMOTE_DIR="/root/Hosting_bot/dashboard"
LOCAL_DIR="."

echo "🚀 Starting deployment to $SERVER..."

# Step 1: Check server connection
echo "📡 Checking server connection..."
ssh $SERVER "echo 'Connected successfully'"

# Step 2: Check Node.js version
echo "🔍 Checking Node.js version..."
ssh $SERVER "node --version || echo 'Node.js not installed'"
ssh $SERVER "npm --version || echo 'npm not installed'"

# Step 3: Check PM2
echo "🔍 Checking PM2..."
ssh $SERVER "pm2 --version || echo 'PM2 not installed'"

# Step 4: Backup old project (if exists)
echo "💾 Backing up old project..."
ssh $SERVER "if [ -d $REMOTE_DIR ]; then mv $REMOTE_DIR ${REMOTE_DIR}_backup_$(date +%Y%m%d_%H%M%S); fi"

# Step 5: Create directory
echo "📁 Creating project directory..."
ssh $SERVER "mkdir -p $REMOTE_DIR"

# Step 6: Upload project files (excluding node_modules, .next, .git)
echo "📤 Uploading project files..."
rsync -avz --progress \
  --exclude 'node_modules' \
  --exclude '.next' \
  --exclude '.git' \
  --exclude '.env.local' \
  --exclude 'deploy.sh' \
  $LOCAL_DIR/ $SERVER:$REMOTE_DIR/

# Step 7: Upload credentials file
echo "🔑 Uploading Google Sheets credentials..."
scp ../vibebot-464607-8d0d17c22710.json $SERVER:$REMOTE_DIR/

# Step 8: Install dependencies
echo "📦 Installing dependencies..."
ssh $SERVER "cd $REMOTE_DIR && npm install --production"

# Step 9: Build project
echo "🔨 Building project..."
ssh $SERVER "cd $REMOTE_DIR && npm run build"

# Step 10: Setup PM2
echo "⚙️  Setting up PM2..."
ssh $SERVER "cd $REMOTE_DIR && pm2 delete vibe-dashboard || true"
ssh $SERVER "cd $REMOTE_DIR && pm2 start npm --name vibe-dashboard -- start"
ssh $SERVER "pm2 save"
ssh $SERVER "pm2 startup || true"

# Step 11: Show status
echo "✅ Deployment completed!"
echo ""
echo "📊 PM2 Status:"
ssh $SERVER "pm2 status"
echo ""
echo "🌐 Dashboard should be running on http://188.225.46.190:3000"
echo ""
echo "📝 Useful commands:"
echo "  - View logs: ssh $SERVER 'pm2 logs vibe-dashboard'"
echo "  - Restart: ssh $SERVER 'pm2 restart vibe-dashboard'"
echo "  - Stop: ssh $SERVER 'pm2 stop vibe-dashboard'"
