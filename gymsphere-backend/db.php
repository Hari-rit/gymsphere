<?php
$host = "localhost";
$user = "root";
$pass = "";
$dbname = "gymsphere";

// Create connection
$conn = new mysqli($host, $user, $pass, $dbname);

// Check connection
if ($conn->connect_error) {
    die(json_encode(['success' => false, 'message' => 'Database connection failed: ' . $conn->connect_error]));
}
//new additions 02-09;;
// Set charset to UTF-8
$conn->set_charset("utf8mb4");

// Optional: Enable error reporting for debugging
mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);
?>
