FROM php:8.2-cli

# install extension mysql
RUN docker-php-ext-install pdo pdo_mysql
RUN apt-get update && apt-get install -y \
    curl \
    unzip \
    && curl -sS https://getcomposer.org/installer | php \
    && mv composer.phar /usr/local/bin/composer

WORKDIR /var/www/html
