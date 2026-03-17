#!/bin/sh
set -e

echo "==> Clearing config..."
php artisan config:clear

echo "==> Running migrations..."
php artisan migrate --force

echo "==> Seeding database..."
php artisan db:seed --force

echo "==> Starting php-fpm..."
php-fpm -D

echo "==> Starting nginx..."
exec nginx -g "daemon off;"
