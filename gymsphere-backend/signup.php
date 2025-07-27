<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// Database credentials
$host = "localhost";
$user = "root";
$password = "";
$dbname = "gymsphere";

// Create connection
$conn = new mysqli($host, $user, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die(json_encode(["success" => false, "message" => "Connection failed"]));
}

// Get JSON input
$data = json_decode(file_get_contents("php://input"), true);

// Extract fields
$username = $data['username'] ?? '';
$email = $data['email'] ?? '';
$plainPassword = $data['password'] ?? '';
$role = $data['role'] ?? 'member'; // Default role

// Simple validation
if (!$username || !$email || !$plainPassword) {
    echo json_encode(["success" => false, "message" => "Missing required fields"]);
    exit;
}

// Hash password
$hashedPassword = password_hash($plainPassword, PASSWORD_DEFAULT);

// Insert into database
$stmt = $conn->prepare("INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)");
$stmt->bind_param("ssss", $username, $email, $hashedPassword, $role);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "User registered successfully"]);
} else {
    echo json_encode(["success" => false, "message" => "Error: " . $stmt->error]);
}

$stmt->close();
$conn->close();
?>
