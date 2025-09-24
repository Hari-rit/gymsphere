<?php
session_start();

// 🔹 CORS Headers
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

// 🔹 Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

include 'db.php';

// ✅ Only trainers allowed
if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'trainer') {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

$trainer_id = $_SESSION['user_id'];

// 🔍 Get attendance records for members assigned to this trainer
$stmt = $conn->prepare("
    SELECT a.user_id, a.date, a.status
    FROM attendance a
    INNER JOIN member_forms mf ON a.user_id = mf.user_id
    WHERE mf.assigned_trainer_id = ?
");
$stmt->bind_param("i", $trainer_id);
$stmt->execute();
$result = $stmt->get_result();

$attendance = [];
while ($row = $result->fetch_assoc()) {
    $uid = $row['user_id'];
    $date = $row['date'];
    $status = $row['status'];

    if (!isset($attendance[$uid])) {
        $attendance[$uid] = [];
    }
    $attendance[$uid][$date] = $status;
}

echo json_encode([
    'success' => true,
    'attendance' => $attendance
]);
