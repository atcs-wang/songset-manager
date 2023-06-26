// Function wrappers for database queries.
// Each returns a PROMISE of database results

const db = require('./dp_pool');

// Get songs info, including concatenated list of categories
const getAllSongsSQL = `
select song_id, title, artist, key, group_concat(c.name) from song s
join song_category_xref x on s.song_id = x.song_id
join category c on x.category_id = c.category_id 
where s.user_id = ?
group by song_id 
`

function getAllSongs(user_id) {
    return db.execute(getAllSongsSQL, [user_id]);
}

const createSongSQL = `INSERT INTO song
(name,artist,key,notes,user_id)
VALUES (?,?,?,?,?);
`

function createSong(name, artist, key, notes, user_id) {
    return db.execute(createSongSQL, [name, artist, key, notes, user_id])
}

const deleteSongCategoriesSQL_start = `DELETE FROM song_category_xref WHERE song_id NOT IN `;

const addSongCategoriesSQL_start = `INSERT IGNORE INTO song_category_xref (song_id, category_id) VALUES `

async function updateSongCategories(song_id, category_id_list, user_id){
    let connection = await db.getConnection();
    //build list 
    let deleteResult = await connection.execute(deleteSongCategoriesSQL_start) // TODO
    let addResult = await connection.execute(addSongCategoriesSQL_start)    
}

const updateSongSQL = "UPDATE song WHERE user_id = ? AND song_id = ?"


function updateSong(user_id, song_id){
    return db.execute(updateSongSQL, [user_id]);
}

const deleteSongSQL = "DELETE FROM song WHERE user_id = ? AND song_id = ?"

function deleteSong(user_id, song_id){
    return db.execute(deleteSongSQL, [user_id, song_id])
}




function 

module.exports = {

}
