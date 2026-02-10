
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
    get_profile_information,
    get_group_information
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

async function create_group_card(group_id) {
    const {
        group_name,
        member_ids,
        total_games,
        player_lost_games,
        player_points
    } = await get_group_information(group_id);

    const group_div = document.createElement("div");
    group_div.className = "group-card";

    /* Gruppenname */
    const title = document.createElement("h3");
    title.textContent = group_name;
    group_div.appendChild(title);

    /* Gesamtspiele */
    const totalGamesP = document.createElement("p");
    totalGamesP.innerHTML = `<strong class='information_under_header'>Gesamtspiele:</strong> <span class="value-accent">${total_games}</span>`;
    group_div.appendChild(totalGamesP);

    /* Punkteverteilung */
    const pointsHeader = document.createElement("p");
    pointsHeader.innerHTML = "<strong class='information_under_header'>Punkteverteilung:</strong>";
    group_div.appendChild(pointsHeader);

    const pointsUl = document.createElement("ul");

    for (const member_id of member_ids) {
        const player_name = await get_playername_by_id(member_id);

        const li = document.createElement("li");
        li.innerHTML = `
            <strong>${player_name}:</strong>
            <span class="value-blue">${player_points[member_id]} Punkte</span>
        `;
        pointsUl.appendChild(li);
    }

    group_div.appendChild(pointsUl);

    /* Bilanz */
    const balanceHeader = document.createElement("p");
    balanceHeader.innerHTML = "<strong class='information_under_header'>Bilanz:</strong>";
    group_div.appendChild(balanceHeader);

    const balanceUl = document.createElement("ul");

    for (const member_id of member_ids) {
        const player_name = await get_playername_by_id(member_id);

        const won_games = total_games - player_lost_games[member_id];
        const winrate =
            total_games > 0
                ? (won_games / total_games * 100).toFixed(2)
                : "0.00";

        const li = document.createElement("li");
        li.innerHTML = `
            <strong>${player_name}:</strong>
            <span class="value-red">Verloren ${player_lost_games[member_id]}</span>,
            <span class="value-green">Gewonnen ${won_games}</span>,
            <span class="value-purple">Gewinnrate ${winrate}%</span>
        `;
        balanceUl.appendChild(li);
    }

    group_div.appendChild(balanceUl);

    return group_div;
}


async function update_group_dashboard() {
    const groups_dashboard = document.getElementById("your_groups_dashboard");
    groups_dashboard.innerHTML = "<b>Alle deine Gruppen:</b>   <br><br>";

    const group_ids = await get_users_group_ids(user_data.player_id);

    for (const group_id of group_ids) {
        const group_div = await create_group_card(group_id);
        groups_dashboard.appendChild(group_div);
    }
}


async function update_group_speed_combobox() {

    const group_ids = await get_users_group_ids(user_data.player_id);
    const group_speed_select = document.getElementById("group_speed_select");
    group_speed_select.replaceChildren();

    for (const group_id of group_ids) {
        const group_name = await get_groupnames_by_group_ids([group_id]);
        const option = document.createElement("option");
        option.value = group_id;
        option.textContent = group_name;
        group_speed_select.appendChild(option);
    }
}


async function update_speed_load() {
    const group_id = document.getElementById("group_speed_select").value;
    const group_name = await get_groupnames_by_group_ids([group_id]);

    const group_speed_load_div = document.getElementById("group_speed_load");
    group_speed_load_div.replaceChildren();

    const group_card = await create_group_card(group_id);
    group_speed_load_div.appendChild(group_card);

}

await update_profile_information()

await update_group_speed_combobox()
await update_speed_load()

await update_group_speed_combobox();


await update_group_dashboard()

const group_speed_select = document.getElementById("group_speed_select");
group_speed_select.addEventListener("change", update_speed_load);