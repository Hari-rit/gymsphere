<?php
session_start();

// Force JSON response headers
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");

// ✅ Always log errors instead of printing HTML
ini_set("display_errors", 0);
ini_set("log_errors", 1);
error_reporting(E_ALL);

// ✅ Custom error handler to always return JSON
set_error_handler(function ($errno, $errstr, $errfile, $errline) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "error" => "$errstr in $errfile:$errline"
    ]);
    exit;
});

// ✅ Unauthorized check
if (!isset($_SESSION['user_id']) || !isset($_SESSION['role'])) {
    echo json_encode(["success" => false, "message" => "Unauthorized"]);
    exit;
}

include 'db.php';

$role = $_SESSION['role'];
$user_id = $_SESSION['user_id'];

// --- Current month range ---
$monthStart = date("Y-m-01");
$monthEnd = date("Y-m-t");

$monthly = ['present' => 0, 'absent' => 0, 'sessions' => 0];
$alltime = ['present' => 0, 'absent' => 0, 'sessions' => 0];
$total_clients = 0;

// --- TRAINER ---
if ($role === 'trainer') {
    // Monthly summary
    $stmt = $conn->prepare("
        SELECT a.status, COUNT(*) as count 
        FROM attendance a
        INNER JOIN member_forms mf ON a.user_id = mf.user_id
        WHERE mf.assigned_trainer_id = ? 
          AND a.date BETWEEN ? AND ?
        GROUP BY a.status
    ");
    $stmt->bind_param("iss", $user_id, $monthStart, $monthEnd);
    $stmt->execute();
    $result = $stmt->get_result();
    while ($row = $result->fetch_assoc()) {
        if ($row['status'] === 'present') $monthly['present'] = $row['count'];
        if ($row['status'] === 'absent') $monthly['absent'] = $row['count'];
        $monthly['sessions'] += $row['count'];
    }
    $stmt->close();

    // Approved clients
    $stmt = $conn->prepare("
        SELECT COUNT(*) as total_clients 
        FROM member_forms 
        WHERE assigned_trainer_id = ? AND status = 'approved'
    ");
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $res = $stmt->get_result()->fetch_assoc();
    $total_clients = $res['total_clients'] ?? 0;
    $stmt->close();

    // All-time summary
    $stmt = $conn->prepare("
        SELECT a.status, COUNT(*) as count 
        FROM attendance a
        INNER JOIN member_forms mf ON a.user_id = mf.user_id
        WHERE mf.assigned_trainer_id = ?
        GROUP BY a.status
    ");
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $result = $stmt->get_result();
    while ($row = $result->fetch_assoc()) {
        if ($row['status'] === 'present') $alltime['present'] = $row['count'];
        if ($row['status'] === 'absent') $alltime['absent'] = $row['count'];
        $alltime['sessions'] += $row['count'];
    }
    $stmt->close();
}

// --- ADMIN ---
elseif ($role === 'admin') {
    // Monthly summary (all members)
    $stmt = $conn->prepare("
        SELECT a.status, COUNT(*) as count 
        FROM attendance a
        WHERE a.date BETWEEN ? AND ?
        GROUP BY a.status
    ");
    $stmt->bind_param("ss", $monthStart, $monthEnd);
    $stmt->execute();
    $result = $stmt->get_result();
    while ($row = $result->fetch_assoc()) {
        if ($row['status'] === 'present') $monthly['present'] = $row['count'];
        if ($row['status'] === 'absent') $monthly['absent'] = $row['count'];
        $monthly['sessions'] += $row['count'];
    }
    $stmt->close();

    // Approved clients (all trainers)
    $stmt = $conn->prepare("
        SELECT COUNT(*) as total_clients 
        FROM member_forms 
        WHERE status = 'approved'
    ");
    $stmt->execute();
    $res = $stmt->get_result()->fetch_assoc();
    $total_clients = $res['total_clients'] ?? 0;
    $stmt->close();

    // All-time summary (all members)
    $stmt = $conn->prepare("
        SELECT a.status, COUNT(*) as count 
        FROM attendance a
        GROUP BY a.status
    ");
    $stmt->execute();
    $result = $stmt->get_result();
    while ($row = $result->fetch_assoc()) {
        if ($row['status'] === 'present') $alltime['present'] = $row['count'];
        if ($row['status'] === 'absent') $alltime['absent'] = $row['count'];
        $alltime['sessions'] += $row['count'];
    }
    $stmt->close();
}

else {
    echo json_encode(["success" => false, "message" => "Unauthorized role"]);
    exit;
}

// Add clients count
$monthly['total_clients'] = $total_clients;
$alltime['total_clients'] = $total_clients;

// ✅ Final JSON Response
echo json_encode([
    "success" => true,
    "monthly" => $monthly,
    "all_time" => $alltime,
    "total_clients" => $total_clients
]);
