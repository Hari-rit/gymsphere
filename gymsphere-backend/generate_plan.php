<?php
// =============================================
// generate_plan.php
// =============================================

// Prevent PHP timeout (0 = unlimited)
set_time_limit(0);

// Force JSON response
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

// Handle preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Prevent PHP notices/warnings from polluting JSON
error_reporting(E_ALL);
ini_set('display_errors', 0);

/**
 * Ollama API (local inference)
 * - Runs against http://localhost:11434/api/generate
 * - Uses models you’ve pulled with `ollama pull`
 */
function call_ollama_api(string $prompt, string $model = "mistral"): array {
    $apiUrl = "http://localhost:11434/api/generate";

    $postData = [
        "model"  => $model,
        "prompt" => $prompt,
        "stream" => false // full response at once
    ];

    $ch = curl_init($apiUrl);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER => ["Content-Type: application/json"],
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => json_encode($postData, JSON_UNESCAPED_UNICODE),
        CURLOPT_TIMEOUT => 900 // wait up to 15 min
    ]);
    $response = curl_exec($ch);
    $curlErr  = curl_error($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($curlErr) {
        return ["success" => false, "error" => "cURL error: {$curlErr}", "http_code" => $httpCode];
    }

    $data = json_decode($response, true);

    // ✅ Fix: Ollama sometimes returns string or array, not always "response"
    $text = null;
    if (is_array($data)) {
        if (isset($data["response"])) {
            $text = $data["response"];
        } elseif (isset($data[0]["response"])) {
            $text = $data[0]["response"];
        }
    } elseif (is_string($response)) {
        $text = $response; // fallback plain text
    }

    if (!$text) {
        return [
            "success" => false,
            "error"   => "Unexpected Ollama response",
            "http_code" => $httpCode,
            "raw" => $response
        ];
    }

    return ["success" => true, "text" => $text, "http_code" => $httpCode];
}

function generate_plan($form_id, $level, $conn) {
    // 1) Fetch member form data
    $stmt = $conn->prepare("SELECT * FROM member_forms WHERE id = ?");
    if (!$stmt) {
        return ["success" => false, "error" => "DB prepare failed: " . $conn->error];
    }

    $stmt->bind_param("i", $form_id);
    $stmt->execute();
    $result = $stmt->get_result();
    $form = $result->fetch_assoc();
    $stmt->close();

    if (!$form) {
        return ["success" => false, "error" => "Member form not found"];
    }

    // Normalize fields
    $health = trim((string)($form['health_issues'] ?? ''));
    if ($health === '' || strtolower($health) === 'none') $health = 'None';
    $worked = ($form['worked_out_before'] ?? 'no') ?: 'no';

    // 2) Level-specific requirements
    $level = strtolower((string)$level);
    switch ($level) {
        case 'intermediate':
            $dietReq    = "High protein, moderate carbs, structured meal timing.";
            $workoutReq = "Intermediate: Split workouts (Chest & Triceps, Back & Biceps, Legs & Core, Shoulders & Abs, Full Body/Conditioning). Include strength and hypertrophy balance.";
            break;
        case 'advanced':
            $dietReq    = "Performance-focused, precise macros, pre/post workout nutrition.";
            $workoutReq = "Advanced: One muscle group per day (Chest, Back, Legs, Shoulders, Arms, Conditioning/Power). Higher volume with progressive overload.";
            break;
        case 'beginner':
        default:
            $level      = 'beginner';
            $dietReq    = "Balanced, simple meals with steady protein intake.";
            $workoutReq = "Beginner: Full-body workout every day (Mon–Sat), Sunday rest. Simple compound lifts and light accessories.";
            break;
    }

    // 3) Build the final prompt
    $prompt = "Generate a personalized gym workout and diet plan.

Member details:
Name: {$form['name']}
Age: {$form['age']}
Height: {$form['height']} cm
Weight: {$form['weight']} kg
Goal: {$form['goal']}
Experience: {$form['experience_years']} years, {$form['experience_months']} months
Worked out before: {$worked}
Health issues: {$health}

Workout requirement: {$workoutReq}
Diet requirement: {$dietReq}

Output format:
WORKOUT PLAN:
Monday: ...
Tuesday: ...
Wednesday: ...
Thursday: ...
Friday: ...
Saturday: ...
Sunday: ...

DIET PLAN:
Breakfast: ...
Lunch: ...
Dinner: ...
Snacks: ...
";

    // 4) Call Ollama API
    $resp = call_ollama_api($prompt);
    if (!$resp["success"]) {
        return [
            "success" => false,
            "error"   => $resp["error"],
            "http_code" => ($resp["http_code"] ?? null),
            "raw" => $resp["raw"] ?? null
        ];
    }
    $text = $resp["text"];

    // 5) Parse AI response into workout/diet using regex
    $workout_plan = "";
    $diet_plan = "";

    if (preg_match("/WORKOUT PLAN:(.*?)(?=DIET PLAN:|$)/is", $text, $matches)) {
        $workout_plan = "WORKOUT PLAN:\n" . trim($matches[1]);
    }
    if (preg_match("/DIET PLAN:(.*)$/is", $text, $matches)) {
        $diet_plan = "DIET PLAN:\n" . trim($matches[1]);
    }

    // If parsing fails, fallback to raw text
    if ($workout_plan === "" && $diet_plan === "") {
        $workout_plan = $text;
        $diet_plan = "(No separate diet section found)";
    }

    // ✅ Do NOT save yet, just return for trainer review
    return [
        "success" => true,
        "member_form_id" => (int)$form_id,
        "level" => $level,
        "workout_plan" => $workout_plan,
        "diet_plan" => $diet_plan,
        "message" => "Plan generated. Review and save to confirm."
    ];
}

/* ===================================================
   HTTP ENTRY POINT (API for frontend fetch)
   =================================================== */

try {
    require_once __DIR__ . "/db.php"; // defines $conn

    // Read JSON input
    $input = json_decode(file_get_contents("php://input"), true);
    if (!$input || !isset($input["form_id"])) {
        echo json_encode(["success" => false, "error" => "Missing form_id"]);
        exit;
    }

    $form_id = (int)$input["form_id"];
    $level   = $input["level"] ?? "beginner";

    // Call generator
    $result = generate_plan($form_id, $level, $conn);

    // Output JSON
    echo json_encode($result, JSON_UNESCAPED_UNICODE);

} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "error"   => "Server exception: " . $e->getMessage()
    ]);
}
?>
