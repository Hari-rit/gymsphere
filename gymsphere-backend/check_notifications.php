<?php
require 'config.php';

// Today’s date
$today = date('Y-m-d');
$day = date('j');
$month = date('n');
$year = date('Y');

// 1️⃣ Member Payment Notifications
$res = $mysqli->query("SELECT id, username FROM users WHERE role='member'");
while ($m = $res->fetch_assoc()) {
    $user_id = $m['id'];

    // check if paid this month
    $stmt = $mysqli->prepare("SELECT COUNT(*) as cnt FROM payments WHERE user_id=? AND status='success' AND MONTH(created_at)=? AND YEAR(created_at)=?");
    $stmt->bind_param("iii", $user_id, $month, $year);
    $stmt->execute();
    $cnt = $stmt->get_result()->fetch_assoc()['cnt'];
    $stmt->close();

    if ($cnt == 0 && $day > 5) {
        $msg = "⚠️ Monthly fee not paid for " . date('F Y') . ". Please pay to continue.";
        $stmt2 = $mysqli->prepare("INSERT INTO notifications (user_id, type, message) VALUES (?, 'payment', ?)");
        $stmt2->bind_param("is", $user_id, $msg);
        $stmt2->execute();
        $stmt2->close();
    }
}

// 2️⃣ Trainer Workout Renewal Notifications
$sql = "
SELECT p.id, mf.user_id, mf.name as member_name, mf.assigned_trainer_id, p.created_at
FROM plans p
JOIN member_forms mf ON mf.id = p.member_form_id
WHERE p.approved_by_trainer = 1
";
$res2 = $mysqli->query($sql);

while ($row = $res2->fetch_assoc()) {
    $plan_date = strtotime($row['created_at']);
    $days_passed = (time() - $plan_date) / (60*60*24);

    if ($days_passed > 30 && $row['assigned_trainer_id']) {
        $trainer_id = $row['assigned_trainer_id'];
        $msg = "⚠️ Member {$row['member_name']}'s workout plan is due for renewal.";
        $stmt3 = $mysqli->prepare("INSERT INTO notifications (user_id, type, message) VALUES (?, 'renewal', ?)");
        $stmt3->bind_param("is", $trainer_id, $msg);
        $stmt3->execute();
        $stmt3->close();
    }
}

echo "✅ Notifications check completed!";
