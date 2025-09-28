<?php
session_start();
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");

if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'admin') {
    echo json_encode(["success" => false, "message" => "Unauthorized"]);
    exit;
}

include "db.php";
$date = $_GET['date'] ?? date("Y-m-d");

$stmt = $conn->prepare("
    SELECT a.date, a.status, u.username AS member_name, 
           t.username AS trainer_name
    FROM attendance a
    INNER JOIN users u ON a.user_id = u.id
    LEFT JOIN member_forms mf ON u.id = mf.user_id
    LEFT JOIN users t ON mf.assigned_trainer_id = t.id
    WHERE a.date = ?
");
$stmt->bind_param("s", $date);
$stmt->execute();
$result = $stmt->get_result();

$records = [];
while ($row = $result->fetch_assoc()) {
    $records[] = $row;
}
$stmt->close();

echo json_encode(["success" => true, "records" => $records]);
