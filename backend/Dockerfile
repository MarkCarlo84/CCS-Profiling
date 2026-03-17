FROM php:8.2-fpm

# Install system dependencies + SQLite + nginx
RUN apt-get update && apt-get install -y \
    git curl zip unzip libzip-dev libonig-dev libxml2-dev \
    libsqlite3-dev sqlite3 nginx \
    && docker-php-ext-install pdo pdo_mysql pdo_sqlite mbstring zip bcmath \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /app

COPY composer.json composer.lock ./
RUN composer install --no-dev --optimize-autoloader --no-scripts

COPY . .

# Create SQLite database file
RUN mkdir -p database && touch database/database.sqlite

# Storage permissions
RUN chmod -R 775 storage bootstrap/cache database \
    && chown -R www-data:www-data storage bootstrap/cache database

# Nginx config
RUN echo 'server { \n\
    listen 80; \n\
    root /app/public; \n\
    index index.php; \n\
    location / { try_files $uri $uri/ /index.php?$query_string; } \n\
    location ~ \.php$ { \n\
        fastcgi_pass 127.0.0.1:9000; \n\
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name; \n\
        include fastcgi_params; \n\
    } \n\
}' > /etc/nginx/sites-available/default

EXPOSE 80

CMD php artisan config:clear \
    && php artisan migrate --force \
    && php artisan db:seed --force \
    && php-fpm -D \
    && nginx -g "daemon off;"
