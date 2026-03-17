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

# Storage & permissions
RUN chmod -R 775 storage bootstrap/cache database \
    && chown -R www-data:www-data /app

# Copy startup script
COPY start.sh /start.sh
RUN chmod +x /start.sh

# Render sets PORT dynamically — expose it
EXPOSE ${PORT:-80}

CMD ["/start.sh"]
