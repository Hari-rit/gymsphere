<?php
// create_admin.php
// Run this ONCE to create your admin account

$servername = "localhost";
$username = "root";     // your MySQL username
$password = "";         // your MySQL password (leave empty if default XAMPP)
$dbname = "gymsphere";       // your database name

// === CHANGE THESE TWO VALUES TO YOUR EMAIL + PASSWORD ===
$adminEmail = "hk50165@gmail.com";   // <-- replace with your email
$adminPassword = "Hari@2003";           // <-- replace with desired password

try {
    // Connect to DB
    $conn = new mysqli($servername, $username, $password, $dbname);

    if ($conn->connect_error) {
        die("❌ Connection failed: " . $conn->connect_error);
    }

    // Check if admin already exists
    $check = $conn->prepare("SELECT * FROM users WHERE email = ?");
    $check->bind_param("s", $adminEmail);
    $check->execute();
    $result = $check->get_result();

    if ($result->num_rows > 0) {
        echo "⚠️ Admin with this email already exists.\n";
    } else {
        // Hash the password
        $hashedPassword = password_hash($adminPassword, PASSWORD_DEFAULT);

        // Insert new admin
        $stmt = $conn->prepare("INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, 'admin')");
        $adminUsername = "admin"; // or your name
        $stmt->bind_param("sss", $adminUsername, $adminEmail, $hashedPassword);

        if ($stmt->execute()) {
            echo "✅ Admin account created successfully!\n";
            echo "📧 Email: $adminEmail\n";
            echo "🔑 Password: $adminPassword\n";
        } else {
            echo "❌ Error: " . $stmt->error;
        }

        $stmt->close();
    }

    $check->close();
    $conn->close();

} catch (Exception $e) {
    echo "❌ Exception: " . $e->getMessage();
}
?>
