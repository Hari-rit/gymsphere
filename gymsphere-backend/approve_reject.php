<?php
// --- CORS headers ---
header("Access-Control-Allow-Origin: http://localhost:3000"); 
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
$timeout_duration = 1800; 
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
    setcookie(session_name(), '', time() - 3600, '/');
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

// --- Get JSON input ---
$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['form_id']) || !isset($data['action'])) {
    echo json_encode(['success' => false, 'message' => 'Invalid input']);
    exit;
}

$form_id = (int)$data['form_id'];
$action = $data['action']; 
$trainer_comment = $data['trainer_comment'] ?? '';

// --- Validate action ---
if (!in_array($action, ['approve', 'reject'])) {
    echo json_encode(['success' => false, 'message' => 'Invalid action']);
    exit;
}

if ($action === 'approve') {
    // ✅ Approve and generate plan
    $stmt = $conn->prepare("UPDATE member_forms SET status = 'approved', trainer_comment = ? WHERE id = ?");
    $stmt->bind_param("si", $trainer_comment, $form_id);

    if ($stmt->execute()) {
        include 'generate_plan.php';
        generate_plan($form_id, $conn); 
        echo json_encode(['success' => true, 'message' => "Form approved successfully"]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Database error: ' . $conn->error]);
    }
    $stmt->close();

} elseif ($action === 'reject') {
    // ❌ Reject → Delete form + any linked plans
    $conn->begin_transaction();
    try {
        // Delete plans linked to this form
        $stmt1 = $conn->prepare("DELETE FROM plans WHERE member_form_id = ?");
        $stmt1->bind_param("i", $form_id);
        $stmt1->execute();
        $stmt1->close();

        // Delete the form itself
        $stmt2 = $conn->prepare("DELETE FROM member_forms WHERE id = ?");
        $stmt2->bind_param("i", $form_id);
        $stmt2->execute();
        $stmt2->close();

        $conn->commit();

        echo json_encode(['success' => true, 'message' => "Form rejected and deleted"]);
    } catch (Exception $e) {
        $conn->rollback();
        echo json_encode(['success' => false, 'message' => "Error rejecting form"]);
    }
}
?>
