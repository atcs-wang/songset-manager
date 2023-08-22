// Function wrappers for database queries related to songs.
// Each returns a PROMISE of database results
// As a rule, the error handling and authentication aspects of each query are NOT handled here.
// However, as a safety check, the band_id is also required for all queries.

const db = require('./db_pool');

// Get a song's info
const getSongSQL = `
select song_id, title, artist, \`key\`, tempo, tags, notes, created_at, updated_at, archived 
from song s
where s.song_id = ? and s.band_id = ?
limit 1
`;

function getSong(song_id, band_id) {
    return db.execute(getSongSQL, [song_id, band_id]);
}

// Get all (unarchived) songs associated with a band
const getSongsByBandSQL = `
select s.song_id, title, artist, \`key\`, tempo, tags, notes, s.created_at, s.updated_at, MAX(setlist.date) as last_played, 
DATE_FORMAT(MAX(setlist.date), "%a, %b %D '%y") as last_played_pretty, 
DATE_FORMAT(MAX(setlist.date), "%Y-%m-%d") as last_played_yyyymmdd 
from song s
left join setlist_song x on s.song_id = x.song_id
left join setlist on setlist.setlist_id = x.setlist_id and setlist.date < CURRENT_TIMESTAMP
where s.band_id = ? and s.archived = 0
group by song_id, title, artist, \`key\`, tempo, tags, notes, created_at, updated_at
order by updated_at desc
`;

function getSongsByBand(band_id) {
    return db.execute(getSongsByBandSQL, [band_id]);
}


// Search all (unarchived) songs associated with a band 
const searchSongsByBandSQL = `
select song_id, title, artist, \`key\`, tempo, tags, notes, created_at, updated_at
from song s
where band_id = ? and archived = 0
and (title like CONCAT("%", ?, "%") or artist like CONCAT("%", ?, "%") or tags like CONCAT("%", ?, "%"))
`;

function searchSongsByBand(band_id, query) {
    return db.execute(searchSongsByBandSQL, [band_id, query, query, query]);
}

// Get all ARCHIVED songs associated with a band
const getArchivedSongsByBandSQL = `
select song_id, title, artist, \`key\`, tempo, tags, notes, created_at, updated_at
from song s
where band_id = ? and archived = 1
`;

function getArchivedSongsByBand(band_id) {
    return db.execute(getArchivedSongsByBandSQL, [band_id]);
}

// Search all ARCHIVED songs associated with a band
const searchArchivedSongsByBandSQL = `
select song_id, title, artist, \`key\`, tempo, tags, notes, created_at, updated_at
from song s
where band_id = ? and archived = 1
and (title like CONCAT("%", ?, "%") or artist like CONCAT("%", ?, "%") or tags like CONCAT("%", ?, "%"))
`;

function searchArchivedSongsByBand(band_id, query) {
    return db.execute(searchArchivedSongsByBandSQL, [band_id, query, query, query]);
}

// Create a new song, associated with a given band by the given user.
const createSongSQL = `insert into song
(title,artist,\`key\`,tempo,tags,notes,creator_id,band_id)
values (?,?,?,?,?,?,?,?)
`;

function createSong(user_id, band_id, title,artist,key,tempo,tags,notes) {
    return db.execute(createSongSQL, [title,artist,key,tempo,tags,notes,user_id,band_id])
}

const updateSongSQL = `update song 
set title = ?,
artist = ?,
\`key\` = ?,
tempo = ?,
tags = ?,
notes = ?
where song_id = ? and band_id = ?`;

function updateSong(song_id, band_id, title,artist,key,tempo,tags,notes,){
    return db.execute(updateSongSQL, [title,artist,key,tempo,tags,notes, song_id, band_id]);
}

const archiveSongSQL = `update song 
set archived = 1
where song_id = ? and band_id = ?`;

function archiveSong(song_id, band_id){
    return db.execute(archiveSongSQL, [song_id, band_id]);
}

const unarchiveSongSQL = `update song 
set archived = 0
where song_id = ? and band_id = ?`;

function unarchiveSong(song_id, band_id){
    return db.execute(unarchiveSongSQL, [song_id, band_id]);
}

const deleteSongSQL = "delete from song where song_id = ? and band_id = ?";

function deleteSong(song_id, band_id){
    return db.execute(deleteSongSQL, [song_id, band_id])
}

const copySongToBandSQL = `insert into song
(title,artist,\`key\`,tempo,tags,notes,creator_id, band_id)
select title,artist,\`key\`,tempo,tags,notes, ?, ? from song 
where song_id = ? and band_id = ?`;

function copySongToBand(user_id, song_id, from_band_id, to_band_id) {
    return db.execute(copySongToBandSQL, [user_id, to_band_id, song_id, from_band_id])
}

module.exports = {
    getSong,
    getSongsByBand,
    searchSongsByBand,
    getArchivedSongsByBand,
    searchArchivedSongsByBand,
    createSong,
    updateSong,
    archiveSong,
    unarchiveSong,
    deleteSong,
    copySongToBand
}
