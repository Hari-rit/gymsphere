<?php
// Prevent PHP timeout
set_time_limit(0);

require_once "generate_plan.php";  // reuse call_ollama_api()

// Allow passing a custom prompt and model via URL
$prompt = isset($_GET['prompt']) ? $_GET['prompt'] : "Write one short motivational gym quote.";
$model  = isset($_GET['model'])  ? $_GET['model']  : "mistral"; // default to mistral

// Call Ollama API
$response = call_ollama_api($prompt, $model);

// Output as JSON
header("Content-Type: application/json");
echo json_encode([
    "input_prompt" => $prompt,
    "model"        => $model,
    "response"     => $response
], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
