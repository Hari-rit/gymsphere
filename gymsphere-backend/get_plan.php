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

// --- Session setup ---
$timeout_duration = 1800; // 🔄 30 minutes
ini_set('session.gc_maxlifetime', $timeout_duration);
session_set_cookie_params([
    'lifetime' => $timeout_duration,
    'path' => '/',
    'domain' => 'localhost',
    'secure' => false,
    'httponly' => true,
    'samesite' => 'Lax'
]);
session_start();

include 'db.php';

// --- Only logged-in members can access ---
if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'member') {
    // clear cookie if unauthorized
    setcookie(session_name(), '', time() - 3600, '/');
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

// --- Fetch approved plan for this member ---
$sql = "SELECT p.id, p.workout_plan, p.diet_plan, p.created_at
        FROM plans p
        JOIN member_forms mf ON p.member_form_id = mf.id
        WHERE mf.user_id = ? AND p.approved_by_trainer = 1
        ORDER BY p.created_at DESC
        LIMIT 1";

$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $_SESSION['user_id']);
$stmt->execute();
$result = $stmt->get_result();

if ($plan = $result->fetch_assoc()) {
    echo json_encode(['success' => true, 'plan' => $plan]);
} else {
    echo json_encode(['success' => false, 'message' => 'No approved plan found']);
}
?>
