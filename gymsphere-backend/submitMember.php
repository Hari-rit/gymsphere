<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");

include "db.php";

if (empty($_POST)) {
    echo json_encode(["success" => false, "message" => "No input received"]);
    exit;
}

// Extract text fields
$user_id = intval($_POST["user_id"]);
$name = $_POST["name"];
$age = intval($_POST["age"]);
$height = floatval($_POST["height"]);
$weight = floatval($_POST["weight"]);
$goal = $_POST["fitness_goal"];
$issues = !empty($_POST["health_issues"]) ? $_POST["health_issues"] : NULL;
$years = intval($_POST["experience_years"]);
$months = intval($_POST["experience_months"]);

// Handle multiple file uploads
$uploadedFiles = [];
if (!empty($_FILES["images"]["name"][0])) {
    $uploadDir = "uploads/";
    if (!is_dir($uploadDir)) mkdir($uploadDir, 0777, true);

    foreach ($_FILES["images"]["name"] as $key => $name) {
        $tmp_name = $_FILES["images"]["tmp_name"][$key];
        $fileName = time() . "_" . basename($name);
        $targetFile = $uploadDir . $fileName;

        if (move_uploaded_file($tmp_name, $targetFile)) {
            $uploadedFiles[] = $fileName;
        }
    }
}

// Store all uploaded file names as JSON string
$uploadedFilesJson = json_encode($uploadedFiles);

$sql = "INSERT INTO member_details 
        (user_id, name, age, height, weight, fitness_goal, health_issues, experience_years, experience_months, body_image) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

$stmt = $conn->prepare($sql);
$stmt->bind_param("isddssiiis", $user_id, $name, $age, $height, $weight, $goal, $issues, $years, $months, $uploadedFilesJson);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Details saved successfully"]);
} else {
    echo json_encode(["success" => false, "message" => $stmt->error]);
}
?>
