<?php
session_start();
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

include 'db.php';

// ✅ Only trainers
if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'trainer') {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);
$member_id = intval($data['member_id'] ?? 0);
$date = $data['date'] ?? null;
$status = $data['status'] ?? null;
$trainer_id = $_SESSION['user_id'];

if (!$member_id || !$date || !$status) {
    echo json_encode(['success' => false, 'message' => 'Missing data']);
    exit;
}

// Check if record exists
$stmt = $conn->prepare("SELECT id FROM attendance WHERE user_id = ? AND date = ?");
$stmt->bind_param("is", $member_id, $date);
$stmt->execute();
$res = $stmt->get_result();
$exists = $res->fetch_assoc();
$stmt->close();

if ($exists) {
    // Update existing
    $stmt = $conn->prepare("UPDATE attendance SET status = ? WHERE user_id = ? AND date = ?");
    $stmt->bind_param("sis", $status, $member_id, $date);
    $stmt->execute();
    $stmt->close();
} else {
    // Insert new (if missing completely)
    $stmt = $conn->prepare("INSERT INTO attendance (user_id, trainer_id, date, status) VALUES (?, ?, ?, ?)");
    $stmt->bind_param("iiss", $member_id, $trainer_id, $date, $status);
    $stmt->execute();
    $stmt->close();
}

echo json_encode(['success' => true, 'message' => "Attendance updated for $date"]);
