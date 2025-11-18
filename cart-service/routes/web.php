<?php

$router->get('/cart', function () use ($router) {
    return 'Cart Service is running';
});

##Dummy cart data
$carts = [
    'items' => [
        [
            'id' => 1,
            'name' => 'Product A',
            'quantity' => 2,
            'price' => 50.00
        ],
        [
            'id' => 2,
            'name' => 'Product B',
            'quantity' => 1,
            'price' => 30.00
        ],
        [
            'id' => 3,
            'name' => 'Product C',
            'quantity' => 1,
            'price' => 50.00
        ]
    ],
    'total' => 130.00
];

//get all charts
$router->get('/carts', function () use ($carts) {
    return response()->json($carts);
});

//get cart by id
$router->get('/carts/{id}', function ($id) use ($carts) {
    foreach ($carts['items'] as $item) {
        if ($item['id'] == $id) {
            return response()->json($item);
        }
    }
    return response()->json(['message' => 'Item not found'], 404);
});

//delete item from cart
$router->delete('/carts/{id}', function ($id) use (&$carts) {

    $cartId = (int) $id;
    $exists = array_filter($carts, fn($c) => $c['id'] === $cartId);
    if (!$exists) { 
        return response()->json(['message' => 'Item not found'], 404);
    }
    //simulate deletion
    return response()->json(['message' => 'Item deleted successfully']);
});
?>