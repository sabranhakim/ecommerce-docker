<?php

use GuzzleHttp\Client;

$router->get('/', function () use ($router) {
    return $router->app->version();
});

$router->group(['prefix' => 'cart'], function () use ($router) {
    $client = new Client([
        'base_uri' => 'http://product-service:3000',
    ]);

    // Get cart contents
    $router->get('/{userId}', function ($userId) use ($client) {
        session_start();
        $cart = isset($_SESSION['cart'][$userId]) ? $_SESSION['cart'][$userId] : [];

        $detailedCart = [];
        $total = 0;

        foreach ($cart as $item) {
            try {
                $response = $client->get('/products/' . $item['product_id']);
                $product = json_decode($response->getBody()->getContents(), true);
                $detailedCart[] = [
                    'product' => $product,
                    'quantity' => $item['quantity'],
                ];
                $total += $product['price'] * $item['quantity'];
            } catch (\GuzzleHttp\Exception\ClientException $e) {
                // Product not found, remove from cart
                $productKey = array_search($item['product_id'], array_column($_SESSION['cart'][$userId], 'product_id'));
                if ($productKey !== false) {
                    array_splice($_SESSION['cart'][$userId], $productKey, 1);
                }
            }
        }

        return response()->json([
            'items' => $detailedCart,
            'total' => $total,
        ]);
    });

    // Add item to cart
    $router->post('/{userId}/add', function ($userId) {
        $productId = request('product_id');
        $quantity = request('quantity', 1);

        if (!$productId) {
            return response()->json(['message' => 'Product ID is required'], 400);
        }

        session_start();
        if (!isset($_SESSION['cart'][$userId])) {
            $_SESSION['cart'][$userId] = [];
        }

        // Check if product already in cart
        $productKey = array_search($productId, array_column($_SESSION['cart'][$userId], 'product_id'));

        if ($productKey !== false) {
            // Update quantity
            $_SESSION['cart'][$userId][$productKey]['quantity'] += $quantity;
        } else {
            // Add new item
            $_SESSION['cart'][$userId][] = [
                'product_id' => $productId,
                'quantity' => $quantity,
            ];
        }

        return response()->json($_SESSION['cart'][$userId]);
    });

    // Remove item from cart
    $router->post('/{userId}/remove', function ($userId) {
        $productId = request('product_id');

        if (!$productId) {
            return response()->json(['message' => 'Product ID is required'], 400);
        }

        session_start();
        if (!isset($_SESSION['cart'][$userId])) {
            return response()->json(['message' => 'Cart not found'], 404);
        }

        $productKey = array_search($productId, array_column($_SESSION['cart'][$userId], 'product_id'));

        if ($productKey !== false) {
            // Remove item
            array_splice($_SESSION['cart'][$userId], $productKey, 1);
        }

        return response()->json($_SESSION['cart'][$userId]);
    });
});