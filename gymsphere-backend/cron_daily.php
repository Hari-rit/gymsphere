<?php
// cron_daily.php
require 'config.php';

// 1) Fee reminders
$day = (int)date('j');

// send reminder on 1st (initial) and on 6th (overdue) — adjust logic as you prefer
if ($day === 1 || $day === 6) {
    // find all members who don't have success payment this month
    $sql = "SELECT id FROM users WHERE role='member' AND NOT EXISTS (
               SELECT 1 FROM payments p WHERE p.user_id=users.id AND p.status='success' AND " . current_month_where() . "
            )";
    $res = $mysqli->query($sql);
    while ($u = $res->fetch_assoc()){
        $uid = (int)$u['id'];
        $msg = $day === 1 ? "Your monthly fee is due. Please pay before 5th to keep access." : "Your monthly fee is overdue. Please pay now to avoid loss of access.";
        $ins = $mysqli->prepare("INSERT INTO notifications (user_id, type, message, is_read) VALUES (?, 'payment_due', ?, 0)");
        $ins->bind_param('is',$uid,$msg);
        $ins->execute();
        $ins->close();
    }
}

// 2) Trainer reminders: plans older than 30 days
$sql2 = "SELECT p.id AS plan_id, m.assigned_trainer_id, m.user_id, m.name, p.created_at
         FROM plans p
         JOIN member_forms m ON m.id = p.member_form_id
         WHERE p.created_at <= DATE_SUB(NOW(), INTERVAL 30 DAY)";
$res2 = $mysqli->query($sql2);
while ($row = $res2->fetch_assoc()){
    $trainer_id = $row['assigned_trainer_id'];
    if (!$trainer_id) continue;
    $memberName = $mysqli->real_escape_string($row['name']);
    $msg = "Member {$memberName}'s workout plan is > 1 month old. Please review and update.";
    $ins = $mysqli->prepare("INSERT INTO notifications (user_id, type, message, is_read) VALUES (?, 'trainer_reminder', ?, 0)");
    $ins->bind_param('is', $trainer_id, $msg);
    $ins->execute();
    $ins->close();
}

echo "cron done\n";
