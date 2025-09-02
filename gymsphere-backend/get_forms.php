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

session_start();
include 'db.php';

// --- Only logged-in trainers can access ---
if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'trainer') {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

// --- Fetch all submitted member forms with member username ---
$sql = "SELECT mf.id, mf.user_id, u.username, mf.name, mf.age, mf.height, mf.weight, 
               mf.goal, mf.health_issues, mf.worked_out_before, mf.experience_years, 
               mf.experience_months, mf.status, mf.trainer_comment, mf.created_at
        FROM member_forms mf
        JOIN users u ON mf.user_id = u.id
        ORDER BY mf.created_at DESC";

$result = $conn->query($sql);

$forms = [];
if ($result) {
    while ($row = $result->fetch_assoc()) {
        $forms[] = $row;
    }
    echo json_encode(['success' => true, 'forms' => $forms]);
} else {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $conn->error]);
}
?>
