// Function wrappers for database queries related to users.
// Each returns a PROMISE of database results
// As a rule, the error handling and authentication aspects of each query are NOT handled here.

const db = require('./db_pool');


const getAllUserPrivilegesSQL = `select privilege from user_privilege`

function getAllUserPrivileges(){
    return db.execute(getAllUserPrivilegesSQL);
}

const createUserSQL = `insert into user
(user_id, username, privilege)
values (?,?,?);
`

function createUser(user_id, username = null, privilege = null) {
    return db.execute(createUserSQL, [user_id, username, privilege])
}

const getAllUsersSQL = `select user_id, username, privilege from user`

function getAllUsers(){
    return db.execute(getAllUsersSQL);
}

const getUsersSearchSQL = `select user_id, username, privilege from user where
    user_id like concat( '%',?,'%') or username like concat( '%',?,'%') or privilege like concat( '%',?,'%')`

function getUsersSearch(query){
    if (query)
        return db.execute(getUsersSearchSQL, [query, query, query]);
    else 
        return getAllUsers();
}

const getUserSQL = `select user_id, username, privilege from user
where user_id = ?`

function getUser(user_id){
    return db.execute(getUserSQL, [user_id]);
}

const updateUsernameSQL = `update user
set username = ?
where user_id = ? 
`

function updateUsername(user_id, username){
    return db.execute(updateUsernameSQL, [username, user_id]);
}

const updateUserPrivilegeSQL = `update user
set privilege = ?
where user_id = ? 
`

function updateUserPrivilege(user_id, privilege){
    return db.execute(updateUserPrivilegeSQL, [privilege, user_id]);
}

const deleteUserSQL = "delete from user where user_id = ?"

function deleteUser(user_id){
    return db.execute(deleteUserSQL, [user_id])
}

module.exports = {
    getAllUserPrivileges,
    createUser,
    getAllUsers,
    getUsersSearch,
    getUser,
    updateUsername,
    updateUserPrivilege,
    deleteUser
}
