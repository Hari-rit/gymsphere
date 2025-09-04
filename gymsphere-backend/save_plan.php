<?php
// save_plan.php
header("Content-Type: application/json");

// ---- CORS for React ----
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// Handle preflight (OPTIONS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once "db.php"; // ✅ correct DB connection file

// Read JSON input
$input = json_decode(file_get_contents("php://input"), true);

if (!$input) {
    echo json_encode(["success" => false, "error" => "Invalid JSON input"]);
    exit;
}

// Accept both `form_id` and `user_id` for safety
$form_id       = $input["form_id"] ?? ($input["user_id"] ?? null);
$workout_plan  = $input["workout_plan"] ?? "";
$diet_plan     = $input["diet_plan"] ?? "";

if (!$form_id || !$workout_plan || !$diet_plan) {
    echo json_encode([
        "success" => false,
        "error"   => "Missing required fields",
        "debug"   => $input // helpful for debugging frontend mismatch
    ]);
    exit;
}

// Insert into DB
$stmt = $conn->prepare("INSERT INTO plans (member_form_id, workout_plan, diet_plan, approved_by_trainer) VALUES (?, ?, ?, 1)");
if (!$stmt) {
    echo json_encode([
        "success" => false,
        "error"   => "❌ Prepare failed: " . $conn->error
    ]);
    exit;
}

$stmt->bind_param("iss", $form_id, $workout_plan, $diet_plan);
$ok = $stmt->execute();
$plan_id = $conn->insert_id;
$stmt->close();

if ($ok) {
    echo json_encode([
        "success" => true,
        "message" => "✅ Plan saved successfully",
        "plan_id" => $plan_id
    ]);
} else {
    echo json_encode([
        "success" => false,
        "error"   => "❌ Database insert failed: " . $conn->error
    ]);
}
?>
