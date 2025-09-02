<?php
session_start();
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");

include 'db.php';

if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'member') {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

$sql = "SELECT id, status, trainer_comment 
        FROM member_forms 
        WHERE user_id = ? 
        ORDER BY created_at DESC 
        LIMIT 1";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $_SESSION['user_id']);
$stmt->execute();
$result = $stmt->get_result();

if ($form = $result->fetch_assoc()) {
    echo json_encode(['success' => true, 'form' => $form]);
} else {
    echo json_encode(['success' => true, 'form' => null]); // no form yet
}
?>
