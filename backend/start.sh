#!/bin/sh
set -e

APP_PORT=${PORT:-80}
# Use file cache for better performance in production
export CACHE_STORE=file

echo "==> Starting on port $APP_PORT"

# Write nginx config with dynamic port
cat > /etc/nginx/sites-available/default <<EOF
server {
    listen ${APP_PORT};
    root /app/public;
    index index.php;
    charset utf-8;

    location / {
        try_files \$uri \$uri/ /index.php?\$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass 127.0.0.1:9000;
        fastcgi_param SCRIPT_FILENAME \$realpath_root\$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }
}
EOF

echo "==> Starting php-fpm..."
php-fpm -D

echo "==> Starting nginx on port $APP_PORT (background)..."
nginx -g "daemon off;" &

echo "==> Running migrations..."
php artisan migrate --force

echo "==> Clearing and caching config..."
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan config:cache
php artisan route:cache

echo "==> Warming up application caches..."
php artisan cache:warmup

echo "==> Seeding database..."
if php artisan db:seed --force --class=DatabaseSeeder --verbose; then
    echo "==> Database seeding completed successfully"
else
    SEED_EXIT_CODE=$?
    echo "==> Database seeding failed with exit code $SEED_EXIT_CODE"
    echo "==> This is not critical for deployment, continuing..."
fi

echo "==> App ready. Keeping nginx in foreground..."
wait
