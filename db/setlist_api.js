// Function wrappers for database queries related to setlists.
// Each returns a PROMISE of database results
// As a rule, the error handling and authentication aspects of each query are NOT handled here.
// However, as a safety check, the band_id is also required for all queries.

const db = require('./db_pool');

const getSetlistSQL = `
select setlist_id, s.name, DATE_FORMAT(date, "%W, %M %D %Y") as date_pretty, 
DATE_FORMAT(date, "%Y-%m-%d") as date_yyyymmdd, descr, archived, 
DATE_FORMAT(s.updated_at, "%a, %b %D '%y, %h:%i %p") as updated_at_pretty
from setlist s 
where s.setlist_id = ? and s.band_id = ?
limit 1
`;

const getSetlistSongsSQL = `
select x.setlist_order, x.song_id, x.note, s.title, s.artist, s.key, s.tempo, s.tags
from setlist_song x 
join song s on x.song_id = s.song_id
where x.setlist_id = ? 
order by x.setlist_order asc
`;

// Get a setlist's basic info, and list of songs
function getSetlist(setlist_id, band_id) {
    return Promise.all( [db.execute(getSetlistSQL, [setlist_id, band_id]),
                        db.execute(getSetlistSongsSQL, [setlist_id])]);
}

const getSetlistsByBandSQL = `
select s.setlist_id, s.name, DATE_FORMAT(s.date, "%a, %b %D '%y") as date_pretty, 
DATE_FORMAT(s.date, "%Y-%m-%d") as date_yyyymmdd, s.descr, 
DATE_FORMAT(s.updated_at, "%a, %b %D '%y, %h:%i %p") as updated_at_pretty,
DATE_FORMAT(s.updated_at, "%Y-%m-%d %H:%i:%s") as updated_at_yyyymmdd,
group_concat(song.title order by x.setlist_order asc separator ',') as songs,
count(song.song_id) as song_count
from setlist s
left join setlist_song x on s.setlist_id = x.setlist_id
left join song on x.song_id = song.song_id
where s.band_id = ? and s.archived = ?
group by s.setlist_id, s.name, date_pretty, date_yyyymmdd, s.descr, s.created_at, s.updated_at
order by s.updated_at desc
`;
// Get all (unarchived) setlists associated with a band
function getSetlistsByBand(band_id) {
    return db.execute(getSetlistsByBandSQL, [band_id, 0]);
}
// Get all archived setlists associated with a band
function getArchivedSetlistsByBand(band_id) {
    return db.execute(getSetlistsByBandSQL, [band_i, 1]);
}

// Create a new setlist, associated with a given band by the given user.
const createSetlistSQL = `insert into setlist
(setlist.name,date,descr,creator_id,band_id)
values (?,?,?,?,?)
`;

function createSetlist(user_id, band_id, name, date, descr) {
    return db.execute(createSetlistSQL, [name,date,descr,user_id,band_id])
}



const updateSetlistSQL = `update setlist 
set setlist.name = ?,
date = ?,
descr = ?,
updated_at = CURRENT_TIMESTAMP
where setlist_id = ? and band_id = ?`;


const insertUpdateSetlistSongSQL = `insert into setlist_song 
(setlist_id, setlist_order, song_id, note)
values (?, ?, ?, ?) as new
on duplicate key update song_id = new.song_id, note = new.note`;

const deleteSetlistSongsSQL = `delete from setlist_song
where setlist_id = ?
and setlist_order >= ?
`;
// Updates the setlist details and list of songs.
async function updateSetlist(setlist_id, band_id, name, date, descr, song_id_list, note_list){
    
    let connection = await db.getConnection();
    song_id_list = song_id_list == undefined ? [] : (song_id_list instanceof Array ? song_id_list : [song_id_list]);
    note_list = note_list == undefined ? [] : (note_list instanceof Array ? note_list : [note_list]);

    try {
        
        await connection.beginTransaction();    
        let queryPromises = song_id_list.map((song_id, i) => 
                connection.execute(insertUpdateSetlistSongSQL, [setlist_id, i, song_id, note_list[i]])
            );
        
        queryPromises.push(connection.execute(updateSetlistSQL, [name, date, descr, setlist_id, band_id]),
        connection.execute(deleteSetlistSongsSQL, [setlist_id, queryPromises.length]));
        
        let results = await Promise.all(queryPromises);
        await connection.commit();
        return results;
    } catch (error) {
        throw error;
    } finally {
        connection.release();
    }

}

const archiveSetlistSQL = `update setlist 
set archived = 1
where setlist_id = ? and band_id = ?`;

function archiveSetlist(setlist_id, band_id){
    return db.execute(archiveSetlistSQL, [setlist_id, band_id]);
}

const unarchiveSetlistSQL = `update setlist 
set archived = 0
where setlist_id = ? and band_id = ?`;

function unarchiveSetlist(setlist_id, band_id){
    return db.execute(unarchiveSetlistSQL, [setlist_id, band_id]);
}

const deleteSetlistSQL = "delete from setlist where setlist_id = ? and band_id = ?";

function deleteSetlist(setlist_id, band_id){
    return db.execute(deleteSetlistSQL, [setlist_id, band_id])
}


const archiveSetlistsBeforeDateSQL = `update setlist 
set archived = 1
where setlist_id = ? and band_id = ? and date < ?`;

function archiveSetlistsBeforeDate(setlist_id, band_id, before_date){
    return db.execute(archiveSetlistsBeforeDateSQL, [setlist_id, band_id, before_date]);
}


module.exports = {
    getSetlist,
    getSetlistsByBand,
    getArchivedSetlistsByBand,
    createSetlist,
    updateSetlist,
    archiveSetlist,
    unarchiveSetlist,
    archiveSetlistsBeforeDate,
    deleteSetlist
}
