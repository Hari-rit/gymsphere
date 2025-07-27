<?php
// Allow CORS and set content type
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST");
header("Content-Type: application/json");

// Database configuration
$host = "localhost";
$user = "root";
$password = "";
$dbname = "gymsphere";

// Create DB connection
$conn = new mysqli($host, $user, $password, $dbname);

// Check DB connection
if ($conn->connect_error) {
    echo json_encode(["success" => false, "message" => "Database connection failed"]);
    exit;
}

// Decode incoming JSON
$data = json_decode(file_get_contents("php://input"), true);

// Extract and validate input
$username = trim($data['username'] ?? '');
$email = trim($data['email'] ?? '');
$plainPassword = $data['password'] ?? '';
$role = $data['role'] ?? 'member'; // Default to 'member'

// Simple field validation
if (empty($username) || empty($email) || empty($plainPassword)) {
    echo json_encode(["success" => false, "message" => "Please fill in all required fields."]);
    exit;
}

// Check for duplicate username/email
$checkStmt = $conn->prepare("SELECT id FROM users WHERE username = ? OR email = ?");
$checkStmt->bind_param("ss", $username, $email);
$checkStmt->execute();
$checkStmt->store_result();

if ($checkStmt->num_rows > 0) {
    echo json_encode(["success" => false, "message" => "Username or email already exists."]);
    $checkStmt->close();
    $conn->close();
    exit;
}
$checkStmt->close();

// Hash password before storing
$hashedPassword = password_hash($plainPassword, PASSWORD_DEFAULT);

// Insert new user
$insertStmt = $conn->prepare("INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)");
$insertStmt->bind_param("ssss", $username, $email, $hashedPassword, $role);

if ($insertStmt->execute()) {
    echo json_encode(["success" => true, "message" => "User registered successfully."]);
} else {
    echo json_encode(["success" => false, "message" => "Error: " . $insertStmt->error]);
}

// Clean up
$insertStmt->close();
$conn->close();
?>
