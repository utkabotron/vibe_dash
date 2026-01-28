#!/bin/bash

# Скрипт для создания зашифрованного бэкапа credentials файлов
# Использование: ./backup-credentials.sh

set -e

echo "🔐 Создание зашифрованного бэкапа credentials..."
echo ""

# Проверка наличия файлов
if [ ! -f .env ]; then
    echo "❌ Ошибка: файл .env не найден!"
    exit 1
fi

if [ ! -f vibebot-credentials.json ]; then
    echo "❌ Ошибка: файл vibebot-credentials.json не найден!"
    exit 1
fi

# Имя выходного файла с датой
BACKUP_FILE="credentials-backup-$(date +%Y%m%d-%H%M%S).tar.gz.enc"

echo "📦 Упаковка файлов..."
echo "   - .env"
echo "   - vibebot-credentials.json"
echo ""

# Создание зашифрованного архива
tar -czf - .env vibebot-credentials.json | \
    openssl enc -aes-256-cbc -salt -pbkdf2 -out "$BACKUP_FILE"

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Бэкап создан: $BACKUP_FILE"
    echo "📊 Размер: $(du -h "$BACKUP_FILE" | cut -f1)"
    echo ""
    echo "⚠️  ВАЖНО: Запомните пароль! Без него файл не расшифровать."
    echo ""
    echo "📋 Для восстановления на другом компьютере:"
    echo "   openssl enc -d -aes-256-cbc -pbkdf2 -in $BACKUP_FILE | tar -xzf -"
    echo ""
else
    echo ""
    echo "❌ Ошибка при создании бэкапа!"
    exit 1
fi
