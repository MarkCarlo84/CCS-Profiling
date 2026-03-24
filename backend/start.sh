#!/bin/sh
set -e

APP_PORT=${PORT:-80}

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

echo "==> Clearing config..."
php artisan config:clear

echo "==> Running migrations..."
php artisan migrate --force

echo "==> Seeding database..."
php artisan db:seed --force --class=DatabaseSeeder 2>/dev/null || true

echo "==> Starting php-fpm..."
php-fpm -D

echo "==> Starting nginx on port $APP_PORT..."
exec nginx -g "daemon off;"
