# Настройка проекта на новом компьютере

## 📋 Файлы, которые НЕ попадают в git (нужно перенести отдельно)

### 1. `.env` - переменные окружения
**Расположение**: корень проекта
**Содержимое**:
```env
SPREADSHEET_ID=1J9e3IjP42Bl29sJtVzzQ5LmbisnpERfT8Bb8IKLAGIo
GOOGLE_SHEETS_CREDENTIALS_PATH=./vibebot-credentials.json
PORT=3001
```

### 2. `vibebot-credentials.json` - Google Sheets API credentials
**Расположение**: корень проекта
**Размер**: ~2.3 KB
**Формат**: JSON файл с service account credentials

### 3. `node_modules/` - НЕ переносить! Установятся автоматически через npm install

## 🔐 Безопасный способ переноса credentials

### ⭐ Рекомендуемые варианты (по безопасности):

**1. Password Manager (самый безопасный)**
- 1Password: Secure Notes
- Bitwarden: Secure Notes
- Сохраните оба файла как secure notes

**2. Зашифрованный USB накопитель**
- Используйте USB с аппаратным шифрованием
- Или зашифруйте файлы перед копированием (VeraCrypt, 7-Zip с паролем)

**3. Безопасный мессенджер**
- Telegram: "Saved Messages" (только для себя)
- Signal: "Note to Self"
- Отправьте файлы самому себе, потом удалите после переноса

**4. Локальная сеть (если оба компьютера рядом)**
```bash
# На старом Mac (текущий компьютер)
cd /Users/pavelbrick/Work/Project/Vebi_Dash
tar -czf credentials-backup.tar.gz .env vibebot-credentials.json

# Перенести через AirDrop, локальную сеть или USB
```

### ❌ НЕ рекомендуется:
- ❌ Email (незашифрованный)
- ❌ Облачные диски общего доступа (Dropbox, Google Drive без шифрования)
- ❌ Публичные файлообменники
- ❌ Git репозиторий (уже защищен через .gitignore)

## 📝 Пошаговая инструкция на новом компьютере

### Шаг 1: Клонировать репозиторий
```bash
git clone https://github.com/utkabotron/vibe_dash.git
cd vibe_dash
```

### Шаг 2: Установить зависимости
```bash
npm install
```

### Шаг 3: Создать `.env` файл
```bash
# Вариант А: Скопировать готовый файл
# (если перенесли через безопасный канал)

# Вариант Б: Создать вручную
nano .env
# или
code .env
```

Содержимое `.env`:
```env
SPREADSHEET_ID=1J9e3IjP42Bl29sJtVzzQ5LmbisnpERfT8Bb8IKLAGIo
GOOGLE_SHEETS_CREDENTIALS_PATH=./vibebot-credentials.json
PORT=3001
```

### Шаг 4: Добавить credentials файл
```bash
# Скопируйте vibebot-credentials.json в корень проекта
# Убедитесь что файл называется именно vibebot-credentials.json
ls -la vibebot-credentials.json
```

### Шаг 5: Проверить что всё на месте
```bash
# Должны присутствовать:
ls -la .env vibebot-credentials.json

# Не должны быть в git (проверка):
git status
# Эти файлы НЕ должны показываться в списке изменений
```

### Шаг 6: Запустить сервер
```bash
npm start
```

### Шаг 7: Проверить работу
```bash
# В новом терминале
curl http://localhost:3001/api/health
curl http://localhost:3001/api/reports | head -20
```

### Шаг 8: Открыть дашборд
Откройте в браузере: **http://localhost:3001**

## ✅ Чеклист проверки

- [ ] Репозиторий склонирован
- [ ] `npm install` выполнен успешно
- [ ] Файл `.env` создан с правильными настройками
- [ ] Файл `vibebot-credentials.json` скопирован в корень
- [ ] Оба файла НЕ видны в `git status` (защищены .gitignore)
- [ ] Сервер запускается: `npm start`
- [ ] API отвечает: `curl http://localhost:3001/api/health`
- [ ] Дашборд открывается: http://localhost:3001
- [ ] Данные загружаются (1157+ записей)

## 🔧 Возможные проблемы

### Проблема: "GOOGLE_SHEETS_CREDENTIALS not configured"
**Решение**: Проверьте что `vibebot-credentials.json` существует и путь в `.env` правильный

### Проблема: "ENOENT: no such file or directory"
**Решение**: Убедитесь что путь в `.env` относительный: `./vibebot-credentials.json`

### Проблема: Port 3001 already in use
**Решение**:
```bash
# Найти и убить процесс
lsof -ti:3001 | xargs kill

# Или изменить порт в .env
PORT=3002
```

### Проблема: "Failed to fetch data" в браузере
**Решение**:
1. Проверить что API сервер запущен
2. Проверить логи в терминале
3. Проверить что credentials файл валидный JSON

## 📦 Быстрый бэкап текущих credentials (на этом компьютере)

```bash
# Создать зашифрованный архив
cd /Users/pavelbrick/Work/Project/Vebi_Dash
tar -czf - .env vibebot-credentials.json | \
  openssl enc -aes-256-cbc -salt -out credentials-backup-encrypted.tar.gz

# Запомните пароль! Без него не расшифруете

# Расшифровка на новом компьютере:
openssl enc -d -aes-256-cbc -in credentials-backup-encrypted.tar.gz | \
  tar -xzf -
```

## 🌐 Альтернатива: Использовать переменные окружения напрямую

Если не хотите копировать файлы, можно использовать inline credentials:

1. Прочитать содержимое credentials файла:
```bash
cat vibebot-credentials.json | tr -d '\n'
```

2. Скопировать весь JSON (одна строка)

3. В `.env` на новом компьютере использовать:
```env
SPREADSHEET_ID=1J9e3IjP42Bl29sJtVzzQ5LmbisnpERfT8Bb8IKLAGIo
GOOGLE_SHEETS_CREDENTIALS={"type":"service_account",...весь JSON...}
PORT=3001
```

**Минус**: Менее удобно редактировать, длинная строка

## 📞 Нужна помощь?

Если что-то не работает:
1. Проверьте логи в терминале где запущен `npm start`
2. Откройте DevTools Console в браузере (F12)
3. Проверьте что credentials файл валидный: `cat vibebot-credentials.json | python3 -m json.tool`

---

**Автор**: Pavel Brick <pavelbrick@gmail.com>
**Проект**: Vibe Analytics Dashboard v2.0
