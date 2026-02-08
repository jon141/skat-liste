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
    } else {
        console.log('Gruppe erfolgreich hinzugefügt:', data)
    }
    
    if (error) throw error;

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
            console.error('Fehler beim hinzugügen zu groupmembers:', error)
        } else {
            console.log('Beziehung erfolgreich hinzugefügt:', data)
        }

        if (error) throw error;

    }
    
}

async function get_playername_by_id(player_id) {
    console.log("Getting playername for: " + player_id);

    const { data, error } = await supabase
        .from('player')
        .select('username')
        .eq('id', player_id)
        .single();

    if (error) {
        console.error('Fehler beim abrufen des Spielernamens:', error)
        return null;
    } else {
        console.log('Spielername erfolgreich abgerufen:', data.username)
        return data.username;
    }
}

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

export async function get_groupnames_by_group_ids(group_ids) {
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

function calculate_group_score(group_id) {
    console.log("Calculating score for group: " + group_id);
}

function add_game_entry(group_id, points, looser_ids) {
}