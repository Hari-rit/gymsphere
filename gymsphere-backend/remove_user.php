<?php
session_start();

// 🔹 CORS
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

// ✅ Only admin can remove users
if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'admin') {
    echo json_encode(["success" => false, "message" => "Unauthorized"]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);
if (!isset($data['user_id'])) {
    echo json_encode(["success" => false, "message" => "User ID required"]);
    exit;
}

$user_id = intval($data['user_id']);

// 🛑 Prevent self-deletion
if ($user_id === $_SESSION['user_id']) {
    echo json_encode(["success" => false, "message" => "You cannot remove yourself"]);
    exit;
}

// 🔎 Check target role before deleting
$roleCheck = $conn->prepare("SELECT role FROM users WHERE id = ?");
$roleCheck->bind_param("i", $user_id);
$roleCheck->execute();
$roleResult = $roleCheck->get_result();

if ($roleResult->num_rows === 0) {
    echo json_encode(["success" => false, "message" => "User not found"]);
    exit;
}

$target = $roleResult->fetch_assoc();
if ($target['role'] === 'admin') {
    echo json_encode(["success" => false, "message" => "Admins cannot be removed"]);
    exit;
}
$roleCheck->close();

// 🔥 Delete user (cascade optional — add ON DELETE CASCADE in DB if needed)
$stmt = $conn->prepare("DELETE FROM users WHERE id = ?");
$stmt->bind_param("i", $user_id);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "User removed successfully"]);
} else {
    echo json_encode(["success" => false, "message" => "Failed to remove user"]);
}

$stmt->close();
$conn->close();
