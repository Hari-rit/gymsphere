<?php
session_start();
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");

include 'db.php';

// ✅ Only trainers can access
if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'trainer') {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

$trainer_id = $_SESSION['user_id'];
$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['form_id']) || !isset($data['action'])) {
    echo json_encode(['success' => false, 'message' => 'Invalid input']);
    exit;
}

$form_id = (int)$data['form_id'];
$action = $data['action'];
$trainer_comment = $data['trainer_comment'] ?? '';

// Handle only approve/reject
if ($action === 'approve' || $action === 'reject') {
    $status = $action === 'approve' ? 'approved' : 'rejected';

    // Only update if THIS trainer owns the form
    $stmt = $conn->prepare("
        UPDATE member_forms 
        SET status = ?, trainer_comment = ? 
        WHERE id = ? AND assigned_trainer_id = ?
    ");
    $stmt->bind_param("ssii", $status, $trainer_comment, $form_id, $trainer_id);
    $stmt->execute();

    if ($stmt->affected_rows > 0) {
        if ($action === 'approve') {
            include 'generate_plan.php';
            generate_plan($form_id, $conn);
        }
        echo json_encode(['success' => true, 'message' => "✅ Form $status successfully"]);
    } else {
        echo json_encode(['success' => false, 'message' => '⚠️ Action not allowed (maybe another trainer owns this student)']);
    }

} else {
    echo json_encode(['success' => false, 'message' => 'Invalid action']);
}
?>
