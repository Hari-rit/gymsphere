<?php
session_start();

// Destroy the session
session_unset();
session_destroy();

// Respond with JSON
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

echo json_encode(["success" => true, "message" => "Logged out successfully"]);
?>
