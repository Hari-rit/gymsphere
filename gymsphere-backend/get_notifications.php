<?php
session_start();

// headers
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");

// preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

include 'db.php';

if (!isset($_SESSION['user_id']) || !isset($_SESSION['role'])) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

$user_id = (int)$_SESSION['user_id'];

// ✅ fetch notifications for this user (latest first)
$stmt = $conn->prepare("
    SELECT id, type, message, is_read, created_at
    FROM notifications
    WHERE user_id = ?
    ORDER BY created_at DESC
    LIMIT 100
");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();

$notifications = [];
while ($row = $result->fetch_assoc()) {
    $notifications[] = [
        'id' => (int)$row['id'],
        'type' => $row['type'],              // instead of origin_role
        'message' => $row['message'],
        'is_read' => (bool)$row['is_read'],
        'created_at' => $row['created_at'],
    ];
}
$stmt->close();

echo json_encode(['success' => true, 'notifications' => $notifications]);
exit;
?>
