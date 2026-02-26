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

export async function get_groupname_by_id(group_id) {
    console.log("Getting groupname for: " + group_id);

    const { data, error } = await supabase
        .from('groups')
        .select('groupname')
        .eq('group_id', group_id)
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

export async function get_group_information(group_id) {
    console.log("Getting group information for group: " + group_id);
    
    const group_name = await get_groupname_by_id(group_id);
    const member_ids = await get_groupmember_ids(group_id);
    console.log("   Group Name:", group_name);
    console.log("   Member IDs:", member_ids);

    const member_names = [];

    const { count, error } = await supabase
    .from('game_entries')
    .select('*', { count: 'exact', head: true })
    .eq('group_id', group_id);

    if (error) {
    console.error('Fehler beim Zählen der Spiele:', error);
    return;
    }

    const total_games = count ?? 0;
    console.log('Total Games in Group:', total_games);


    let player_lost_games = {};
    for (const member_id of member_ids) {
        const { count, error } = await supabase
        .from('game_scores')
        .select(
            'points, game_entries!inner(group_id)',
            { count: 'exact', head: true }
        )
        .eq('player_id', member_id)
        .eq('game_entries.group_id', group_id);

        if (error) {
        console.error(error);
        } else {
        console.log('Anzahl Spiele:', count);
        player_lost_games[member_id] = count;
        }

    }

    console.log("   Player Lost Games in Group:", player_lost_games);


    let player_points = {};
    
    // Punkte für jedes Mitglied der Gruppe berechnen
    for (const member_id of member_ids) {
        // 1️⃣ alle game_entry_ids der Gruppe
        const { data: gameEntries, error: geError } = await supabase
            .from('game_entries')
            .select('game_entry_id')
            .eq('group_id', group_id);

        if (geError) console.error(geError);

        const gameEntryIds = gameEntries.map(e => e.game_entry_id);

        // 2️⃣ Punkte des Spielers summieren
        const { data: scores, error: scoreError } = await supabase
            .from('game_scores')
            .select('points')
            .eq('player_id', member_id)
            .in('game_entry_id', gameEntryIds);

        if (scoreError) console.error(scoreError);

        const totalPoints = scores.reduce((sum, e) => sum + e.points, 0);
        console.log("Total points:", totalPoints);
        player_points[member_id] = totalPoints;
            }
    
    console.log("   Player Points:", player_points);

    return {
        group_name,
        member_ids,
        total_games,
        player_lost_games,
        player_points
    };

}


export async function get_all_game_entries() {
    console.log("Getting all game entries...");
    const { data, error } = await supabase
    .from('game_entries')
    .select(`
        game_entry_id,
        created_at,
        comment,
        group_id,
        groups (
        groupname
        )
    `)
    .order('created_at', { ascending: false });

    if (error) console.error(error);
    else console.log(data);
    return data;
}

export async function get_looser_and_scores_by_game_entry_id(game_entry_id) {
    const { data, error } = await supabase
        .from('game_scores')
        .select('player_id, points')
        .eq('game_entry_id', game_entry_id);

    if (error) {
        console.error(error);
        throw error;
    }

    return data;
}

export async function del_game_entry(game_entry_id) {
    const { error } = await supabase
        .from('game_entries')
        .delete()
        .eq('game_entry_id', game_entry_id);


    const { error: error2 } = await supabase
        .from('game_scores')
        .delete()
        .eq('game_entry_id', game_entry_id);

    if (error2) {
        console.error(error2);
        throw error2;
    }
        console.error(error);
        throw error;
}
