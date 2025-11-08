# Gemini Project Context: E-commerce Microservices

## Project Overview

This project is an e-commerce application built with a microservices architecture. The services are intended to be containerized using Docker, although the Docker configuration is not yet complete.

The project consists of the following services:

*   `product-service`: Manages product information. This is a Node.js/Express.js application.
*   `cart-service`: Manages the shopping cart.
*   `review-service`: Manages product reviews.
*   `user-service`: Manages user accounts.

### `product-service`

The `product-service` provides the following API endpoints:

*   `GET /products`: Returns a list of all products.
*   `GET /products/:id`: Returns the details of a specific product by its ID.

## Building and Running

The `docker-compose.yml` file is currently empty. Once the services are defined in the `docker-compose.yml` file, the application can be started with:

```bash
docker-compose up
```

### Running Individual Services

To run the `product-service` individually:

```bash
cd product-service
npm install
npm start
```

The service will be available at `http://localhost:3000`.

## Development Conventions

**TODO:** This section should be updated with information about the project's coding style, testing practices, and contribution guidelines.