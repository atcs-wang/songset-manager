// Function wrappers for database queries related to users.
// Each returns a PROMISE of database results
// As a rule, the error handling and authentication aspects of each query are NOT handled here.

const db = require('./db_pool');

const createUserSQL = `insert into user
(user_id, nickname, privilege)
values (?,?,?);
`

function createUser(user_id, nickname = null, privilege = null) {
    return db.execute(createUserSQL, [user_id, nickname, privilege])
}

const getUserSQL = `select user_id, nickname, privilege from user
where user_id = ?`

function getUser(user_id){
    return db.execute(getUserSQL, [user_id]);
}

const updateUserNicknameSQL = `update user
set nickname = ?
where user_id = ? 
`

function updateUserNickname(user_id, nickname){
    return db.execute(updateUserNicknameSQL, [nickname, user_id]);
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
    return db.execute(deleteUserSQL, [user_id, user_id])
}

module.exports = {
    createUser,
    getUser,
    updateUserNickname,
    updateUserPrivilege,
    deleteUser
}
