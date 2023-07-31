const DEBUG = true;
const SUPERUSER_PRIVELEGE = 'Admin';
const express = require('express');
const { requiresAuth } = require('express-openid-connect');
const userApi = require('../db/user_api.js');

let userRouter = express.Router();


// middleware that uses auth0's credentials to reference database for user information (username, privilege)
// If user does not yet exist in database, create the user in the database.
// saves user info as req.user and res.locals.user 
const loadUser = async (req, res, next) => {
    if (req.oidc.isAuthenticated()) {
        let user_id = req.oidc.user.sub;
        let [rows, fields] = await userApi.getUser(user_id);
        if (rows.length == 0) {
            await userApi.createUser(user_id, null);
            [rows, fields] = await userApi.getUser(user_id);
        }
        res.locals.user = rows[0];
        req.user = rows[0];
    } else {
        res.locals.user = null;
    }

    next();
}

// for debugging purposes:
// middleware that skips using Auth0, and referencing the database directly for credentials matching user_id. 
function fakeLoadUser(user_id) {
    return async  (req, res, next) => {
        let [rows, fields] = await userApi.getUser(user_id);
        if (rows.length == 0) {
            await userApi.createUser(user_id, null);
            [rows, fields] = await userApi.getUser(user_id);
        }
        res.locals.user = rows[0];
        req.user = rows[0];
        next();
    }
}

//Require that the user's user_id matches to access any user_id-parameterized routes
//Also allow for superusers with appropriate privilege levesl to also access to any user route
userRouter.param(`user_id`, (req, res, next, user_id) => { 
        //login should match 
    if (req.user.user_id == user_id || req.user.privilege == SUPERUSER_PRIVELEGE) {
        next();
    }
    else {
        res.status(403).send("User lacks sufficient privileges")
        // next(new Error("User lacks sufficient privileges"));
    }
});

function requiresSuperUser(req, res, next) {
    if (req.user.privilege == SUPERUSER_PRIVELEGE) {
        next();
    } else {
        res.status(403).send("User lacks sufficient privileges")
    }
    // next(new Error("User lacks sufficient privileges"));
}

userRouter.get('/list', requiresSuperUser, async (req, res) => {
    let [rows, fields] = await userApi.getUsersSearch(req.query.search);
    res.render("user/userlist", {profilelist : rows, searchquery : req.query.search});
});

userRouter.route('/:user_id')
    .get(async (req, res) => {
        let [privileges, priv_fields] = await userApi.getAllUserPrivileges();
        let [rows, fields] = await userApi.getUser(req.params.user_id);
        // res.send(rows);
        if (rows.length == 1){
            res.render("user/userprofile", {profile : rows[0], privileges: privileges});
        }
        else {
            res.status(404).send("No such user exists. It may have been deleted or never created.");
        }
    })
    .post(async (req, res, next) => {
        console.log(req.body)
        if (req.body.method == "update") {
            // update username.
            if (req.body.username) {
                try {
                    let results = await userApi.updateUsername(req.params.user_id, req.body.username);
                } catch (e) {
                    next( new Error(`Whoops! The username "${req.body.username}" is already taken. Please go back and try a different username.`))
                    return;
                }
            } 
            // update privilege. Only allowed by superusers
            if (req.body.privilege && req.user.privilege == SUPERUSER_PRIVELEGE) {
                let results = await userApi.updateUserPrivilege(req.params.user_id, req.body.privilege);
            }
            res.redirect('back');

        }
        else if (req.body.method == "delete") {
            await userApi.deleteUser(req.params.user_id);
            if (req.user.user_id == req.params.user_id)
                res.redirect('/logout');
            else 
                res.redirect('back');
        }

    })


//TODO add route to handle user privelege update
module.exports = { userRouter , loadUser, fakeLoadUser};