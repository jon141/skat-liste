
import { supabase } from './supabase.js'
import { login_requirement_check, 
    log_groups, 
    create_new_group, 
    get_user_data_by_uuid,
    get_users_group_ids,
    get_groupnames_by_group_ids,
    get_all_player_data,
    get_groupmember_ids,
    get_playername_by_id,
    create_new_game_entry
 } from './db_operations.js'

//Login Prüüfen
console.log('Checking login requirement...')
await login_requirement_check()
await log_groups()
//await create_new_group('Testgruppe', [4, 5, 6])
//await log_groups()



console.log('main.js')
// Userdata auslesen (bleibt konstant)
const user_data = await get_user_data_by_uuid();

async function update_group_select() {
    const user_group_ids = await get_users_group_ids(user_data.player_id);
    const user_group_names = await get_groupnames_by_group_ids(user_group_ids);

    console.log("User Group IDs:", user_group_ids);
    console.log("User Group Names:", user_group_names);

    // Füllt die Kombobox beim neuen Eintrag mit den gruppen in denen user mitglied ist
    const group_select = document.getElementById("group_select");

    for (let i = 0; i < user_group_ids.length; i++) {
        const option = document.createElement("option");

        option.value = user_group_ids[i];
        option.textContent = user_group_names[i];
        group_select.appendChild(option);

    }

}


// die checkboxen mit den Spielernamen in der Gruppe füllen füllen
async function update_looser_selection() {
    console.log("Updating looser selection...");

    const selected_group = document.getElementById("group_select").value;
    const player_ids_in_group = await get_groupmember_ids(selected_group);

    console.log("Selected group:", selected_group);
    console.log("Player IDs:", player_ids_in_group);


    const groupmember_selection_div = document.getElementById("looser_selection");
    groupmember_selection_div.replaceChildren();

    //const all_player_data = await get_all_player_data();

    for (let i = 0; i < player_ids_in_group.length; i++) {

        const player_id = player_ids_in_group[i];
        const player_name = await get_playername_by_id(player_id);

        console.log("Player ID:", player_id);
        console.log("Player Name:", player_name);

        
        const label = document.createElement("label");
        const checkbox = document.createElement("input");

        checkbox.type = "checkbox";
        checkbox.value = player_id;
        checkbox.name = "losers";

        label.appendChild(checkbox);
        label.append(" " + player_name);

        groupmember_selection_div.appendChild(label);
        groupmember_selection_div.appendChild(document.createElement("br"));}

}



async function update_add_member_selection() {
    console.log("   Updating add member selection...");

    const all_player_data = await get_all_player_data();

    console.log("   All Player Data:", all_player_data);


    const groupmember_adds_div = document.getElementById("groupmember_adds");
    groupmember_adds_div.replaceChildren();

    //const all_player_data = await get_all_player_data();

    for (let i = 0; i < all_player_data.length; i++) {
        
        const player_id = all_player_data[i].player_id;
        const player_name = all_player_data[i].username;

        if (user_data.player_id == player_id) {
            continue; // Skip the current user from the member list
        }


        console.log("   Player ID:", player_id);
        console.log("   Player Name:", player_name);

        
        const label = document.createElement("label");
        const checkbox = document.createElement("input");

        checkbox.type = "checkbox";
        checkbox.value = player_id;
        checkbox.name = "members";

        label.appendChild(checkbox);
        label.append(" " + player_name);

        groupmember_adds_div.appendChild(label);
        groupmember_adds_div.appendChild(document.createElement("br"));}

}

async function load_entry_data_and_create() {
    console.log("Loading entry data and creating...");

    const selected_group = document.getElementById("group_select").value;
    const selected_losers = Array.from(document.querySelectorAll('input[name="losers"]:checked')).map(cb => cb.value);
    const points = document.getElementById("points_input").value;
    const comment = document.getElementById("new_entry_comment_input").value;

    console.log("       Selected group:", selected_group);
    console.log("       Selected losers:", selected_losers);
    console.log("       Points:", points);
    console.log("       Comment:", comment);

    if (selected_losers.length === 1 || selected_losers.length === 2) {
        create_new_game_entry(selected_group, selected_losers, points, comment);
    } else {
        alert("You must select either 1 or 2 losers.");
    }

}

async function load_new_group_data_and_create() {
    console.log("Loading entry data and creating...");

    const groupname = document.getElementById("new_group_name").value;
    const selected_members = Array
        .from(document.querySelectorAll('input[name="members"]:checked'))
        .map(cb => cb.value);

    selected_members.push(user_data.player_id);

    if (groupname === "") return;

    console.log("Creating new group...");
    const success = await create_new_group(groupname, selected_members);
    console.log("Group creation success:", success);

    //if (!success) {
    //    alert("Failed to create group. Name may already exist.");
    //    return;
    //}

    await update_group_select();
    await update_looser_selection();
    document.getElementById("new_group_name").value = "";
}


const username = user_data.username;
const welcome_heading = document.getElementById("welcome_heading");
welcome_heading.innerHTML = `Hallo <span class="username">${username}</span>!`;

await update_group_select()//
await update_looser_selection()
await update_add_member_selection()

const group_select = document.getElementById("group_select");
const add_entry_button = document.getElementById("add_entry_button");
const create_group_button = document.getElementById("create_group_button");

group_select.addEventListener("change", async () => {
  await update_looser_selection();
});

add_entry_button.addEventListener("click", async () => {
  await load_entry_data_and_create();
});

create_group_button.addEventListener("click", async () => {
  await load_new_group_data_and_create();
});

