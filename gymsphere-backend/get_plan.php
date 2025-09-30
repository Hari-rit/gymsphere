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

$user_id = $_SESSION['user_id'];
$month   = date('n');
$year    = date('Y');

// --- ✅ Payment check for current month ---
$check_sql = "SELECT COUNT(*) AS c
              FROM payments
              WHERE user_id=? AND status='success'
              AND MONTH(created_at)=? AND YEAR(created_at)=?";
$check_stmt = $conn->prepare($check_sql);
$check_stmt->bind_param("iii", $user_id, $month, $year);
$check_stmt->execute();
$check_result = $check_stmt->get_result()->fetch_assoc();
$check_stmt->close();

if ($check_result['c'] == 0) {
    // 🚨 Insert a payment notification if not already exists for this month
    $msg = "⚠️ Monthly fee not paid for " . date('F Y') . ". Please pay to continue.";
    $notif_sql = "
        INSERT INTO notifications (user_id, type, message)
        SELECT ?, 'payment', ?
        WHERE NOT EXISTS (
          SELECT 1 FROM notifications 
          WHERE user_id=? AND type='payment'
          AND MONTH(created_at)=? AND YEAR(created_at)=?
        )";
    $notif_stmt = $conn->prepare($notif_sql);
    $notif_stmt->bind_param("isiii", $user_id, $msg, $user_id, $month, $year);
    $notif_stmt->execute();
    $notif_stmt->close();

    echo json_encode(['success' => false, 'message' => 'Payment required to access workout and diet plans']);
    exit;
}

// --- ✅ Trainer workout renewal check ---
// Look up all approved plans for this member
$sqlPlans = "
    SELECT p.id, p.created_at, mf.assigned_trainer_id, mf.name as member_name
    FROM plans p
    JOIN member_forms mf ON mf.id = p.member_form_id
    WHERE mf.user_id = ? AND p.approved_by_trainer = 1
    ORDER BY p.created_at DESC
    LIMIT 1";
$stmtPlans = $conn->prepare($sqlPlans);
$stmtPlans->bind_param("i", $user_id);
$stmtPlans->execute();
$resPlans = $stmtPlans->get_result();

while ($row = $resPlans->fetch_assoc()) {
    $days_passed = (time() - strtotime($row['created_at'])) / (60 * 60 * 24);
    if ($days_passed > 30 && $row['assigned_trainer_id']) {
        $trainer_id = $row['assigned_trainer_id'];
        $msg = "⚠️ Member {$row['member_name']}'s workout plan is due for renewal.";
        
        $notif_sql2 = "
            INSERT INTO notifications (user_id, type, message)
            SELECT ?, 'renewal', ?
            WHERE NOT EXISTS (
              SELECT 1 FROM notifications 
              WHERE user_id=? AND type='renewal'
              AND MONTH(created_at)=MONTH(NOW())
              AND YEAR(created_at)=YEAR(NOW())
            )";
        $notif_stmt2 = $conn->prepare($notif_sql2);
        $notif_stmt2->bind_param("isi", $trainer_id, $msg, $trainer_id);
        $notif_stmt2->execute();
        $notif_stmt2->close();
    }
}
$stmtPlans->close();

// --- Fetch approved plan for this member ---
$sql = "SELECT p.id, p.workout_plan, p.diet_plan, p.created_at
        FROM plans p
        JOIN member_forms mf ON p.member_form_id = mf.id
        WHERE mf.user_id = ? AND p.approved_by_trainer = 1
        ORDER BY p.created_at DESC
        LIMIT 1";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();

if ($plan = $result->fetch_assoc()) {
    echo json_encode(['success' => true, 'plan' => $plan]);
} else {
    echo json_encode(['success' => false, 'message' => 'No approved plan found']);
}
