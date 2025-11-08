#gunakan image resmi dari php + composer

FROM php:8.2-cli

#install dependensi yang dibutuhkan (git, unzip, libpq-dev, dll)

RUN apt-get update && apt-get install -y \
    git \
    unzip \
    zip \
    libpq-dev \
    && docker-php-ext-install pdo pdo_mysql \
    && rm -rf /var/lib/apt/lists/*

#install composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

#set working directory
WORKDIR /var/www

# -------------------------------------------------
# 1) Buat project Lumen ke folder /var/www/src
#    (akan skip jika sudah ada composer.json di /var/www/src)
# -------------------------------------------------
# Salin file "penanda" supaya layer cache stabil
COPY composer.json /var/www/composer.bootstrap.json
RUN if [ ! -f /var/www/src/composer.json ]; then \
      composer create-project --prefer-dist laravel/lumen:^10.0 src ; \
    fi

# -------------------------------------------------
# 2) Salin file yang kita override (env & routes)
# -------------------------------------------------
# .env untuk Lumen (akan ditempatkan di /var/www/src/.env)
COPY .env /var/www/src/.env

# Pastikan direktori routes ada (harus ada dari Lumen)
# Lalu timpa web.php dengan punya kita
COPY src/routes/web.php /var/www/src/routes/web.php

# Permissions (opsional)
RUN chown -R www-data:www-data /var/www/src

#expose port 8000
EXPOSE 8000

#jalankan aplikasi lumen
CMD ["php", "-S", "0.0.0.0:8000", "-t", "public"]