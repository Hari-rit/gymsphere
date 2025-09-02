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

if (!isset($data['form_id'])) {
    echo json_encode(['success' => false, 'message' => 'Invalid input']);
    exit;
}

$form_id = (int)$data['form_id'];

// Assign trainer only if not already assigned
$stmt = $conn->prepare("
    UPDATE member_forms 
    SET assigned_trainer_id = ? 
    WHERE id = ? AND assigned_trainer_id IS NULL
");
$stmt->bind_param("ii", $trainer_id, $form_id);
$stmt->execute();

if ($stmt->affected_rows > 0) {
    echo json_encode(['success' => true, 'message' => '✅ Student accepted successfully']);
} else {
    echo json_encode(['success' => false, 'message' => '⚠️ This student was already assigned']);
}
?>
