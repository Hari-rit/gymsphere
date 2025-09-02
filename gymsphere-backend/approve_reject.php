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

// --- Only logged-in trainers can approve/reject ---
if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'trainer') {
    // clear cookie if unauthorized
    setcookie(session_name(), '', time() - 3600, '/');
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

// --- Get JSON input from React ---
$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['form_id']) || !isset($data['action'])) {
    echo json_encode(['success' => false, 'message' => 'Invalid input']);
    exit;
}

$form_id = (int)$data['form_id'];
$action = $data['action']; // 'approve' or 'reject'
$trainer_comment = $data['trainer_comment'] ?? '';

// --- Validate action ---
if (!in_array($action, ['approve', 'reject'])) {
    echo json_encode(['success' => false, 'message' => 'Invalid action']);
    exit;
}

// --- Update member_forms table ---
$status = $action === 'approve' ? 'approved' : 'rejected';

$stmt = $conn->prepare("UPDATE member_forms SET status = ?, trainer_comment = ? WHERE id = ?");
$stmt->bind_param("ssi", $status, $trainer_comment, $form_id);

if ($stmt->execute()) {
    // If approved, trigger AI plan generation (placeholder)
    if ($action === 'approve') {
        include 'generate_plan.php';
        generate_plan($form_id, $conn); // function will handle AI plan creation
    }

    echo json_encode(['success' => true, 'message' => "Form $status successfully"]);
} else {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $conn->error]);
}
?>
