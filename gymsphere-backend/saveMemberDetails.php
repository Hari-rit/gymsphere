<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");

include "db.php"; // your DB connection

$data = json_decode(file_get_contents("php://input"), true);

if (!$data) {
    echo json_encode(["success" => false, "message" => "No input received"]);
    exit;
}

$user_id = $data["user_id"];
$name = $data["name"];
$age = $data["age"];
$height = $data["height"];
$weight = $data["weight"];
$goal = $data["fitness_goal"];
$issues = $data["health_issues"];
$years = $data["experience_years"];
$months = $data["experience_months"];
$image = $data["body_image"]; // optional (file upload handling can be added later)

$sql = "INSERT INTO member_details 
        (user_id, name, age, height, weight, fitness_goal, health_issues, experience_years, experience_months, body_image) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

$stmt = $conn->prepare($sql);
$stmt->bind_param("isiddssiss", $user_id, $name, $age, $height, $weight, $goal, $issues, $years, $months, $image);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Details saved successfully"]);
} else {
    echo json_encode(["success" => false, "message" => $stmt->error]);
}
?>
