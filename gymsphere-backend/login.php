<?php
// --- CORS handling ---
header("Access-Control-Allow-Origin: http://localhost:3000"); // React frontend
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json");

// --- Handle preflight OPTIONS request ---
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// --- Session settings ---
$timeout_duration = 1800; // 🔄 30 minutes
ini_set('session.gc_maxlifetime', $timeout_duration);
session_set_cookie_params([
    'lifetime' => $timeout_duration,
    'path' => '/',
    'domain' => '', 
    'secure' => false,  // set true if using HTTPS
    'httponly' => true,
    'samesite' => 'Lax'
]);
session_start();

// --- DB config ---
$host = "localhost";
$user = "root";
$password = "";
$dbname = "gymsphere";

$conn = new mysqli($host, $user, $password, $dbname);
if ($conn->connect_error) {
    die(json_encode(["success" => false, "message" => "Database connection failed."]));
}

// --- Get JSON input ---
$data = json_decode(file_get_contents("php://input"), true);
$loginInput = $data['username'] ?? ''; // can be username OR email
$passwordInput = $data['password'] ?? '';

if (!$loginInput || !$passwordInput) {
    echo json_encode(["success" => false, "message" => "Username/email and password are required."]);
    exit;
}

// --- Verify user (username OR email) ---
$stmt = $conn->prepare("SELECT id, username, email, password, role FROM users WHERE username = ? OR email = ?");
$stmt->bind_param("ss", $loginInput, $loginInput);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode(["success" => false, "message" => "User not found."]);
} else {
    $user = $result->fetch_assoc();
    if (password_verify($passwordInput, $user['password'])) {
        // ✅ Set session variables
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['username'] = $user['username']; // use actual DB username
        $_SESSION['role'] = $user['role'];
        $_SESSION['last_activity'] = time();

        echo json_encode([
            "success" => true,
            "message" => "Login successful.",
            "user" => [
                "id" => $user['id'],
                "username" => $user['username'],
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
