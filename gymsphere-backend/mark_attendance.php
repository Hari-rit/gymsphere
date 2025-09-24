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
$data = json_decode(file_get_contents("php://input"), true);

$user_id = $data['member_id'] ?? null; // this is the user's id
$status = $data['status'] ?? null;     // expected: "present" or "absent"

// 🔹 Validate input
if (!$user_id || !in_array($status, ['present', 'absent'])) {
    echo json_encode(['success' => false, 'message' => 'Invalid input']);
    exit;
}

// 🔍 Verify trainer is assigned to this member
$check = $conn->prepare("SELECT assigned_trainer_id FROM member_forms WHERE user_id = ?");
$check->bind_param("i", $user_id);
$check->execute();
$checkResult = $check->get_result();
$assignment = $checkResult->fetch_assoc();

if (!$assignment || $assignment['assigned_trainer_id'] != $trainer_id) {
    echo json_encode(['success' => false, 'message' => 'Not authorized for this member']);
    exit;
}

$today = date('Y-m-d');

// 🔍 Check if attendance already marked for today
$exists = $conn->prepare("SELECT id FROM attendance WHERE user_id = ? AND trainer_id = ? AND date = ?");
$exists->bind_param("iis", $user_id, $trainer_id, $today);
$exists->execute();
$result = $exists->get_result();

if ($result->num_rows > 0) {
    echo json_encode([
        'success' => false,
        'message' => 'Attendance already marked today'
    ]);
    exit;
}

// 🔹 Insert new attendance record
$stmt = $conn->prepare("
    INSERT INTO attendance (user_id, trainer_id, date, status)
    VALUES (?, ?, ?, ?)
");
$stmt->bind_param("iiss", $user_id, $trainer_id, $today, $status);

if ($stmt->execute()) {
    echo json_encode([
        'success' => true,
        'message' => "Attendance marked as $status",
        'data' => [
            'user_id' => $user_id,
            'trainer_id' => $trainer_id,
            'date' => $today,
            'status' => $status
        ]
    ]);
} else {
    echo json_encode(['success' => false, 'message' => 'Failed to mark attendance: ' . $stmt->error]);
}
