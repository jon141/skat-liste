import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const supabase = createClient(
  'https://ogclflemutkutlhipdtl.supabase.co',
  'sb_publishable_9Vwf7sx_EGE1D-bGKqa1Vg_6GKAYd-b'
)

async function create_new_group(group_name, members_id) {
    console.log("Creating new group with name: " + group_name + " and members: " + members_id);

    //Gruppeneintrag erstellen
    const { data, error } = await supabase
        .from('group')
        .insert([
            {
                name: group_name,
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
    const group_id = data.id;

    // Einträge für groupmembers erstellen
    for (const id of members_id) {
        const { data, error } = await supabase
            .from('user')
            .insert({ id: id,
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

function get_group() {
    console.log("Getting groups...");
}

function calculate_group_score(group_id) {
    console.log("Calculating score for group: " + group_id);
}

function add_game_entry(group_id, points, looser_ids) {
}