FROM php:8.2-fpm

# Install system dependencies + PostgreSQL + nginx
RUN apt-get update && apt-get install -y \
    git curl zip unzip libzip-dev libonig-dev libxml2-dev \
    libpq-dev nginx \
    && docker-php-ext-install pdo pdo_pgsql pdo_mysql mbstring zip bcmath \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /app

COPY composer.json composer.lock ./
RUN composer install --no-dev --optimize-autoloader --no-scripts

COPY . .

# Storage & permissions
RUN chmod -R 775 storage bootstrap/cache \
    && chown -R www-data:www-data /app

# Copy startup script
COPY start.sh /start.sh
RUN chmod +x /start.sh

EXPOSE ${PORT:-80}

CMD ["/start.sh"]
