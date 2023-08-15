const userApi = require('../db/user_api.js');

// middleware that uses auth0's credentials to reference database for user information (username, privilege)
// If user does not yet exist in database, create the user in the database.
// saves user info as req.user and res.locals.user 
async function loadUser (req, res, next) {
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
        req.user = null;
    }

    next();
}

// for debugging/testing purposes:
// returns a middleware that skips using Auth0, 
// and references the database directly for credentials matching the given user_id. 
function fakeLoadUser(user_id) {
    return async  (req, res, next) => {
        let [rows] = await userApi.getUser(user_id);
        if (rows.length == 0) {
            await userApi.createUser(user_id, null);
            [rows] = await userApi.getUser(user_id);
        }
        res.locals.user = rows[0];
        req.user = rows[0];
        next();
    }
}

function requiresUser(req, res, next) {
    if (req.user) {
        next();
    } else {
        res.status(403).send("User must be logged in")
    }
}

function requiresUsername(req, res, next) {
    if (req.user?.username) {
        next();
    } else {
        res.status(403).send("User must have a username. Please set one in your profile/settings.")
    }
}

function requiresSuperUser(req, res, next) {
    if (req.user.privilege == 'Admin') {
        next();
    } else {
        res.status(403).send("User lacks sufficient privileges")
    }
    // next(new Error("User lacks sufficient privileges"));
}

module.exports = { loadUser, fakeLoadUser, requiresUser, requiresUsername, requiresSuperUser}