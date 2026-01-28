# Deployment Guide - VIBE Dashboard

## Сервер
- **IP**: 188.225.46.190
- **User**: root
- **Directory**: /root/Hosting_bot/dashboard
- **Port**: 3000

## Предварительные требования

На сервере должны быть установлены:
- Node.js (v18 или выше)
- npm
- PM2
- Nginx

## Быстрый деплой

### Windows (PowerShell):
```powershell
# 1. Сделать скрипт исполняемым (в Git Bash)
chmod +x deploy.sh

# 2. Запустить деплой через Git Bash
bash deploy.sh
```

### Linux/Mac:
```bash
# 1. Сделать скрипт исполняемым
chmod +x deploy.sh

# 2. Запустить деплой
./deploy.sh
```

## Ручной деплой

### 1. Подключиться к серверу
```bash
ssh root@188.225.46.190
```

### 2. Удалить старый проект (с бэкапом)
```bash
cd /root/Hosting_bot
mv dashboard dashboard_backup_$(date +%Y%m%d_%H%M%S)
mkdir dashboard
```

### 3. Загрузить файлы (с локальной машины)
```bash
# Из директории dashboard на локальной машине
rsync -avz --exclude 'node_modules' --exclude '.next' --exclude '.git' ./ root@188.225.46.190:/root/Hosting_bot/dashboard/

# Загрузить credentials
scp ../vibebot-464607-8d0d17c22710.json root@188.225.46.190:/root/Hosting_bot/dashboard/
```

### 4. На сервере: установить и собрать
```bash
ssh root@188.225.46.190

cd /root/Hosting_bot/dashboard

# Установить зависимости
npm install --production

# Собрать проект
npm run build

# Создать .env файл
cat > .env.local << EOF
GOOGLE_SHEETS_CREDENTIALS_PATH=/root/Hosting_bot/dashboard/vibebot-464607-8d0d17c22710.json
SPREADSHEET_ID=ваш-spreadsheet-id
EOF
```

### 5. Запустить с PM2
```bash
# Остановить старый процесс (если есть)
pm2 delete vibe-dashboard

# Запустить новый
pm2 start ecosystem.config.js

# Сохранить конфигурацию
pm2 save

# Настроить автозапуск
pm2 startup
```

## Управление приложением

### Просмотр логов
```bash
ssh root@188.225.46.190 "pm2 logs vibe-dashboard"
```

### Перезапуск
```bash
ssh root@188.225.46.190 "pm2 restart vibe-dashboard"
```

### Остановка
```bash
ssh root@188.225.46.190 "pm2 stop vibe-dashboard"
```

### Статус
```bash
ssh root@188.225.46.190 "pm2 status"
```

## Настройка Nginx (если нужно)

Создать конфиг `/etc/nginx/sites-available/vibe-dashboard`:

```nginx
server {
    listen 80;
    server_name 188.225.46.190;  # или ваш домен

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Активировать:
```bash
ln -s /etc/nginx/sites-available/vibe-dashboard /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

## Проверка

После деплоя проверьте:
- http://188.225.46.190:3000 - прямой доступ к Next.js
- http://188.225.46.190 - через Nginx (если настроен)

## Troubleshooting

### Проверить версию Node.js
```bash
ssh root@188.225.46.190 "node --version"
```

### Если Node.js не установлен или старая версия
```bash
ssh root@188.225.46.190
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs
```

### Если PM2 не установлен
```bash
ssh root@188.225.46.190 "npm install -g pm2"
```

### Проверить порт 3000
```bash
ssh root@188.225.46.190 "netstat -tlnp | grep 3000"
```

### Проверить логи ошибок
```bash
ssh root@188.225.46.190 "pm2 logs vibe-dashboard --err"
```
