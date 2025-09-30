<?php
require 'config.php';
session_start();

// --- CORS setup ---
header("Access-Control-Allow-Origin: http://localhost:3000"); 
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// --- Only members can pay ---
if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'member') {
    http_response_code(403);
    echo json_encode(["success" => false, "message" => "Unauthorized"]);
    exit;
}

$user_id = $_SESSION['user_id'];

// --- Get member & fee ---
$stmt = $mysqli->prepare("SELECT username, membership_fee FROM users WHERE id=? AND role='member'");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$res = $stmt->get_result();
if (!$res || $res->num_rows === 0) {
    echo json_encode(["success" => false, "message" => "Member not found"]);
    exit;
}
$row = $res->fetch_assoc();
$stmt->close();

$username = $row['username'];
$amount = intval($row['membership_fee']);

// --- Check if already paid this month ---
$check = $mysqli->prepare("
    SELECT COUNT(*) as cnt 
    FROM payments 
    WHERE user_id=? 
      AND status='success' 
      AND MONTH(created_at)=MONTH(CURDATE()) 
      AND YEAR(created_at)=YEAR(CURDATE())
");
$check->bind_param("i", $user_id);
$check->execute();
$already = $check->get_result()->fetch_assoc();
$check->close();

if ($already['cnt'] > 0) {
    echo json_encode([
        "success" => false,
        "message" => "You have already paid for this month."
    ]);
    exit;
}

// --- Insert dummy payment ---
$stmt = $mysqli->prepare("
    INSERT INTO payments (user_id, amount, status, transaction_id, created_at) 
    VALUES (?, ?, 'success', ?, NOW())
");
$txn_id = "DUMMY-" . uniqid();
$stmt->bind_param("iis", $user_id, $amount, $txn_id);
$ok = $stmt->execute();
$stmt->close();

if ($ok) {
    $monthYear = date('F Y');

    // ✅ Notify all admins
    $msgAdmin = "💰 Member {$username} has paid ₹{$amount} for {$monthYear}";
    $resAdmins = $mysqli->query("SELECT id FROM users WHERE role='admin'");
    while ($admin = $resAdmins->fetch_assoc()) {
        $stmt2 = $mysqli->prepare("INSERT INTO notifications (user_id, type, message) VALUES (?, 'payment', ?)");
        $stmt2->bind_param("is", $admin['id'], $msgAdmin);
        $stmt2->execute();
        $stmt2->close();
    }

    // ✅ Notify member
    $msgMember = "✅ Your payment of ₹{$amount} for {$monthYear} was successful.";
    $stmt3 = $mysqli->prepare("INSERT INTO notifications (user_id, type, message) VALUES (?, 'payment', ?)");
    $stmt3->bind_param("is", $user_id, $msgMember);
    $stmt3->execute();
    $stmt3->close();

    echo json_encode([
        "success" => true,
        "message" => "Payment recorded",
        "amount" => $amount,
        "transaction_id" => $txn_id
    ]);
} else {
    echo json_encode(["success" => false, "message" => "Failed to record payment"]);
}
