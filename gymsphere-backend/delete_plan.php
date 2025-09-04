<?php
// delete_plan.php
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

$plan_id = $input["plan_id"] ?? null;

if (!$plan_id) {
    echo json_encode([
        "success" => false,
        "error"   => "Missing plan_id"
    ]);
    exit;
}

// Prepare delete statement
$stmt = $conn->prepare("DELETE FROM plans WHERE id = ?");
if (!$stmt) {
    echo json_encode([
        "success" => false,
        "error"   => "❌ Prepare failed: " . $conn->error
    ]);
    exit;
}

$stmt->bind_param("i", $plan_id);
$ok = $stmt->execute();
$stmt->close();

if ($ok) {
    echo json_encode([
        "success" => true,
        "message" => "🗑️ Plan deleted successfully"
    ]);
} else {
    echo json_encode([
        "success" => false,
        "error"   => "❌ Failed to delete plan: " . $conn->error
    ]);
}
?>
