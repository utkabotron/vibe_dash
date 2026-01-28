# Быстрый деплой обновления

## Шаг 1: Архив готов
✅ Файл `dashboard-source.zip` создан в `C:\PK\Projects\VIBE\dashboard\`

## Шаг 2: Загрузить на сервер

### Вариант A: Через WinSCP или FileZilla
1. Подключиться к серверу:
   - Host: `188.225.46.190`
   - User: `root`
   - Port: `22`

2. Загрузить файл `dashboard-source.zip` в `/root/Hosting_bot/`

### Вариант B: Через SCP (если есть SSH ключ)
```bash
scp dashboard-source.zip root@188.225.46.190:/root/Hosting_bot/
```

## Шаг 3: На сервере выполнить

```bash
# Подключиться к серверу
ssh root@188.225.46.190

# Перейти в директорию
cd /root/Hosting_bot

# Создать бэкап (опционально)
cp -r dashboard dashboard_backup_$(date +%Y%m%d_%H%M%S)

# Распаковать новые файлы
cd dashboard
unzip -o ../dashboard-source.zip

# Установить зависимости (если изменились)
npm install

# Собрать проект
export NODE_OPTIONS="--max-old-space-size=1536"
npm run build

# Перезапустить приложение
pm2 restart vibe-dashboard

# Проверить статус
pm2 status
pm2 logs vibe-dashboard --lines 50
```

## Шаг 4: Проверить работу
Открыть в браузере: https://vibe.brdg.tools

## Если что-то пошло не так

### Откатиться на предыдущую версию
```bash
cd /root/Hosting_bot
pm2 stop vibe-dashboard
rm -rf dashboard
mv dashboard_backup_YYYYMMDD_HHMMSS dashboard
cd dashboard
pm2 start ecosystem.config.js
```

### Посмотреть логи ошибок
```bash
pm2 logs vibe-dashboard --err
```

### Проверить переменные окружения
```bash
pm2 env vibe-dashboard
```

## Что было обновлено
- Исправлен парсинг дат (формат dd-MM-yy)
- Уменьшен размер шрифта в таблицах
- Сделаны темнее разделители в таблицах
- Добавлена подсветка строк при наведении
- Удалены таблицы "Детализация по проектам" и "Детализация по сотрудникам"
- Удален столбец "Количество" из таблицы изделий
- Уменьшено пустое пространство слева в графиках
- Добавлено логирование для отладки расхождения в суммах часов
