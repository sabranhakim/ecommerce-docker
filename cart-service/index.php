<?php
require __DIR__ . '/vendor/autoload.php';

// Load environment variables
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

// Set JSON header & CORS
header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

// Handle preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

// Database connection
function getDbConnection() {
    $host = $_ENV['DB_HOST'] ?? '127.0.0.1';
    $db   = $_ENV['DB_DATABASE'] ?? 'cart_db';
    $user = $_ENV['DB_USERNAME'] ?? 'root';
    $pass = $_ENV['DB_PASSWORD'] ?? '';
    $charset = 'utf8mb4';

    $dsn = "mysql:host=$host;dbname=$db;charset=$charset";
    $options = [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ];
    try {
        return new PDO($dsn, $user, $pass, $options);
    } catch (\PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database connection failed: ' . $e->getMessage()]);
        exit;
    }
}

// Create table if not exists
function createCartTableIfNotExists($pdo) {
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS cart_items (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            product_id INT NOT NULL,
            quantity INT NOT NULL,
            UNIQUE KEY (user_id, product_id)
        )
    ");
}

$pdo = getDbConnection();
createCartTableIfNotExists($pdo);

// Parse path
$path = rtrim(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH), '/');
$requestMethod = $_SERVER['REQUEST_METHOD'];

// POST /cart -> Add item to cart
if ($path === '/cart' && $requestMethod === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    if (!$data || !isset($data['user_id'], $data['product_id'], $data['quantity'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid or missing fields']);
        exit;
    }

    $stmt = $pdo->prepare("
        INSERT INTO cart_items (user_id, product_id, quantity)
        VALUES (:user_id, :product_id, :quantity_insert)
        ON DUPLICATE KEY UPDATE quantity = quantity + :quantity_update
    ");
    $stmt->execute([
        ':user_id' => $data['user_id'],
        ':product_id' => $data['product_id'],
        ':quantity_insert' => $data['quantity'],
        ':quantity_update' => $data['quantity'],
    ]);

    echo json_encode(['message' => 'Item added to cart']);

}

// GET /cart/{userId} -> Get user's cart
elseif (preg_match('/\/cart\/(\d+)$/', $path, $matches) && $requestMethod === 'GET') {
    $userId = $matches[1];
    $stmt = $pdo->prepare("SELECT product_id, quantity FROM cart_items WHERE user_id = :user_id");
    $stmt->execute([':user_id' => $userId]);
    $items = $stmt->fetchAll();
    echo json_encode($items);
}

// PUT /cart/{userId} -> Update item quantity
elseif (preg_match('/\/cart\/(\d+)$/', $path, $matches) && $requestMethod === 'PUT') {
    $userId = $matches[1];
    $data = json_decode(file_get_contents('php://input'), true);
    if (!$data || !isset($data['product_id'], $data['quantity'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid or missing fields']);
        exit;
    }

    if ($data['quantity'] <= 0) {
        $stmt = $pdo->prepare("DELETE FROM cart_items WHERE user_id = :user_id AND product_id = :product_id");
        $stmt->execute([
            ':user_id' => $userId,
            ':product_id' => $data['product_id'],
        ]);
    } else {
        $stmt = $pdo->prepare("UPDATE cart_items SET quantity = :quantity WHERE user_id = :user_id AND product_id = :product_id");
        $stmt->execute([
            ':quantity' => $data['quantity'],
            ':user_id' => $userId,
            ':product_id' => $data['product_id'],
        ]);
    }

    echo json_encode(['message' => 'Cart updated']);
}

// DELETE /cart/{userId}/item/{productId} -> Remove an item
elseif (preg_match('/\/cart\/(\d+)\/item\/(\d+)$/', $path, $matches) && $requestMethod === 'DELETE') {
    $userId = $matches[1];
    $productId = $matches[2];

    $stmt = $pdo->prepare("DELETE FROM cart_items WHERE user_id = :user_id AND product_id = :product_id");
    $stmt->execute([
        ':user_id' => $userId,
        ':product_id' => $productId,
    ]);

    if ($stmt->rowCount() > 0) {
        echo json_encode(['message' => 'Item removed from cart']);
    } else {
        http_response_code(404);
        echo json_encode(['error' => 'Item not found in cart']);
    }
}

// Fallback
else {
    http_response_code(404);
    echo json_encode(['error' => 'Not Found']);
}
