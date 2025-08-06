<?php
// Handle CORS preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Headers: Content-Type");
    header("Access-Control-Allow-Methods: POST, OPTIONS");
    exit(0);
}

// Set session timeout to 60 seconds
ini_set('session.gc_maxlifetime', 60);
session_set_cookie_params(60);
session_start();

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Credentials: true"); // Allow credentials
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// DB config
$host = "localhost";
$user = "root";
$password = "";
$dbname = "gymsphere";

// Connect
$conn = new mysqli($host, $user, $password, $dbname);
if ($conn->connect_error) {
    die(json_encode(["success" => false, "message" => "Database connection failed."]));
}

// Get JSON data
$data = json_decode(file_get_contents("php://input"), true);

$username = $data['username'] ?? '';
$passwordInput = $data['password'] ?? '';

if (!$username || !$passwordInput) {
    echo json_encode(["success" => false, "message" => "Username and password are required."]);
    exit;
}

// Check user
$stmt = $conn->prepare("SELECT id, password, role FROM users WHERE username = ?");
$stmt->bind_param("s", $username);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode(["success" => false, "message" => "User not found."]);
} else {
    $user = $result->fetch_assoc();
    if (password_verify($passwordInput, $user['password'])) {
        // Store session variables
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['username'] = $username;
        $_SESSION['role'] = $user['role'];
        $_SESSION['last_activity'] = time(); // ✅ Add this to track inactivity

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
