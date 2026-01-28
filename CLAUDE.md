# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Проект

**Vibe Analytics Dashboard v2.0** - одностраничный дашборд аналитики процессов для Vibe Super Bot на основе данных из Google Sheets. Переписан на чистый HTML/CSS/JavaScript без фреймворков.

## Основные команды

### Установка зависимостей
```bash
npm install
```

### Запуск сервера
```bash
npm start            # Запуск API сервера на localhost:3001
npm run dev          # То же самое (alias)
```

### Деплой на production сервер
```bash
# Через PM2
pm2 start api-server.js --name vibe-dashboard
pm2 status
pm2 logs vibe-dashboard
pm2 restart vibe-dashboard
pm2 stop vibe-dashboard
```

## Технологический стек

- **Backend**: Node.js + Express.js (API proxy)
- **Frontend**: Vanilla JavaScript (ES6+), HTML5, CSS3
- **Charts**: ApexCharts (CDN)
- **Data source**: Google Sheets API v4 (googleapis 164.1.0)
- **Стиль**: Custom CSS с CSS Grid и Flexbox (без фреймворков)

## Архитектура проекта

### Структура директорий
```
Vebi_Dash/
├── public/                    # Статические файлы фронтенда
│   ├── index.html            # Главная страница (SPA)
│   ├── css/
│   │   └── styles.css        # Все стили приложения
│   └── js/
│       ├── api.js            # Модуль работы с API
│       ├── metrics.js        # Расчет бизнес-метрик
│       ├── charts.js         # Инициализация ApexCharts
│       └── app.js            # Главный файл приложения
├── api-server.js             # Express API proxy для Google Sheets
├── package.json              # Зависимости (только backend)
├── .env                      # Конфигурация (не коммитить!)
├── .env.example              # Пример конфигурации
└── CLAUDE.md                 # Этот файл
```

### Источник данных

Google Sheets: https://docs.google.com/spreadsheets/d/1J9e3IjP42Bl29sJtVzzQ5LmbisnpERfT8Bb8IKLAGIo

**Лист**: Reports

**Структура данных**:
- timestamp - дата/время записи
- employee_name - имя сотрудника
- project_name - название проекта
- product_id - ID изделия
- category - категория операции
- subcategory - подкатегория
- category_name - название операции
- quantity - количество часов
- unit - единица измерения
- comment - комментарий (используется для определения переделок)

### Ключевые бизнес-метрики

Дашборд реализует 4 ключевые метрики из `metric.md`:

**1. Burn Rate (Скорость выгорания бюджета/часов)**
- Формула: Часы факт / Часы план по проекту
- Отображается: Bar chart с разбивкой по проектам
- Статус: Зелёный (<90%), Жёлтый (90-110%), Красный (>110%)

**2. Quality Rate (Коэффициент переделок)**
- Формула: (Часы с тегом "переделка" / Общие часы) * 100%
- Цель: < 5%
- Определение: Поиск слова "переделка" в полях `comment` или `category_name`
- Отображается: KPI карточка + Line chart (тренд по месяцам)

**3. Overhead Ratio (Коэффициент накладных расходов)**
- Формула: (Часы на проект "ПРОЧЕЕ" / Общие часы) * 100%
- Определение: Проект содержит слова "прочее" или "55" в названии
- Отображается: KPI карточка + Area chart (тренд по месяцам)

**4. Load Balance (Пульс сотрудников)**
- Показывает: Топ-3 сотрудника по часам и Топ-3 с конца
- Цель: Выявить перегруженных лидеров и аутсайдеров
- Отображается: Horizontal bar chart

**Дополнительные метрики**:
- Всего часов за период
- Количество активных проектов
- Количество активных сотрудников

### Фильтрация данных

**Фильтры**:
- Проект (dropdown со всеми проектами)
- Период: дата "с" и "по" (по умолчанию: последние 30 дней)
- Кнопка "Сбросить фильтры"

Фильтры применяются ко всем метрикам и графикам одновременно.

### Кэширование

Данные из Google Sheets кэшируются в памяти API сервера на **10 минут** для оптимизации производительности и снижения количества API запросов.

### API Endpoints

**GET /api/reports** - получить все записи из листа Reports
**GET /api/projects** - получить список уникальных проектов
**GET /api/health** - проверка здоровья сервера и статуса кэша

## Настройка окружения

### Быстрый старт

1. **Установить зависимости**:
```bash
npm install
```

2. **Настроить переменные окружения**:

Создать файл `.env` на основе `.env.example`:
```env
SPREADSHEET_ID=1J9e3IjP42Bl29sJtVzzQ5LmbisnpERfT8Bb8IKLAGIo
GOOGLE_SHEETS_CREDENTIALS={"type":"service_account",...полный JSON...}
PORT=3001
```

Или использовать путь к файлу credentials:
```env
SPREADSHEET_ID=1J9e3IjP42Bl29sJtVzzQ5LmbisnpERfT8Bb8IKLAGIo
GOOGLE_SHEETS_CREDENTIALS_PATH=/path/to/credentials.json
PORT=3001
```

3. **Запустить сервер**:
```bash
npm start
```

4. **Открыть в браузере**: http://localhost:3001

### Production деплой

**Вариант 1: Простой запуск**
```bash
# На сервере
cd /root/Hosting_bot/dashboard
npm install --production
npm start
```

**Вариант 2: Через PM2 (рекомендуется)**
```bash
# На сервере
cd /root/Hosting_bot/dashboard
npm install --production

# Запуск
pm2 start api-server.js --name vibe-dashboard

# Автозапуск при перезагрузке
pm2 startup
pm2 save
```

**Обновление на production**:
```bash
# С локальной машины через SSH
ssh root@176.57.214.150 "cd /root/Hosting_bot/dashboard && git pull && npm install && pm2 restart vibe-dashboard"
```

## Git workflow

**ВАЖНО**: Все коммиты должны быть от `pavelbrick@gmail.com`

При создании коммитов использовать:
```bash
git config user.email "pavelbrick@gmail.com"
```

## Требования к серверу

- Node.js 18.x или выше
- npm 9.x или выше
- Минимум 256 MB RAM (приложение очень легкое)
- 500 MB свободного места на диске
- Порт: 3001 (по умолчанию, настраивается через .env)

## Особенности архитектуры

### Frontend (Vanilla JS)
- Модульная структура: каждый JS файл отвечает за свою область
- **api.js** - абстракция для всех API запросов
- **metrics.js** - бизнес-логика расчета метрик (чистые функции)
- **charts.js** - инициализация и обновление ApexCharts
- **app.js** - координация всех модулей, управление состоянием

### Backend (Express)
- Минималистичный API proxy с 3 endpoints
- Кэширование в памяти (простой объект с timestamp)
- Graceful shutdown для корректной остановки
- CORS enabled для локальной разработки

### Отсутствие build процесса
- Не требуется сборка или транспиляция
- Статические файлы отдаются напрямую из `public/`
- ApexCharts подключается через CDN
- Мгновенный запуск и развертывание

## Добавление новых метрик

Для добавления новой метрики:

1. **Добавить расчет в `metrics.js`**:
```javascript
calculateNewMetric(records) {
    // Логика расчета
    return result;
}
```

2. **Добавить в `calculateKPIs()`**:
```javascript
newMetric: this.calculateNewMetric(records)
```

3. **Добавить HTML в `index.html`** (KPI карточка или график)

4. **Обновить UI в `app.js`** метод `updateKPICards()` или вызвать `Charts.initNewChart()`

## Диагностика проблем

### Проблема: "Failed to fetch data"
- Проверить что API сервер запущен: `curl http://localhost:3001/api/health`
- Проверить `.env` файл и Google Sheets credentials
- Проверить логи: `pm2 logs vibe-dashboard` или консоль сервера

### Проблема: Пустые графики
- Открыть DevTools Console и проверить ошибки JavaScript
- Проверить что данные загружаются: `console.log(App.data.raw)` в браузере
- Проверить фильтры - возможно они слишком строгие

### Проблема: Slow performance
- Увеличить CACHE_DURATION в `api-server.js`
- Проверить размер данных в Google Sheets
- Рассмотреть серверный pre-processing метрик

## Логирование изменений

**2026-01-28** - Переписан проект на чистый HTML/CSS/JS:
- Удалены зависимости: Next.js, React, TypeScript, Tailwind, shadcn/ui
- Создан Express API proxy для Google Sheets
- Реализованы 4 ключевые бизнес-метрики из metric.md:
  - Burn Rate (факт/план по проектам)
  - Quality Rate (% переделок)
  - Overhead Ratio (% времени на "ПРОЧЕЕ")
  - Load Balance (топ-6 сотрудников)
- Интегрирован ApexCharts для визуализации
- Добавлены тренды по месяцам для Quality и Overhead
- Оптимизация только для десктопа (по требованию)