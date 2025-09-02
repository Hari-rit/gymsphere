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

// --- Session timeout settings ---
$timeout_duration = 1800; // 🔄 30 minutes

session_set_cookie_params([
    'lifetime' => $timeout_duration,
    'path' => '/',
    'domain' => '', // leave empty for default
    'secure' => false, // set to true if using HTTPS
    'httponly' => true,
    'samesite' => 'Lax'
]);
session_start();

// Debug logs (keep for now, remove later)
// error_log("CHECK SESSION ID: " . session_id());
// error_log("SESSION DATA: " . print_r($_SESSION, true));

// --- Session timeout check ---
if (isset($_SESSION['last_activity']) && (time() - $_SESSION['last_activity']) > $timeout_duration) {
    session_unset();
    session_destroy();
    setcookie(session_name(), '', time() - 3600, '/'); // clear cookie too
    echo json_encode(["loggedIn" => false, "message" => "Session expired"]);
    exit;
}

// --- Session valid ---
if (isset($_SESSION['user_id'])) {
    $_SESSION['last_activity'] = time(); // reset timer
    echo json_encode([
        "loggedIn" => true,
        "user" => [
            "id" => $_SESSION['user_id'],
            "username" => $_SESSION['username'],
            "role" => $_SESSION['role'] // member or trainer
        ]
    ]);
} else {
    // clear cookie if unauthorized
    setcookie(session_name(), '', time() - 3600, '/');
    echo json_encode(["loggedIn" => false]);
}
?>
