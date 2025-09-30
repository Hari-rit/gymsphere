<?php
// dummy_complete_payment.php
require 'config.php';
session_start();

$input = json_decode(file_get_contents('php://input'), true) ?: $_POST;
if (!isset($input['payment_id']) || !isset($input['result'])) {
    http_response_code(400);
    json_response(['error'=>'payment_id and result required (result=success|failed)']);
}

$payment_id = (int)$input['payment_id'];
$result = $input['result'] === 'success' ? 'success' : 'failed';

// load payment + ensure belongs to user (optional safety)
$stmt = $mysqli->prepare("SELECT user_id, amount FROM payments WHERE id=?");
$stmt->bind_param('i', $payment_id);
$stmt->execute();
$res = $stmt->get_result();
if ($res->num_rows === 0){
    http_response_code(404);
    json_response(['error'=>'Payment not found']);
}
$row = $res->fetch_assoc();
$owner_id = (int)$row['user_id'];
$amount = $row['amount'];
$stmt->close();

// optionally check session user == owner (skip if admin/test)
if (isset($_SESSION['user_id']) && $_SESSION['user_id'] !== $owner_id){
    // allow admins later
    // http_response_code(403); json_response(['error'=>'Not authorized']);
}

$txn = $mysqli->begin_transaction(MYSQLI_TRANS_START_READ_WRITE);
$upd = $mysqli->prepare("UPDATE payments SET status=?, transaction_id=? WHERE id=?");
$txn_id = uniqid('DUMMY_', true);
$upd->bind_param('ssi', $result, $txn_id, $payment_id);
$ok = $upd->execute();
$upd->close();

if (!$ok) {
    $mysqli->rollback();
    http_response_code(500);
    json_response(['error'=>'Failed to update payment']);
}

// create notification for the user
$notif_msg = $result === 'success' ? "Payment of ₹{$amount} received. Thank you!" : "Payment failed for ₹{$amount}. Please try again.";
$ins = $mysqli->prepare("INSERT INTO notifications (user_id, type, message, is_read) VALUES (?, 'payment', ?, 0)");
$ins->bind_param('is', $owner_id, $notif_msg);
$ins->execute();
$ins->close();

$mysqli->commit();

json_response([
  'status'=>'ok',
  'payment_id'=>$payment_id,
  'result'=>$result,
  'transaction_id'=>$txn_id
]);
