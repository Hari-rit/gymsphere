<?php
// --- CORS headers ---
header("Access-Control-Allow-Origin: http://localhost:3000"); // React frontend origin
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json");

// --- Handle preflight OPTIONS request ---
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

session_start();

// --- Destroy the session ---
session_unset();
session_destroy();

// --- Clear the session cookie ---
setcookie(session_name(), '', time() - 3600, '/');

// --- Respond with JSON ---
echo json_encode(["success" => true, "message" => "Logged out successfully"]);
?>

