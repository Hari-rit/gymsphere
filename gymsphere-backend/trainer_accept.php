<?php
session_start();

// 🔹 CORS Headers
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

// 🔹 Handle preflight (OPTIONS request)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

include 'db.php';

// ✅ Only trainers can access
if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'trainer') {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

$trainer_id = $_SESSION['user_id'];
$trainer_username = $_SESSION['username'] ?? "unknown"; // fallback if session missing username
$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Invalid input (user_id missing)']);
    exit;
}

$user_id = (int)$data['user_id'];

// ✅ Assign trainer only if not already assigned
$stmt = $conn->prepare("
    UPDATE member_forms 
    SET assigned_trainer_id = ? 
    WHERE user_id = ? AND assigned_trainer_id IS NULL
");

if (!$stmt) {
    echo json_encode([
        'success' => false,
        'message' => '❌ SQL Prepare failed: ' . $conn->error
    ]);
    exit;
}

$stmt->bind_param("ii", $trainer_id, $user_id);
$execSuccess = $stmt->execute();

if (!$execSuccess) {
    echo json_encode([
        'success' => false,
        'message' => '❌ SQL Execution failed: ' . $stmt->error
    ]);
    exit;
}

if ($stmt->affected_rows > 0) {
    echo json_encode([
        'success' => true,
        'message' => '✅ Student accepted successfully',
        'trainer_id' => $trainer_id,
        'trainer_username' => $trainer_username
    ]);
} else {
    echo json_encode([
        'success' => false,
        'message' => '⚠️ This student was already assigned OR no matching row found',
        'debug' => [
            'trainer_id_used' => $trainer_id,
            'user_id_used' => $user_id
        ]
    ]);
}
?>
