#!/bin/bash

# Check server readiness for deployment
SERVER="root@188.225.46.190"

echo "🔍 Checking server readiness..."
echo ""

# Check SSH connection
echo "1️⃣ Testing SSH connection..."
if ssh -o ConnectTimeout=5 $SERVER "echo 'SSH OK'" 2>/dev/null; then
    echo "   ✅ SSH connection successful"
else
    echo "   ❌ SSH connection failed"
    exit 1
fi
echo ""

# Check Node.js
echo "2️⃣ Checking Node.js..."
NODE_VERSION=$(ssh $SERVER "node --version 2>/dev/null" || echo "not installed")
if [ "$NODE_VERSION" != "not installed" ]; then
    echo "   ✅ Node.js installed: $NODE_VERSION"
else
    echo "   ❌ Node.js not installed"
    echo "   💡 Install with: curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && apt-get install -y nodejs"
fi
echo ""

# Check npm
echo "3️⃣ Checking npm..."
NPM_VERSION=$(ssh $SERVER "npm --version 2>/dev/null" || echo "not installed")
if [ "$NPM_VERSION" != "not installed" ]; then
    echo "   ✅ npm installed: $NPM_VERSION"
else
    echo "   ❌ npm not installed"
fi
echo ""

# Check PM2
echo "4️⃣ Checking PM2..."
PM2_VERSION=$(ssh $SERVER "pm2 --version 2>/dev/null" || echo "not installed")
if [ "$PM2_VERSION" != "not installed" ]; then
    echo "   ✅ PM2 installed: $PM2_VERSION"
    echo ""
    echo "   Current PM2 processes:"
    ssh $SERVER "pm2 list"
else
    echo "   ❌ PM2 not installed"
    echo "   💡 Install with: npm install -g pm2"
fi
echo ""

# Check Nginx
echo "5️⃣ Checking Nginx..."
if ssh $SERVER "which nginx" >/dev/null 2>&1; then
    echo "   ✅ Nginx installed"
    NGINX_STATUS=$(ssh $SERVER "systemctl is-active nginx 2>/dev/null" || echo "unknown")
    echo "   Status: $NGINX_STATUS"
else
    echo "   ❌ Nginx not installed"
fi
echo ""

# Check directory
echo "6️⃣ Checking target directory..."
if ssh $SERVER "[ -d /root/Hosting_bot ]"; then
    echo "   ✅ /root/Hosting_bot exists"
    if ssh $SERVER "[ -d /root/Hosting_bot/dashboard ]"; then
        echo "   ⚠️  /root/Hosting_bot/dashboard already exists (will be backed up)"
        echo ""
        echo "   Current contents:"
        ssh $SERVER "ls -lh /root/Hosting_bot/dashboard | head -10"
    else
        echo "   ✅ /root/Hosting_bot/dashboard does not exist (will be created)"
    fi
else
    echo "   ⚠️  /root/Hosting_bot does not exist (will be created)"
fi
echo ""

# Check port 3000
echo "7️⃣ Checking port 3000..."
PORT_CHECK=$(ssh $SERVER "netstat -tlnp 2>/dev/null | grep :3000" || echo "")
if [ -z "$PORT_CHECK" ]; then
    echo "   ✅ Port 3000 is available"
else
    echo "   ⚠️  Port 3000 is in use:"
    echo "$PORT_CHECK"
fi
echo ""

# Check disk space
echo "8️⃣ Checking disk space..."
ssh $SERVER "df -h /root | tail -1"
echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Summary:"
echo ""
if [ "$NODE_VERSION" != "not installed" ] && [ "$NPM_VERSION" != "not installed" ] && [ "$PM2_VERSION" != "not installed" ]; then
    echo "✅ Server is ready for deployment!"
    echo ""
    echo "Run: bash deploy.sh"
else
    echo "⚠️  Server needs setup. Missing components:"
    [ "$NODE_VERSION" = "not installed" ] && echo "  - Node.js"
    [ "$NPM_VERSION" = "not installed" ] && echo "  - npm"
    [ "$PM2_VERSION" = "not installed" ] && echo "  - PM2"
fi
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
