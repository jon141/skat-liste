
import { supabase } from './supabase.js'

const new_password_input = document.getElementById("new_password_input");
const change_password_button = document.getElementById("change_password_button");
const change_password_output = document.getElementById("change_password_output");

change_password_button.addEventListener("click", async () => {
    change_password_output.textContent = "";
    const new_password = new_password_input.value;

    if (new_password.length < 6) {
        change_password_output.textContent = "Das Passwort muss mindestens 6 Zeichen lang sein.";
        return;
    }
    const { data, error } = await supabase.auth.updateUser({
        password: new_password
    });

    if (error) {
    console.error("Passwort ändern fehlgeschlagen:", error.message)
    } else {
    console.log("Passwort erfolgreich geändert")
    change_password_output.textContent = "Passwort erfolgreich geändert!";
    }

})

