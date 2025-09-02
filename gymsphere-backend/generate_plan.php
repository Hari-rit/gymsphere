<?php
function generate_plan($form_id, $conn) {
    // Fetch member form data
    $stmt = $conn->prepare("SELECT * FROM member_forms WHERE id = ?");
    $stmt->bind_param("i", $form_id);
    $stmt->execute();
    $result = $stmt->get_result();
    $form = $result->fetch_assoc();

    if (!$form) {
        return false; // Form not found
    }

    // Placeholder logic for plan generation
    $workout_plan = "Workout Plan:\n";
    $diet_plan = "Diet Plan:\n";

    // Adjust workout based on experience
    if ($form['worked_out_before'] === 'yes' && $form['experience_years'] >= 5) {
        $workout_plan .= "- Advanced 6x/week Push/Pull/Legs routine with progressive overload.\n";
        $diet_plan .= "- High protein (2g/kg), moderate carbs, healthy fats, advanced plan.\n";
    } else {
        $workout_plan .= "- Beginner 3x/week full-body workout.\n";
        $diet_plan .= "- High protein (1.5g/kg), balanced carbs, healthy fats.\n";
    }

    // Insert into plans table
    $stmt2 = $conn->prepare("INSERT INTO plans (member_form_id, workout_plan, diet_plan, approved_by_trainer) VALUES (?, ?, ?, 1)");
    $stmt2->bind_param("iss", $form_id, $workout_plan, $diet_plan);
    $stmt2->execute();

    return true;
}
?>
