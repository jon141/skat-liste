

import { supabase } from './supabase.js'
import { login_requirement_check, 
         get_all_game_entries,
         get_looser_and_scores_by_game_entry_id,
         get_playername_by_id,
         get_groupname_by_id,
         del_game_entry,
         is_user_admin
 } from './db_operations.js'

//Login Prüüfen
console.log('Checking login requirement...')
await login_requirement_check()



console.log('gameview.js')

const games_container = document.getElementById("games_container");




const all_games = await get_all_game_entries()
console.log(all_games)
console.log(typeof all_games)

for (const element of all_games) {

    const game_id = element.game_entry_id

    const looser_and_scores = await get_looser_and_scores_by_game_entry_id(game_id)
    
    let game_loosers = []
    const game_score = looser_and_scores[0].points

    looser_and_scores.forEach(entry => {
        //console.log(entry.player_id, get_playername_by_id(entry.player_id), entry.points)
        game_loosers.push(entry.player_id)
    })

    const groupname = await get_groupname_by_id(element.group_id);

    const date = new Date(element.created_at);

    let game_info_div = document.createElement("div");
    game_info_div.className = "game-info";
    game_info_div.id = `game_${game_id}`;

    const game_title = document.createElement("h3");
    game_title.id = "game_title";
    game_title.innerHTML = `<span style="color: rgb(18, 44, 49);">${groupname}</span>   <span style="color: rgb(35, 128, 146);">(${date.toLocaleDateString()} ${date.toLocaleTimeString()})</span> <span style="color: bisque;">(IDNR: ${game_id})</span>`;
    
    const game_score_p = document.createElement("p");
    game_score_p.textContent = `Kommentar: - ${element.comment}`;

    const looser_heading = document.createElement("h4");
    looser_heading.textContent = `Verlierer: ${game_score} Punkte`;



    let game_loosers_list = document.createElement("ul");
    game_loosers_list.className = "game-loosers-list";

    for (const looser_id of game_loosers) {
        const looser_name = await get_playername_by_id(looser_id);
        const looser_li = document.createElement("li");
        looser_li.textContent = `${looser_name}`;
        game_loosers_list.appendChild(looser_li);
    }


    //const game_loosers_p = document.createElement("p");
    //game_loosers_p.textContent = `Verlierer IDs: ${game_loosers.join(", ")}`;


    const del_entry_button = document.createElement("button");
    del_entry_button.textContent = "Eintrag löschen";
    del_entry_button.className = "delete-entry-button";
    del_entry_button.onclick = async () => {
        if (confirm("Sicher??? Die Aktion ist unwiderruflich!!!")) {
            //del_game_entry(game_id);
            document.getElementById(`game_${game_id}`).remove();
        }
    };


    game_info_div.appendChild(game_title);
    game_info_div.appendChild(game_score_p);
    game_info_div.appendChild(looser_heading);
    game_info_div.appendChild(game_loosers_list);

    if (await is_user_admin()) {
        game_info_div.appendChild(del_entry_button);
    }


    games_container.appendChild(game_info_div);
}