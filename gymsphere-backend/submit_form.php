<?php
// --- CORS headers ---
header("Access-Control-Allow-Origin: http://localhost:3000"); // React frontend origin
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json");

// --- Handle preflight OPTIONS request ---
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// --- Session setup ---
$timeout_duration = 1800; // 🔄 30 minutes
ini_set('session.gc_maxlifetime', $timeout_duration);
session_set_cookie_params([
    'lifetime' => $timeout_duration,
    'path' => '/',
    'domain' => 'localhost',
    'secure' => false,
    'httponly' => true,
    'samesite' => 'Lax'
]);
session_start();

include 'db.php';

// --- Only logged-in members can submit ---
if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'member') {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

// --- Get JSON input from React ---
$data = json_decode(file_get_contents('php://input'), true);

// --- Validate required fields ---
$required = ['name', 'age', 'height', 'weight', 'goal', 'worked_out_before'];
foreach ($required as $field) {
    if (!isset($data[$field]) || $data[$field] === '') {
        echo json_encode(['success' => false, 'message' => "$field is required"]);
        exit;
    }
}

// --- Assign values (optional fields handled safely) ---
$name = $data['name'];
$age = (int)$data['age'];
$height = (float)$data['height'];
$weight = (float)$data['weight'];
$goal = $data['goal'];
$health_issues = $data['health_issues'] ?? '';
$worked_out_before = $data['worked_out_before'];
$experience_years = isset($data['experience_years']) ? (int)$data['experience_years'] : 0;
$experience_months = isset($data['experience_months']) ? (int)$data['experience_months'] : 0;

// --- Insert into member_forms table ---
$stmt = $conn->prepare("INSERT INTO member_forms
    (user_id, name, age, height, weight, goal, health_issues, worked_out_before, experience_years, experience_months)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
$stmt->bind_param(
    "isddsssiis",
    $_SESSION['user_id'],
    $name,
    $age,
    $height,
    $weight,
    $goal,
    $health_issues,
    $worked_out_before,
    $experience_years,
    $experience_months
);

// --- Response ---
if ($stmt->execute()) {
    echo json_encode(['success' => true, 'message' => 'Form submitted successfully']);
} else {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $conn->error]);
}
?>
