<?php
// config.php
// Put this in gymsphere-backend/

$dbHost = '127.0.0.1';
$dbUser = 'root';
$dbPass = '';      // change if you use a password
$dbName = 'gymsphere';
$baseUrl = 'http://localhost:100/gymsphere-backend'; // optional

$mysqli = new mysqli($dbHost, $dbUser, $dbPass, $dbName);
if ($mysqli->connect_errno) {
    http_response_code(500);
    echo json_encode(['error' => 'DB connection failed: '.$mysqli->connect_error]);
    exit;
}

function json_response($data){
    header('Content-Type: application/json');
    echo json_encode($data);
    exit;
}

// helper: current month/year string for SQL
function current_month_where(){
    return " MONTH(created_at)=MONTH(CURDATE()) AND YEAR(created_at)=YEAR(CURDATE()) ";
}
