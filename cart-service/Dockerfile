# ============================================ 
# Cart Service (Laravel Lumen) - Dockerfile 
# ============================================ 
FROM php:8.2-cli 

# System dependencies 
RUN apt-get update && apt-get install -y \ 
    git unzip zip libzip-dev libpng-dev libonig-dev libxml2-dev \ 
    && docker-php-ext-install pdo pdo_mysql \ 
    && rm -rf /var/lib/apt/lists/* 

# Install Composer 
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer 

# Working dir di dalam container 
WORKDIR /var/www 

# Copy composer.json and composer.lock 
COPY composer.json composer.lock ./ 

# Install dependencies 
RUN composer install --no-dev --no-scripts --no-autoloader 

# Copy the rest of the application files 
COPY . . 

# Run composer dump-autoload 
RUN composer dump-autoload --optimize 

# Expose port 
EXPOSE 8000 

# Jalankan Lumen dengan built-in server 
CMD ["php", "-S", "0.0.0.0:8000", "-t", "public"] 
