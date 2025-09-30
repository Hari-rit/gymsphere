<?php
require 'config.php';
session_start();

// --- CORS setup ---
header("Access-Control-Allow-Origin: http://localhost:3000"); // React frontend
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// --- Only logged-in members can fetch their fee ---
if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'member') {
    http_response_code(403);
    echo json_encode(["success" => false, "message" => "Unauthorized"]);
    exit;
}

$user_id = $_SESSION['user_id'];

// --- Fetch membership fee from users table ---
$stmt = $mysqli->prepare("SELECT membership_fee FROM users WHERE id=?");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$res = $stmt->get_result()->fetch_assoc();
$stmt->close();

if ($res) {
    echo json_encode([
        "success" => true,
        "fee" => intval($res['membership_fee'])
    ]);
} else {
    echo json_encode([
        "success" => false,
        "message" => "User not found"
    ]);
}
