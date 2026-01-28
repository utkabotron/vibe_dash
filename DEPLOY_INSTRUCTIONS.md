# Инструкция по деплою Dashboard на сервер

## Подготовка архива для деплоя

### 1. Файлы для включения в архив:
- `package.json`
- `package-lock.json`
- `next.config.ts`
- `tsconfig.json`
- `tailwind.config.ts`
- `postcss.config.mjs`
- `.env.production` (создать на основе .env.local)
- `src/` (вся папка)
- `public/` (если есть)

### 2. Файлы НЕ включать:
- `node_modules/`
- `.next/`
- `.git/`
- `.env.local`

## Создание архива (Windows PowerShell)

```powershell
# Перейти в папку проекта
cd C:\PK\Projects\VIBE\dashboard

# Создать архив (исключая ненужные папки)
Compress-Archive -Path src,public,package.json,package-lock.json,next.config.ts,tsconfig.json,tailwind.config.ts,postcss.config.mjs,.env.production -DestinationPath dashboard-deploy.zip -Force
```

## Настройка на сервере

### 1. Распаковать архив на сервере
```bash
unzip dashboard-deploy.zip -d /var/www/dashboard
cd /var/www/dashboard
```

### 2. Установить зависимости
```bash
npm ci --production=false
```

### 3. Настроить переменные окружения
Создать файл `.env.production` со следующими переменными:

```env
# Google Sheets API
SPREADSHEET_ID=1BpWM5pklVGTaEhqLKGDOQqJPnZKZy0jSvxSE7aqKMYs
GOOGLE_SHEETS_CREDENTIALS_PATH=/path/to/credentials.json

# Или использовать переменную с JSON
GOOGLE_SHEETS_CREDENTIALS='{"type":"service_account",...}'
```

### 4. Собрать production build
```bash
npm run build
```

### 5. Запустить приложение

#### Вариант A: Через PM2 (рекомендуется)
```bash
# Установить PM2 глобально (если еще не установлен)
npm install -g pm2

# Запустить приложение
pm2 start npm --name "vibe-dashboard" -- start

# Сохранить конфигурацию PM2
pm2 save

# Настроить автозапуск
pm2 startup
```

#### Вариант B: Через systemd
Создать файл `/etc/systemd/system/vibe-dashboard.service`:

```ini
[Unit]
Description=Vibe Analytics Dashboard
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/dashboard
ExecStart=/usr/bin/npm start
Restart=on-failure
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

Затем:
```bash
sudo systemctl daemon-reload
sudo systemctl enable vibe-dashboard
sudo systemctl start vibe-dashboard
```

### 6. Настроить Nginx (опционально)

Создать файл `/etc/nginx/sites-available/dashboard`:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Активировать:
```bash
sudo ln -s /etc/nginx/sites-available/dashboard /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## Обновление приложения

1. Создать новый архив с обновленным кодом
2. Загрузить на сервер
3. Остановить приложение:
   ```bash
   pm2 stop vibe-dashboard
   # или
   sudo systemctl stop vibe-dashboard
   ```
4. Распаковать новый архив
5. Установить зависимости (если изменились):
   ```bash
   npm ci --production=false
   ```
6. Пересобрать:
   ```bash
   npm run build
   ```
7. Запустить:
   ```bash
   pm2 start vibe-dashboard
   # или
   sudo systemctl start vibe-dashboard
   ```

## Проверка работы

```bash
# Проверить статус PM2
pm2 status

# Посмотреть логи
pm2 logs vibe-dashboard

# Или для systemd
sudo systemctl status vibe-dashboard
sudo journalctl -u vibe-dashboard -f
```

## Требования к серверу

- Node.js 18.x или выше
- npm 9.x или выше
- 512 MB RAM минимум (рекомендуется 1 GB)
- 1 GB свободного места на диске

## Порты

По умолчанию приложение запускается на порту **3000**.
Можно изменить через переменную окружения `PORT`.
