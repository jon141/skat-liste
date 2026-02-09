// db_operations.js

import { supabase } from './supabase.js'

export async function login_requirement_check() {
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    window.location.href = 'login.html'
    throw new Error('Not logged in')
  }

  const { data, error } = await supabase
    .from('player')
    .select('*')

  if (error) {
    console.error(error)
    return
  }

  console.log('Spieler:', data)
}



export async function create_new_group(group_name, members_id) {
    console.log("Creating new group with name: " + group_name + " and members: " + members_id);

    //Gruppeneintrag erstellen
    const { data, error } = await supabase
        .from('groups')
        .insert([
            {
                groupname: group_name,
            }
        ])
        .select()
        .single();
    
    if (error) {
        console.error('Fehler beim hinzugügen zu groups:', error)
        return false;
    } else {
        console.log('Gruppe erfolgreich hinzugefügt:', data)
    }
    
    // Id der erstellten Gruppe auslesen
    const group_id = data.group_id;

    // Einträge für groupmembers erstellen
    for (const id of members_id) {
        const { data, error } = await supabase
            .from('groupmembers')
            .insert({
                    group_id: group_id,
                    player_id: id
             })

        if (error) {
            console.error('Fehler beim hinzugügen zu groupmembers: da', error)
            return false;
        } else {
            console.log('Beziehung erfolgreich hinzugefügt:', data)
        }


    }
    return true;
}

export async function get_playername_by_id(player_id) {
    console.log("Getting playername for: " + player_id);

    const { data, error } = await supabase
        .from('player')
        .select('username')
        .eq('player_id', player_id)
        .single();

    if (error) {
        console.error('Fehler beim abrufen des Spielernamens:', error)
        return null;
    } else {
        console.log('Spielername erfolgreich abgerufen:', data.username)
        return data.username;
    }
}//

async function get_groupname_by_id(group_id) {
    console.log("Getting groupname for: " + group_id);

    const { data, error } = await supabase
        .from('group')
        .select('groupname')
        .eq('id', group_id)
        .single();

    if (error) {
        console.error('Fehler beim abrufen des Gruppennamens:', error)
        return null;
    } else {
        console.log('Gruppenname erfolgreich abgerufen:', data.groupname)
        return data.groupname;
    }
}

export async function log_groups() {
    console.log("Getting groups...");
    const { data, error } = await supabase
        .from('groups')
        .select('*')
    
    if (error) {
        console.error('Fehler beim abrufen der Gruppen:', error)
    } else {
        console.log('Gruppen erfolgreich abgerufen:', data)
    }
}

export async function get_user_data_by_uuid() {

    console.log("Getting user data by uuid...");
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
        console.error('Kein eingeloggter User')
        return null
    }

    const uuid = user.id

    const { data, error } = await supabase
        .from('player')
        .select('*')
        .eq('auth_id', uuid)
        .single()

    if (error) {
        console.error('Fehler beim Abrufen der Benutzerdaten:', error)
        return null
    }

    console.log('Benutzerdaten erfolgreich abgerufen:', data)
    return data
}

export async function get_all_player_data() {
    console.log("Getting all player names and ids...");
    const { data, error } = await supabase
        .from('player')
        .select('player_id, username')

    if (error) {
        console.error('Fehler beim Abrufen der Spielernamen und IDs:', error)
        return []
    }

    console.log('Spielernamen und IDs erfolgreich abgerufen:', data)
    return data
}
//

export async function get_groupnames_by_group_ids(user_group_ids) {
    let group_names = []

    for (const group_id of user_group_ids) {
        console.log(`Daten für Gruppe ${group_id}:`)
        const { data: group_name, error } = await supabase
            .from('groups')
            .select('groupname')
            .eq('group_id', group_id)
            .single()

        if (error) {
            console.error(`Fehler beim Abrufen der Gruppe ${group_id}:`, error)
        } else {
            console.log(group_name.groupname)
            group_names.push(group_name.groupname)
        }
    }
    console.log('User Group Names:', group_names)
    return group_names
}


export async function get_users_group_ids(player_id) {
    console.log("Getting user's group ids...");
    const { data, error } = await supabase
        .from('groupmembers')
        .select('group_id')
        .eq('player_id', player_id)
    
    if (error) {
        console.error('Fehler beim abrufen der Gruppen:', error)
    } else {
        console.log('Gruppen erfolgreich abgerufen:', data)
    }

    return data.map(entry => entry.group_id);
}

// alle player_ids in einer Gruppe abrufen
export async function get_groupmember_ids(group_id) {
    console.log("Getting groupmember ids for group: " + group_id);
    const { data, error } = await supabase
        .from('groupmembers')
        .select('player_id')
        .eq('group_id', group_id)
            
    if (error) {
        console.error('Fehler beim abrufen der Gruppenmitglieder:', error)
        return [];
    } else {
        const member_ids = data.map(entry => entry.player_id);
        console.log('Gruppenmitglieder erfolgreich abgerufen:', member_ids)
        return member_ids;
    }
}

export async function create_new_game_entry(group_id, looser_ids, points, comment) {
    console.log("Creating new game entry for group: " + group_id + " with points: " + points + " and loosers: " + looser_ids);

    const { data, error } = await supabase
        .from('game_entries')
        .insert({
            group_id: group_id,
            comment: comment
        })
        .select()
        .single();
    
    if (error) {
        console.error('Fehler beim Erstellen des Spieleintrags:', error)
        return;
    } else {
        console.log('Spieleintrag erfolgreich erstellt:', data)
    }
    if (error) throw error;
    const game_entry_id = data.game_entry_id;

    for (const player_id of looser_ids) {
        const { data, error } = await supabase
            .from('game_scores')
            .insert({
                game_entry_id: game_entry_id,
                player_id: player_id,
                points: points
            })

    if (error) {
            console.error('Fehler beim hinzugügen hier:', error)
        } else {
            console.log('Beziehung erfolgreich hinzugefügt:', data)
        }

        if (error) throw error;
//
    
}}


function calculate_group_score(group_id) {
    console.log("Calculating score for group: " + group_id);
}

export async function get_total_gamenumber_of_player(player_id) {
  try {
    // 
    const { data: groupData, error: groupError } = await supabase
      .from('groupmembers')
      .select('group_id, groups(groupname)')
      .eq('player_id', player_id);

    if (groupError) throw groupError;

    const groupIds = groupData.map(g => g.group_id);
    const groupNames = groupData.map(g => g.groups.groupname);

    // 2️⃣ Anzahl Spiele zählen, die in diesen Gruppen gespielt wurden
    let gameCount = 0;
    if (groupIds.length > 0) {
      const { count, error: gameError } = await supabase
        .from('game_entries')
        .select('game_entry_id', { count: 'exact', head: true })
        .in('group_id', groupIds);

      if (gameError) throw gameError;
      gameCount = count;
    }

    return gameCount

      //player_id,
      //groups: groupNames,
   

  } catch (err) {
    console.error("Fehler beim Abrufen der Profilinformationen:", err);
    return null;
  }
}

export async function get_lost_games_of_player(player_id) {

    try {
        // Alle Einträge in game_scores abrufen, die zum Spieler gehören
        const { count, error } = await supabase
        .from('game_scores')
        .select('game_entry_id', { count: 'exact', head: true })
        .eq('player_id', player_id);

        if (error) throw error;

        return count; // Anzahl Spiele, bei denen der Spieler Punkte hatte (hier als "verlorene Spiele" interpretierbar)
    } catch (err) {
        console.error('Fehler beim Abrufen der verlorenen Spiele:', err);
        return 0;
    }
}

export async function get_profile_information(player_id) {
    const playedGames = await get_total_gamenumber_of_player(player_id);
    const lostGames = await get_lost_games_of_player(player_id);
    const wonGames = playedGames - lostGames;
    const winningRate = playedGames > 0 ? ((wonGames / playedGames) * 100).toFixed(2) : '0.00';
    console.log(`Total Games: ${playedGames}, Lost Games: ${lostGames}, Won Games: ${wonGames}, Winning Rate: ${winningRate}%`);
    return {playedGames, lostGames, wonGames, winningRate};

}