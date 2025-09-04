<?php
// update_plan.php
header("Content-Type: application/json");

// ---- CORS ----
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// Handle preflight (OPTIONS) request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once "db.php"; // ✅ unify connection file

// Read JSON input
$input = json_decode(file_get_contents("php://input"), true);

if (!$input) {
    echo json_encode(["success" => false, "error" => "Invalid JSON input"]);
    exit;
}

$plan_id       = $input["plan_id"] ?? null;
$workout_plan  = $input["workout_plan"] ?? "";
$diet_plan     = $input["diet_plan"] ?? "";

// Validate required fields
if (!$plan_id || !$workout_plan || !$diet_plan) {
    echo json_encode([
        "success" => false,
        "error"   => "Missing required fields",
        "debug"   => $input
    ]);
    exit;
}

// Prepare update statement
$stmt = $conn->prepare("UPDATE plans SET workout_plan = ?, diet_plan = ? WHERE id = ?");
if (!$stmt) {
    echo json_encode([
        "success" => false,
        "error"   => "❌ Prepare failed: " . $conn->error
    ]);
    exit;
}

$stmt->bind_param("ssi", $workout_plan, $diet_plan, $plan_id);
$ok = $stmt->execute();
$stmt->close();

if ($ok) {
    echo json_encode([
        "success" => true,
        "message" => "✅ Plan updated successfully"
    ]);
} else {
    echo json_encode([
        "success" => false,
        "error"   => "❌ Failed to update plan: " . $conn->error
    ]);
}
?>
