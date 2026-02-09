
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
    create_new_game_entry,
    get_profile_information
 } from './db_operations.js'

//Login Prüüfen
console.log('Checking login requirement...')
await login_requirement_check()



console.log('your_dashboard.js')
// Userdata auslesen (bleibt konstant)
const user_data = await get_user_data_by_uuid();

const dashboard_heading = document.getElementById("your_dashboard_heading");
dashboard_heading.textContent = `Dashboard von ${user_data.username} `

async function update_profile_information() {
    const profile_username = document.getElementById("profile_username");
    const played_games_count = document.getElementById("played_games_count");
    const won_games_count = document.getElementById("won_games_count");
    const lost_games_count = document.getElementById("lost_games_count");
    const winning_rate = document.getElementById("winning_rate");

    const {playedGames, lostGames, wonGames, winningRate} = await get_profile_information(user_data.player_id);

    profile_username.textContent = user_data.username;
    played_games_count.textContent = playedGames;
    won_games_count.textContent = wonGames;
    lost_games_count.textContent = lostGames;
    winning_rate.textContent = winningRate + "%";
}

await update_profile_information()