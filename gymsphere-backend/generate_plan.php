<?php
// Prevent PHP timeout (0 = unlimited)
set_time_limit(0);

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
        return ["success" => false, "error" => "Unexpected Ollama response", "http_code" => $httpCode, "raw" => $response];
    }

    return ["success" => true, "text" => $text, "http_code" => $httpCode];
}

function generate_plan($form_id, $level, $conn) {
    // 1) Fetch member form data
    $stmt = $conn->prepare("SELECT * FROM member_forms WHERE id = ?");
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

    // 6) Insert into plans table
    $stmt2 = $conn->prepare("INSERT INTO plans (member_form_id, workout_plan, diet_plan, approved_by_trainer) VALUES (?, ?, ?, 1)");
    $stmt2->bind_param("iss", $form_id, $workout_plan, $diet_plan);
    $ok = $stmt2->execute();
    $stmt2->close();

    if (!$ok) {
        return ["success" => false, "error" => "Failed to save plan"];
    }

    return [
        "success" => true,
        "member_form_id" => (int)$form_id,
        "level" => $level,
        "workout_plan" => $workout_plan,
        "diet_plan" => $diet_plan
    ];
}
?>
