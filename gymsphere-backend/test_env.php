<?php
header("Content-Type: text/plain");

// Try reading the Hugging Face token
$token = getenv("HF_TOKEN");

if ($token) {
    echo "HF_TOKEN is set ✅\n";
    echo "Value: " . substr($token, 0, 10) . "... (hidden for safety)";
} else {
    echo "❌ HF_TOKEN is NOT set. Restart Apache and try again.";
}
