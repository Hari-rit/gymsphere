<?php
// test_ollama.php
// Simple PHP script to test Ollama from XAMPP

header("Content-Type: application/json");

$prompt = "Write one short motivational gym quote.";

// Ollama API endpoint (local server)
$apiUrl = "http://localhost:11434/api/generate";

$postData = [
    "model" => "mistral",
    "prompt" => $prompt,
    "stream" => false // set true for chunked responses
];

$ch = curl_init($apiUrl);
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER => ["Content-Type: application/json"],
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => json_encode($postData),
    CURLOPT_TIMEOUT => 120 // 2 minutes max
]);

$response = curl_exec($ch);
$curlErr = curl_error($ch);
curl_close($ch);

if ($curlErr) {
    echo json_encode(["success" => false, "error" => "cURL error: $curlErr"]);
    exit;
}

$data = json_decode($response, true);

if (!isset($data["response"])) {
    echo json_encode([
        "success" => false,
        "error" => "Unexpected response",
        "raw" => $data
    ]);
    exit;
}

echo json_encode([
    "success" => true,
    "prompt" => $prompt,
    "output" => $data["response"]
], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
