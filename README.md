# Vibe Analytics Dashboard v2.0

Одностраничный дашборд аналитики процессов для Vibe Super Bot на основе данных из Google Sheets.

**Переписан на чистый HTML/CSS/JavaScript** - без Next.js, React, TypeScript и других фреймворков.

## Ключевые бизнес-метрики

- 🔥 **Burn Rate** - скорость выгорания бюджета (факт/план по проектам)
- ✅ **Quality Rate** - коэффициент переделок (цель < 5%)
- 📊 **Overhead Ratio** - накладные расходы (время на "ПРОЧЕЕ")
- ⚖️ **Load Balance** - пульс сотрудников (топ-3 и аутсайдеры)

## Технологии

- **Frontend**: Vanilla JavaScript (ES6+), HTML5, CSS3
- **Backend**: Node.js + Express.js (API proxy)
- **Charts**: ApexCharts
- **Data source**: Google Sheets API v4

## Быстрый старт

### 1. Установка зависимостей

```bash
npm install
```

### 2. Настройка переменных окружения

Создайте файл `.env` на основе `.env.example`:

```bash
cp .env.example .env
```

Отредактируйте `.env` и добавьте ваши Google Sheets credentials:

```env
SPREADSHEET_ID=1J9e3IjP42Bl29sJtVzzQ5LmbisnpERfT8Bb8IKLAGIo
GOOGLE_SHEETS_CREDENTIALS={"type":"service_account",...}
PORT=3001
```

### 3. Запуск

```bash
npm start
```

Откройте в браузере: [http://localhost:3001](http://localhost:3001)

## Структура проекта

```
Vebi_Dash/
├── public/              # Фронтенд (статика)
│   ├── index.html      # SPA
│   ├── css/
│   │   └── styles.css
│   └── js/
│       ├── api.js      # API клиент
│       ├── metrics.js  # Расчет метрик
│       ├── charts.js   # ApexCharts
│       └── app.js      # Главный файл
├── api-server.js       # Express API proxy
└── package.json
```

## Источник данных

Google Sheets: [Vibe Super Bot Reports](https://docs.google.com/spreadsheets/d/1J9e3IjP42Bl29sJtVzzQ5LmbisnpERfT8Bb8IKLAGIo)

**Лист**: Reports

## Production деплой

```bash
# На сервере
npm install --production
pm2 start api-server.js --name vibe-dashboard
pm2 save
```

Подробнее см. [CLAUDE.md](./CLAUDE.md)
