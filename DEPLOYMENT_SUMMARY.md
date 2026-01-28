# Саммари деплоя Dashboard - 4 ноября 2025

## Задача
Деплой Next.js dashboard приложения на удаленный сервер с доменом vibe.brdg.tools

## Выполненные шаги

### 1. Подготовка к деплою
- ✅ Созданы deployment скрипты (`deploy.sh`, `check-server.sh`, `ecosystem.config.js`, `DEPLOYMENT.md`)
- ✅ Настроен `.env.production` с переменными окружения
- ✅ Проверена готовность сервера (Node.js, PM2, Nginx)

### 2. Загрузка проекта на сервер
- ✅ Создан бэкап старого проекта
- ✅ Загружены файлы проекта через SCP (tar архив)
- ✅ Загружен credentials файл `vibebot-464607-8d0d17c22710.json`
- ✅ Установлены зависимости (`npm install`)

### 3. Решение проблем со сборкой
**Проблема:** Недостаточно памяти для сборки Next.js 16 с Turbopack

**Решение:**
- ✅ Создан swap файл 2GB на сервере
  ```bash
  sudo fallocate -l 2G /swapfile
  sudo chmod 600 /swapfile
  sudo mkswap /swapfile
  sudo swapon /swapfile
  echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
  ```
- ✅ Обновлен Node.js с 18.20.8 до 20.19.5
- ✅ Сборка выполнена локально и загружена на сервер

### 4. Настройка Nginx и домена
- ✅ Обновлен существующий конфиг Nginx для домена vibe.brdg.tools
- ✅ Настроен SSL (сертификат уже был)
- ✅ Настроен reverse proxy на порт 3000

**Конфигурация Nginx:**
```nginx
server {
    listen 80;
    server_name vibe.brdg.tools;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name vibe.brdg.tools;

    ssl_certificate /etc/letsencrypt/live/vibe.brdg.tools/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/vibe.brdg.tools/privkey.pem;

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

### 5. Решение проблем с Google Sheets API
**Проблема:** Credentials не читались в production режиме

**Решение:**
- ✅ Исправлен код в `src/lib/sheets.ts` для чтения credentials из файла
- ✅ Добавлена поддержка переменной `GOOGLE_SHEETS_CREDENTIALS_PATH`
- ✅ Обновлен `SPREADSHEET_ID` на правильный: `1J9e3IjP42Bl29sJtVzzQ5LmbisnpERfT8Bb8IKLAGIo`
- ✅ Настроен `ecosystem.config.js` с правильными переменными окружения

**Изменения в коде:**
```typescript
// src/lib/sheets.ts
export async function getGoogleSheetsClient() {
  let credentials;
  
  // Попробовать прочитать из файла
  const credentialsPath = process.env.GOOGLE_SHEETS_CREDENTIALS_PATH;
  if (credentialsPath && fs.existsSync(credentialsPath)) {
    const credentialsFile = fs.readFileSync(credentialsPath, 'utf-8');
    credentials = JSON.parse(credentialsFile);
  } else if (process.env.GOOGLE_SHEETS_CREDENTIALS) {
    // Fallback на переменную окружения
    credentials = JSON.parse(process.env.GOOGLE_SHEETS_CREDENTIALS);
  } else {
    throw new Error('Google Sheets credentials not found');
  }

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });

  const sheets = google.sheets({ version: 'v4', auth });
  return sheets;
}
```

**PM2 конфигурация:**
```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'vibe-dashboard',
    script: 'node_modules/next/dist/bin/next',
    args: 'start',
    cwd: '/root/Hosting_bot/dashboard',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      GOOGLE_SHEETS_CREDENTIALS_PATH: '/root/Hosting_bot/dashboard/vibebot-464607-8d0d17c22710.json',
      SPREADSHEET_ID: '1J9e3IjP42Bl29sJtVzzQ5LmbisnpERfT8Bb8IKLAGIo'
    }
  }]
}
```

### 6. Запуск приложения
- ✅ Приложение запущено через PM2
- ✅ Настроен автозапуск при перезагрузке сервера (`pm2 save`)
- ✅ Dashboard доступен по адресу: **https://vibe.brdg.tools**

### 7. UI изменения
- ✅ Добавлен фон `rgb(254, 254, 254)` для страницы dashboard

## Текущий статус
✅ **Деплой завершен успешно!**

**Приложение работает на:**
- **URL:** https://vibe.brdg.tools
- **Сервер:** 188.225.46.190 (root@5397775-nk29730)
- **Порт:** 3000 (внутренний)
- **PM2 процесс:** vibe-dashboard
- **Директория:** `/root/Hosting_bot/dashboard`

## Ключевые файлы на сервере

```
/root/Hosting_bot/dashboard/
├── src/                                    # Исходный код
├── .next/                                  # Собранное приложение
├── node_modules/                           # Зависимости
├── vibebot-464607-8d0d17c22710.json       # Google Sheets credentials
├── ecosystem.config.js                     # PM2 конфигурация
├── .env.local                              # Локальные переменные окружения
├── .env.production                         # Production переменные
└── package.json                            # Зависимости проекта

/etc/nginx/sites-available/vibe.brdg.tools  # Nginx конфигурация
/etc/letsencrypt/live/vibe.brdg.tools/      # SSL сертификаты
```

## Команды для управления

### PM2 команды
```bash
# Статус всех процессов
pm2 status

# Логи приложения
pm2 logs vibe-dashboard
pm2 logs vibe-dashboard --lines 50

# Перезапуск
pm2 restart vibe-dashboard

# Остановка
pm2 stop vibe-dashboard

# Запуск
pm2 start ecosystem.config.js

# Сохранить конфигурацию
pm2 save

# Посмотреть переменные окружения
pm2 env vibe-dashboard
```

### Nginx команды
```bash
# Проверить конфигурацию
nginx -t

# Перезагрузить конфигурацию
systemctl reload nginx

# Перезапустить Nginx
systemctl restart nginx

# Статус Nginx
systemctl status nginx

# Логи Nginx
tail -f /var/log/nginx/error.log
tail -f /var/log/nginx/access.log
```

### Обновление приложения

**Вариант 1: Сборка локально (рекомендуется)**
```bash
# На локальном компьютере
cd /c/PK/Projects/VIBE/dashboard
npm run build
tar -czf next-build.tar.gz .next
scp next-build.tar.gz root@188.225.46.190:/root/Hosting_bot/dashboard/

# На сервере
ssh root@188.225.46.190
cd /root/Hosting_bot/dashboard
rm -rf .next
tar -xzf next-build.tar.gz
pm2 restart vibe-dashboard
```

**Вариант 2: Сборка на сервере**
```bash
# На сервере
cd /root/Hosting_bot/dashboard
export NODE_OPTIONS="--max-old-space-size=1536"
npm run build
pm2 restart vibe-dashboard
```

## Технические детали

### Стек технологий
- **Framework:** Next.js 16.0.1 (с Turbopack)
- **Runtime:** Node.js 20.19.5
- **Package Manager:** npm
- **Process Manager:** PM2
- **Web Server:** Nginx
- **SSL:** Let's Encrypt
- **API:** Google Sheets API v4

### Системные требования
- **RAM:** Минимум 1GB (рекомендуется 2GB + swap)
- **Node.js:** >= 20.9.0
- **Disk Space:** ~500MB для проекта + node_modules

### Переменные окружения
```bash
NODE_ENV=production
PORT=3000
GOOGLE_SHEETS_CREDENTIALS_PATH=/root/Hosting_bot/dashboard/vibebot-464607-8d0d17c22710.json
SPREADSHEET_ID=1J9e3IjP42Bl29sJtVzzQ5LmbisnpERfT8Bb8IKLAGIo
```

## Проблемы и их решения

### 1. Недостаточно памяти для сборки
**Симптом:** `FATAL ERROR: Ineffective mark-compacts near heap limit`

**Решение:**
- Создан swap файл 2GB
- Увеличен лимит памяти Node.js: `NODE_OPTIONS="--max-old-space-size=1536"`
- Сборка выполняется локально и загружается на сервер

### 2. Credentials не читаются
**Симптом:** `The incoming JSON object does not contain a client_email field`

**Решение:**
- Изменен код для чтения credentials из файла вместо переменной окружения
- Добавлена поддержка `GOOGLE_SHEETS_CREDENTIALS_PATH`

### 3. Таблица не найдена
**Симптом:** `Requested entity was not found (404)`

**Решение:**
- Обновлен SPREADSHEET_ID на правильный
- Проверен доступ service account к таблице

### 4. Конфликт Nginx конфигураций
**Симптом:** `conflicting server name "vibe.brdg.tools"`

**Решение:**
- Удален дублирующий конфиг
- Обновлен существующий конфиг с SSL

## Контакты и доступы

**Сервер:**
- IP: 188.225.46.190
- User: root
- Port: 22

**Google Service Account:**
- Email: vibebot@vibebot-464607.iam.gserviceaccount.com
- Project: vibebot-464607

**Домен:**
- URL: https://vibe.brdg.tools
- DNS: A запись на 188.225.46.190

## Следующие шаги (опционально)

- [ ] Настроить мониторинг (Uptime Robot, Grafana)
- [ ] Настроить автоматический деплой через CI/CD
- [ ] Добавить логирование в файлы
- [ ] Настроить ротацию логов
- [ ] Добавить health check endpoint
- [ ] Настроить backup базы данных (если будет)

---

**Дата деплоя:** 4 ноября 2025  
**Статус:** ✅ Успешно развернуто и работает
