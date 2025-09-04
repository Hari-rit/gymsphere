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
$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['user_id']) || !isset($data['action'])) {
    echo json_encode(['success' => false, 'message' => 'Invalid input (user_id or action missing)']);
    exit;
}

$user_id = (int)$data['user_id'];
$action = $data['action'];
$trainer_comment = $data['trainer_comment'] ?? '';

// Handle approve/reject
if ($action === 'approve' || $action === 'reject') {
    $status = $action === 'approve' ? 'approved' : 'rejected';

    // Only update if THIS trainer owns the student
    $stmt = $conn->prepare("
        UPDATE member_forms 
        SET status = ?, trainer_comment = ? 
        WHERE user_id = ? AND assigned_trainer_id = ?
    ");

    if (!$stmt) {
        echo json_encode([
            'success' => false,
            'message' => '❌ SQL Prepare failed: ' . $conn->error
        ]);
        exit;
    }

    $stmt->bind_param("ssii", $status, $trainer_comment, $user_id, $trainer_id);
    $execSuccess = $stmt->execute();

    if (!$execSuccess) {
        echo json_encode([
            'success' => false,
            'message' => '❌ SQL Execution failed: ' . $stmt->error
        ]);
        exit;
    }

    if ($stmt->affected_rows > 0) {
        echo json_encode(['success' => true, 'message' => "✅ Student $status successfully"]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => '⚠️ Action not allowed (maybe already updated or belongs to another trainer)'
        ]);
    }

// 🔹 Handle generate_plan (new)
} elseif ($action === 'generate_plan') {
    $level = strtolower($data['level'] ?? 'beginner');

    // Get the form_id for this user (only if assigned to this trainer and approved)
    $formStmt = $conn->prepare("
        SELECT id, status FROM member_forms 
        WHERE user_id = ? AND assigned_trainer_id = ? LIMIT 1
    ");
    $formStmt->bind_param("ii", $user_id, $trainer_id);
    $formStmt->execute();
    $formResult = $formStmt->get_result();
    $formRow = $formResult->fetch_assoc();
    $formStmt->close();

    if (!$formRow) {
        echo json_encode(['success' => false, 'message' => 'Form not found or not assigned to you']);
        exit;
    }
    if ($formRow['status'] !== 'approved') {
        echo json_encode(['success' => false, 'message' => 'Plan can only be generated for approved members']);
        exit;
    }

    include 'generate_plan.php';
    $result = generate_plan($formRow['id'], $level, $conn);

    echo json_encode($result);

// Invalid action
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid action']);
}
?>
