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
    echo json_encode(['success' => false, 'message' => 'Unauthorized (no trainer session)']);
    exit;
}

$trainer_id = $_SESSION['user_id'] ?? null;

if (!$trainer_id) {
    echo json_encode(['success' => false, 'message' => 'Trainer ID missing in session']);
    exit;
}

// 🔍 SQL Query
$sql = "SELECT mf.id, mf.user_id, u.username, mf.name, mf.age, mf.height, mf.weight,
               mf.goal, mf.health_issues, mf.worked_out_before, mf.experience_years,
               mf.experience_months, mf.status, mf.trainer_comment, mf.created_at,
               mf.assigned_trainer_id, t.username AS trainer_name
        FROM member_forms mf
        JOIN users u ON mf.user_id = u.id
        LEFT JOIN users t ON mf.assigned_trainer_id = t.id
        WHERE ((mf.assigned_trainer_id IS NULL AND mf.status = 'pending')
               OR (mf.assigned_trainer_id = ?))
        ORDER BY mf.created_at DESC";

$stmt = $conn->prepare($sql);

if (!$stmt) {
    echo json_encode([
        'success' => false,
        'message' => '❌ SQL Prepare failed: ' . $conn->error
    ]);
    exit;
}

$stmt->bind_param("i", $trainer_id);

$execSuccess = $stmt->execute();
if (!$execSuccess) {
    echo json_encode([
        'success' => false,
        'message' => '❌ SQL Execute failed: ' . $stmt->error
    ]);
    exit;
}

$result = $stmt->get_result();
$forms = [];
while ($row = $result->fetch_assoc()) {
    $forms[] = $row;
}

echo json_encode([
    'success' => true,
    'forms' => $forms,
    'debug' => [
        'trainer_id_used' => $trainer_id,
        'forms_count' => count($forms)
    ]
]);
