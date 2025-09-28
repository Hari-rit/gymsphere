<?php
session_start();
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

include 'db.php';

if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'trainer') {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

$trainer_id = $_SESSION['user_id'];

// 🔹 If member_id is passed, return calendar-style data
if (isset($_GET['member_id'])) {
    $member_id = intval($_GET['member_id']);

    // Get member's join date
    $stmt = $conn->prepare("SELECT created_at FROM users WHERE id = ?");
    $stmt->bind_param("i", $member_id);
    $stmt->execute();
    $joinRes = $stmt->get_result()->fetch_assoc();
    $join_date = $joinRes ? $joinRes['created_at'] : null;
    $stmt->close();

    // Get attendance
    $stmt = $conn->prepare("
        SELECT date, status
        FROM attendance
        WHERE user_id = ?
        ORDER BY date ASC
    ");
    $stmt->bind_param("i", $member_id);
    $stmt->execute();
    $result = $stmt->get_result();

    $attendance = [];
    while ($row = $result->fetch_assoc()) {
        $attendance[$row['date']] = $row['status'];
    }

    echo json_encode([
        'success' => true,
        'attendance' => $attendance,
        'join_date' => $join_date
    ]);
    exit;
}

// 🔹 Otherwise return list of members under trainer
$stmt = $conn->prepare("
    SELECT DISTINCT u.id, u.username
    FROM users u
    INNER JOIN member_forms mf ON u.id = mf.user_id
    WHERE mf.assigned_trainer_id = ?
");
$stmt->bind_param("i", $trainer_id);
$stmt->execute();
$result = $stmt->get_result();

$members = [];
while ($row = $result->fetch_assoc()) {
    $members[] = $row;
}

echo json_encode(['success' => true, 'members' => $members]);
