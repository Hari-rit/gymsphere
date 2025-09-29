<?php
session_start();

// 🔹 CORS / headers
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

include 'db.php';

// ✅ Only trainers can access this endpoint
if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'trainer') {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

$trainer_id = (int)$_SESSION['user_id'];
$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['user_id']) || !isset($data['action'])) {
    echo json_encode(['success' => false, 'message' => 'Invalid input (user_id or action missing)']);
    exit;
}

$user_id = (int)$data['user_id'];
$action = $data['action'];
$trainer_comment = trim($data['trainer_comment'] ?? '');

// --- Approve / Reject ---
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
            'message' => 'SQL Prepare failed: ' . $conn->error
        ]);
        exit;
    }

    $stmt->bind_param("ssii", $status, $trainer_comment, $user_id, $trainer_id);
    $execSuccess = $stmt->execute();

    if (!$execSuccess) {
        echo json_encode([
            'success' => false,
            'message' => 'SQL Execution failed: ' . $stmt->error
        ]);
        exit;
    }

    if ($stmt->affected_rows > 0) {
        // 🔔 On rejection: insert notification for the member
        if ($action === 'reject') {
            $message = "Your trainer rejected your membership request";
            if ($trainer_comment !== '') {
                $message .= ": " . $trainer_comment;
            } else {
                $message .= ".";
            }

            $notifStmt = $conn->prepare("
                INSERT INTO notifications (user_id, type, message, is_read)
                VALUES (?, ?, ?, 0)
            ");
            if ($notifStmt) {
                $type = "trainer";
                $notifStmt->bind_param("iss", $user_id, $type, $message);
                $notifStmt->execute();
                $notifStmt->close();
            } else {
                error_log("Notifications insert failed: " . $conn->error);
            }
        }

        echo json_encode(['success' => true, 'message' => "Student $status successfully"]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Action not allowed (maybe already updated or belongs to another trainer)'
        ]);
    }

    $stmt->close();
    exit;
}

// --- Generate Plan ---
elseif ($action === 'generate_plan') {
    $level = strtolower($data['level'] ?? 'beginner');

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
    exit;
}

// --- Invalid Action ---
else {
    echo json_encode(['success' => false, 'message' => 'Invalid action']);
    exit;
}
?>
