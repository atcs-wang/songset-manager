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
    return db.execute(getSetlistsByBandSQL, [band_id, 1]);
}

const getUpcomingSetlistsByBandSQL = `
select s.setlist_id, s.name, DATE_FORMAT(s.date, "%a, %b %D '%y") as date_pretty, 
DATE_FORMAT(s.date, "%Y-%m-%d") as date_yyyymmdd, s.descr, 
DATE_FORMAT(s.updated_at, "%a, %b %D '%y, %h:%i %p") as updated_at_pretty,
DATE_FORMAT(s.updated_at, "%Y-%m-%d %H:%i:%s") as updated_at_yyyymmdd,
group_concat(song.title order by x.setlist_order asc separator ',') as songs,
count(song.song_id) as song_count
from setlist s
left join setlist_song x on s.setlist_id = x.setlist_id
left join song on x.song_id = song.song_id
where s.band_id = ? and s.archived = 0 and (s.date is NULL or s.date >= CURRENT_DATE())
group by s.setlist_id, s.name, date_pretty, date_yyyymmdd, s.descr, s.created_at, s.updated_at
order by s.date asc
`;
function getUpcomingSetlistsByBand(band_id) {
    return db.execute(getUpcomingSetlistsByBandSQL, [band_id]);
}

// Create a new setlist, associated with a given band by the given user.
const createSetlistSQL = `insert into setlist
(setlist.name,date,descr,creator_id,band_id)
values (?,?,?,?,?)
`;

function createSetlist(user_id, band_id, name, date, descr) {
    return db.execute(createSetlistSQL, [name,date || null,descr,user_id,band_id])
}




const updateSetlistDetailsSQL = `update setlist 
set setlist.name = ?,
date = ?,
descr = ?,
updated_at = CURRENT_TIMESTAMP
where setlist_id = ? and band_id = ?`;

// Updates the setlist details.
async function updateSetlistDetails(setlist_id, band_id, name, date, descr){
    return db.execute(updateSetlistDetailsSQL, [name, date  || null, descr, setlist_id, band_id]);
}

const updateSetlistUpdatedAtSQL = `update setlist set
updated_at = CURRENT_TIMESTAMP
where setlist_id = ? and band_id = ?`;

// // Adds a song to the end of a setlist
const addSetlistSongSQL = `
insert into setlist_song 
(setlist_id, setlist_order, song_id)
select ?, COUNT(*), ? from setlist_song where setlist_id = ?
`
async function addSetlistSong(setlist_id, band_id, song_id){
    let connection = await db.getConnection();
    try {
        await connection.beginTransaction();    
        let results = await Promise.all([
            connection.execute(addSetlistSongSQL, [setlist_id, song_id, setlist_id]),
            connection.execute(updateSetlistUpdatedAtSQL, [setlist_id, band_id])
        ]);
        await connection.commit();
        return results;
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

const insertUpdateSetlistSongSQL = `insert into setlist_song 
(setlist_id, setlist_order, song_id, note)
values (?, ?, ?, ?) as new
on duplicate key update song_id = new.song_id, note = new.note`;

const deleteSetlistSongsSQL = `delete from setlist_song
where setlist_id = ?
and setlist_order >= ?
`;

// Updates the list of songs, in event of updating notes, reordering, deleting, or adding an element.
// It is worth noting that this is a "swiss army knife" update event - the entire list is given, and the entire list
// is updated - replaced really. While this is somewhat "inefficient" compared to atomic changes that could be made - 
// individual add, update, reorder, and delete operations - it is arguably safer, as the entire list, after operation, 
// should match the state of the list as given, binding the view-model more tightly.
// Thus, in the event of two users simultaneously making changes, simply the one who saved last will "win".  
async function updateSetlistSongs(setlist_id, band_id, song_id_list, note_list){
    
    let connection = await db.getConnection();
    song_id_list = song_id_list == undefined ? [] : (song_id_list instanceof Array ? song_id_list : [song_id_list]);
    note_list = note_list == undefined ? [] : (note_list instanceof Array ? note_list : [note_list]);

    try {
        
        await connection.beginTransaction();    
        let insertUpdateSetlistSongsResults = await Promise.all(song_id_list.map((song_id, i) => 
                connection.execute(insertUpdateSetlistSongSQL, [setlist_id, i, song_id, note_list[i]])
            ));
        let deleteSetlistSongsResults = await connection.execute(deleteSetlistSongsSQL, [setlist_id, insertUpdateSetlistSongsResults.length]);
        let updateSetlistUpdatedAtResults = await connection.execute(updateSetlistUpdatedAtSQL, [setlist_id, band_id]);
        
        await connection.commit();
        return {insertUpdateSetlistSongsResults,deleteSetlistSongsResults,updateSetlistUpdatedAtResults};
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }

}

// Do NOT update updated_at timestamp for archiving/unarchiving

const archiveSetlistSQL = `update setlist 
set archived = 1,
updated_at = updated_at
where setlist_id = ? and band_id = ?`;

function archiveSetlist(setlist_id, band_id){
    return db.execute(archiveSetlistSQL, [setlist_id, band_id]);
}

const unarchiveSetlistSQL = `update setlist 
set archived = 0,
updated_at = updated_at
where setlist_id = ? and band_id = ?`;

function unarchiveSetlist(setlist_id, band_id){
    return db.execute(unarchiveSetlistSQL, [setlist_id, band_id]);
}

const archiveSetlistsBeforeDateSQL = `update setlist 
set archived = 1,
updated_at = updated_at
where band_id = ? and archived = 0 and date < ? and date is not NULL`;

function archiveSetlistsBeforeDate(band_id, before_date){
    console.log(before_date);
    return db.execute(archiveSetlistsBeforeDateSQL, [band_id, before_date]);
}

const deleteSetlistSQL = "delete from setlist where setlist_id = ? and band_id = ?";

function deleteSetlist(setlist_id, band_id){
    return db.execute(deleteSetlistSQL, [setlist_id, band_id])
}

const getSetlistsBySongSQL = `
select s.setlist_id, s.name, s.date, DATE_FORMAT(s.date, "%a, %b %D '%y") as date_pretty, 
DATE_FORMAT(s.date, "%Y-%m-%d") as date_yyyymmdd, s.descr, 
DATE_FORMAT(s.updated_at, "%a, %b %D '%y, %h:%i %p") as updated_at_pretty,
DATE_FORMAT(s.updated_at, "%Y-%m-%d %H:%i:%s") as updated_at_yyyymmdd,
group_concat(song.title order by x.setlist_order asc separator ',') as songs,
count(song.song_id) as song_count,
s.archived
from 
(select distinct setlist_id from setlist_song where song_id = ?) x2
join setlist s on s.setlist_id = x2.setlist_id
left join setlist_song x on s.setlist_id = x.setlist_id
left join song on x.song_id = song.song_id
where s.band_id = ?
group by s.setlist_id, s.name, date_pretty, date_yyyymmdd, s.descr, s.created_at, s.updated_at, s.archived
order by s.date desc
`;
// Get all (unarchived) setlists associated with a band
function getSetlistsBySong(song_id, band_id) {
    return db.execute(getSetlistsBySongSQL, [song_id, band_id]);
}

module.exports = {
    getSetlist,
    getSetlistsByBand,
    getArchivedSetlistsByBand,
    getUpcomingSetlistsByBand,
    createSetlist,
    updateSetlistDetails,
    addSetlistSong,
    updateSetlistSongs,
    archiveSetlist,
    unarchiveSetlist,
    archiveSetlistsBeforeDate,
    deleteSetlist,
    getSetlistsBySong,
}
