<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// DB config
$host = "localhost";
$user = "root";
$password = "";
$dbname = "gymsphere";

// Create DB connection
$conn = new mysqli($host, $user, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Database connection failed."]);
    exit;
}

// Get JSON input
$data = json_decode(file_get_contents("php://input"), true);

// Extract and sanitize inputs
$username = trim($data['username'] ?? '');
$passwordInput = trim($data['password'] ?? '');

// Validate inputs
if (empty($username) || empty($passwordInput)) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Username and password are required."]);
    exit;
}

// Prepare and execute query
$stmt = $conn->prepare("SELECT id, password, role FROM users WHERE username = ?");
$stmt->bind_param("s", $username);
$stmt->execute();
$result = $stmt->get_result();

// Validate user credentials
if ($result->num_rows === 0) {
    echo json_encode(["success" => false, "message" => "User not found."]);
} else {
    $user = $result->fetch_assoc();
    if (password_verify($passwordInput, $user['password'])) {
        echo json_encode([
            "success" => true,
            "message" => "Login successful.",
            "user" => [
                "id" => $user['id'],
                "username" => $username,
                "role" => $user['role']
            ]
        ]);
    } else {
        echo json_encode(["success" => false, "message" => "Invalid password."]);
    }
}

$stmt->close();
$conn->close();
?>
