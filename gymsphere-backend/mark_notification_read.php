<?php
session_start();

/* CORS + JSON */
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

/* Auth */
if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

$user_id = (int)$_SESSION['user_id'];

/* Parse JSON body safely */
$raw = file_get_contents("php://input");
$body = json_decode($raw, true);
if (!is_array($body)) $body = [];

/* Mark ALL as read */
if (!empty($body['all'])) {
    $stmt = $conn->prepare("UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0");
    if (!$stmt) {
        echo json_encode(['success' => false, 'message' => 'SQL prepare failed: ' . $conn->error]);
        exit;
    }
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $affected = $stmt->affected_rows;
    $stmt->close();

    echo json_encode(['success' => true, 'updated' => $affected]);
    exit;
}

/* Mark specific IDs as read */
if (!empty($body['ids']) && is_array($body['ids'])) {
    $ids = array_map('intval', $body['ids']);
    if (count($ids) === 0) {
        echo json_encode(['success' => false, 'message' => 'No valid ids provided']);
        exit;
    }
    $placeholders = implode(',', array_fill(0, count($ids), '?'));
    $sql = "UPDATE notifications SET is_read = 1 WHERE user_id = ? AND id IN ($placeholders)";

    $stmt = $conn->prepare($sql);
    if (!$stmt) {
        echo json_encode(['success' => false, 'message' => 'SQL prepare failed: ' . $conn->error]);
        exit;
    }

    $types = str_repeat('i', count($ids) + 1);
    $params = array_merge([$user_id], $ids);

    $bind = [];
    $bind[] = &$types;
    foreach ($params as $k => $v) $bind[] = &$params[$k];
    call_user_func_array([$stmt, 'bind_param'], $bind);

    $stmt->execute();
    $affected = $stmt->affected_rows;
    $stmt->close();

    echo json_encode(['success' => true, 'updated' => $affected]);
    exit;
}

echo json_encode(['success' => false, 'message' => 'Invalid request (no action)']);
exit;
