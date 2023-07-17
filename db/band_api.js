// Function wrappers for database queries related to bands.
// Each returns a PROMISE of database results
// As a rule, the error handling and authentication aspects of each query are NOT handled here.

const db = require('./db_pool');

const createBandSQL = `insert into band
(name, creator_id) values (?, ?);`

// Creates a band with a given name
function createBand(name, user_id) {
    return db.execute(createBandSQL, [name, user_id]);
}

const getBand = `select band_id, name from band where band_id = ? `

function getBand(band_id) {
    return db.execute(getUserBandRoleSQL, [band_id]);
}

//Update band name 
const updateBandSQL = `update band
set name = ?
where band_id = ?
`
function updateBandNickname(user_id, band_id, nickname){
    return db.execute(updateBandSQL, [nickname, band_id, band_id, user_id]);
}

// Delete a band
const deleteBandSQL = `delete from  band
where band_id = ?`

// TODO AUTH? Only allow owners of band to delete band
function deleteBand(band_id){
    return db.execute(deleteBandSQL, [user_id, user_id])
}



//Add user to a band with given role
const createUserBandRoleSQL = `insert into user_band_role
(user_id, band_id, role) values (?, ?, ?)`

function createUserBandRole(user_id, band_id, role ) {
    db.execute(createUserBandRoleSQL, [user_id, band_id, role])
}

//Add user to a band with given role - lookup by nickname

const createUserBandRoleByNicknameSQL = `insert into user_band_role
(user_id, band_id, role) values ( (select user_id from user where nickname = ?), ?, ?)`

function createUserBandRoleByNickname(nickname, band_id, role ) {
    db.execute(createUserBandRoleByNicknameSQL, [nickname, band_id, role])
}

//Get the role of a user in a band
//For general auth purposes, mainly
const getUserBandRoleSQL = `
select r.role 
from user_band_role r 
where band_id = ?
and user_id = ?
limit 1
`
function getUserBandRole(user_id, band_id){
    return db.execute(getUserBandRoleSQL, [band_id, user_id]);
}

// Get all bands that a user has a role in (and those roles)
const getAllUserBandRolesByUserSQL = `
select b.band_id, b.name, r.role
from band b
join user_band_role r on b.band_id = r.band_id 
where r.user_id = ?
`
function getAllUserBandRolesByUser(user_id) {
    return db.execute(getAllUserBandRolesByUserSQL, [user_id]);
}

// Get all users associated with a band and their roles
const getAllUserBandRolesByBandSQL = `
select u.user_id, u.nickname, r.role 
from user u
join user_band_role r on u.user_id = r.user_id
where r.band_id = ? 
`

function getAllUserBandRolesByBand(band_id) {
    return db.execute(getAllUserBandRolesByBandSQL, [user_id]);
}


//Update user in band with new role
const updateUserBandRoleSQL = `update user_band_role
set role = ?
where band_id = ?
and user_id = ?
`
function updateUserBandRole(user_id, band_id, role ) {
    db.execute(updateUserBandRoleSQL, [role, band_id, user_id])
}

//Delete a user's role in band
const deleteUserBandRoleSQL = `delete from user_band_role
where band_id = ?
and user_id = ?
`
function deleteUserBandRole(user_id, band_id) {
    db.execute(deleteUserBandRoleSQL, [band_id, user_id])
}

module.exports = {
    createBand,
    getBand,
    updateBandNickname,
    deleteBand,
    createUserBandRole,
    createUserBandRoleByNickname,
    getUserBandRole,
    getAllUserBandRolesByUser,
    getAllUserBandRolesByBand,
    updateUserBandRole,
    deleteUserBandRole
}


