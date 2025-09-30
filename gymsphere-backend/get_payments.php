<?php
require 'config.php';
session_start();

// --- CORS setup ---
header("Access-Control-Allow-Origin: http://localhost:3000"); // React origin
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// --- Admin check ---
if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'admin') {
    http_response_code(403);
    echo json_encode(["success" => false, "message" => "Admin only"]);
    exit;
}

$month = isset($_GET['month']) ? intval($_GET['month']) : date('n');
$year  = isset($_GET['year']) ? intval($_GET['year']) : date('Y');

// --- 1. Get all members ---
$users = [];
$resUsers = $mysqli->query("SELECT id, username, membership_fee, created_at FROM users WHERE role='member'");
while ($row = $resUsers->fetch_assoc()) {
    $users[$row['id']] = [
        "username" => $row['username'],
        "paid" => false,
        "last_payment" => null,
        "membership_fee" => intval($row['membership_fee']),
        "joined" => $row['created_at']
    ];
}

// --- 2. Monthly payments ---
$stmt = $mysqli->prepare("
  SELECT p.user_id, p.amount, p.status, p.created_at
  FROM payments p
  WHERE MONTH(p.created_at)=? AND YEAR(p.created_at)=?
  ORDER BY p.created_at DESC
");
$stmt->bind_param('ii', $month, $year);
$stmt->execute();
$res = $stmt->get_result();

$collected = 0;
while ($row = $res->fetch_assoc()) {
    if ($row['status'] === 'success' && isset($users[$row['user_id']])) {
        $collected += $row['amount'];
        $users[$row['user_id']]['paid'] = true;
        $users[$row['user_id']]['last_payment'] = $row['created_at'];
    }
}
$stmt->close();

// --- 3. Monthly pending ---
$total_fee_due = array_sum(array_column($users, "membership_fee"));
$pending = $total_fee_due - $collected;

// --- 4. All-time calculation (per member) ---
$all_time_expected = 0;
$all_time_collected = 0;

// Get total collected per member
$resPayments = $mysqli->query("
  SELECT user_id, SUM(amount) as total
  FROM payments
  WHERE status='success'
  GROUP BY user_id
");
$paidByUser = [];
while ($r = $resPayments->fetch_assoc()) {
    $paidByUser[$r['user_id']] = intval($r['total']);
    $all_time_collected += intval($r['total']);
}

// Calculate expected for each user
foreach ($users as $uid => $u) {
    $joinDate = $u['joined'] ? strtotime($u['joined']) : time();
    $months_active = ((date('Y') - date('Y', $joinDate)) * 12) + (date('n') - date('n', $joinDate)) + 1;
    $expected = $months_active * $u['membership_fee'];
    $all_time_expected += $expected;
}

$pending_all = max(0, $all_time_expected - $all_time_collected);

// --- 5. Response ---
echo json_encode([
    "success" => true,
    "summary" => [
        "monthly" => [
            "collected" => $collected,
            "pending" => max(0, $pending),
        ],
        "all_time" => [
            "collected" => $all_time_collected,
            "pending" => $pending_all,
        ],
        "total_members" => count($users)
    ],
    "members" => array_values($users)
]);
?>
