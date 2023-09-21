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

const getBandSQL = `select band_id, name from band where band_id = ? limit 1`

function getBand(band_id) {
    return db.execute(getBandSQL, [band_id]);
}

//Update band name 
const updateBandNameSQL = `update band
set name = ?
where band_id = ?
`
function updateBandName(band_id, name){
    return db.execute(updateBandNameSQL, [name, band_id]);
}

// Delete a band
const deleteBandSQL = `delete from  band
where band_id = ?`

function deleteBand(band_id){
    return db.execute(deleteBandSQL, [band_id])
}

//Add member to a band with given nickname and role
// Note that this creates a member not (yet) associated with any actual user
const createBandMemberSQL = `insert into band_member
(nickname, band_id, role) values (?, ?, ?)`

function createBandMember(nickname, band_id, role ) {
    return db.execute(createBandMemberSQL, [nickname, band_id, role])
}

//Add user to a band with given role - lookup by username, using it as initial nickname 
const addBandMemberByUsernameSQL = `insert into band_member
(nickname, band_id, role, user_id) 
select ?, ?, ?, user_id from user where username = ?`

function createBandMemberWithUsername(nickname, band_id, role, username ) {
    return db.execute(addBandMemberByUsernameSQL, [nickname || username, band_id, role, username])
}

//Get info about a band member
const getBandMemberSQL = `
select m.nickname, m.role, m.user_id, u.username
from band_member m
left join user u on u.user_id = m.user_id 
where band_id = ?
and nickname = ?
limit 1
`
function getBandMember(nickname, band_id){
    return db.execute(getBandMemberSQL, [band_id, nickname]);
}

//Get the membership of a user in a band
const getBandMemberByUserSQL = `
select r.role, r.nickname
from band_member r 
where band_id = ?
and user_id = ?
limit 1
`
function getBandMemberByUser(user_id, band_id){
    return db.execute(getBandMemberByUserSQL, [band_id, user_id]);
}

// Get all bands that a user has a role in (and those roles)
const getAllBandsByUserSQL = `
select b.band_id, b.name, m.role,
DATE_FORMAT(m.created_at, "%b '%y") as member_since_pretty
from band b
join band_member m on b.band_id = m.band_id 
where m.user_id = ?
`
function getAllBandsByUser(user_id) {
    return db.execute(getAllBandsByUserSQL, [user_id]);
}

// Get all members associated with a band and their users/roles
const getAllBandMembersByBandSQL = `
select m.nickname, m.user_id, u.username, m.role, 
DATE_FORMAT(m.created_at, "%b '%y") as member_since_pretty  
from band_member m
left join user u on u.user_id = m.user_id
where m.band_id = ? 
`

function getAllBandMembersByBand(band_id) {
    return db.execute(getAllBandMembersByBandSQL, [band_id]);
}

// Removed from API to require individual updates to each 
// //Update member in band with new role, member, and/or user
// // If new_nickname is blank, keep old nickname
// updateBandMemberSQL = `update band_member
// set role = ?,
// nickname = ?,
// user_id = if( ? != "", 
//     (select case
//         when exists(select 1 from user where username = ?)
//         then (select user_id from user where username = ?)
//         else ?
//         end
//     ),
// null)where band_id = ?
// and nickname = ?
// `
// function updateBandMember(nickname, band_id, role, new_nickname, username) {
//     return db.execute(updateBandMemberSQL, [role, new_nickname || nickname, username, username, username, username, band_id, nickname])
// }


//Update member in band with new role
const updateBandMemberRoleSQL = `update band_member 
set role = ?
where band_id = ?
and nickname = ?
`
function updateBandMemberRole(nickname, band_id, role ) {
    return db.execute(updateBandMemberRoleSQL, [role, band_id, nickname])
}


//Update member in band with new nickname
// If new_nickname is blank, keep old nickname
const updateBandMemberNicknameSQL = `update band_member
set nickname = ?
where band_id = ?
and nickname = ?
`
function updateBandMemberNickname(nickname, band_id, new_nickname ) {
    return db.execute(updateBandMemberNicknameSQL, [new_nickname || nickname, band_id, nickname])
}

//Update member in band to be associated with a (different) user
const updateBandMemberUserSQL = `update band_member
set user_id = if( ? != "", 
    (select case
        when exists(select 1 from user where username = ?)
        then (select user_id from user where username = ?)
        else ?
        end
    ),
null)
where band_id = ?
and nickname = ?
`
function updateBandMemberUser(nickname, band_id, username ) {
    return db.execute(updateBandMemberUserSQL, [username, username, username, username, band_id, nickname])
}

//Delete a member in band
const deleteBandMemberSQL = `delete from band_member
where band_id = ?
and nickname = ?
`
function deleteBandMember(nickname, band_id) {
    return db.execute(deleteBandMemberSQL, [band_id, nickname])
}


// Get all band roles 
const getAllBandRolesSQL = `select * from band_role `
function getAllBandRoles() {
    return db.execute(getAllBandRolesSQL);
}


module.exports = {
    createBand,
    getBand,
    updateBandName,
    deleteBand,
    createBandMember,
    createBandMemberWithUsername,
    getBandMember,
    getBandMemberByUser,
    getAllBandsByUser,
    getAllBandMembersByBand,
    // updateBandMember,
    updateBandMemberRole,
    updateBandMemberNickname,
    updateBandMemberUser,
    deleteBandMember,
    getAllBandRoles
}


