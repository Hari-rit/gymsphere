<?php
ini_set('session.gc_maxlifetime', 60); // Session data expires after 60s
session_set_cookie_params(60); // Session cookie expires after 60s
session_start();

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

// Manual session timeout logic
$timeout_duration = 60;

if (isset($_SESSION['last_activity']) && (time() - $_SESSION['last_activity']) > $timeout_duration) {
    // Session expired due to inactivity
    session_unset();
    session_destroy();
    echo json_encode(["loggedIn" => false, "message" => "Session expired"]);
    exit;
}

// If session is valid and user is logged in
if (isset($_SESSION['user_id'])) {
    $_SESSION['last_activity'] = time(); // Reset timer on activity
    echo json_encode([
        "loggedIn" => true,
        "user" => [
            "id" => $_SESSION['user_id'],
            "username" => $_SESSION['username'],
            "role" => $_SESSION['role']
        ]
    ]);
} else {
    echo json_encode(["loggedIn" => false]);
}
?>
