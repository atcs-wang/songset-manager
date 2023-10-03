const bandApi = require('../db/band_api.js');
const { requiresUser } = require('./user.js');

// Returns a middleware function that attempts to load from the db
// the band and the user's band member info, based on the bandIdParam in the URL.
// Saves band and membership info as req.band and res.locals.band 
function loadBand(bandIdParam) { 
    return async (req, res, next) => {
        requiresUser( req, res, async function() {
            let [[band]] = await bandApi.getBand(req.params[bandIdParam]);
            if (!band) {
                return res.status(404).send("Band does not exist");
            }
            let [[member]] = await bandApi.getBandMemberByUser(req.user.user_id, band.band_id);
            if (req.user.privilege == 'Admin') {
                if (member)
                    member.role = 'owner';
                else 
                    member = {nickname : null, role : 'owner'} 
            }
            band.member = member;        
            req.band = band;
            res.locals.band = band;
            next();
        });
    }
}


// Middleware, requires that the user has some role in the band (or admin)
function requiresBandMember(req, res, next) {
    if (req.band?.member) {
        next();
    } else {
        res.status(403).send("User must be member of band.")
    }
}

// Middleware, requires that the user is 'owner' of the band (or admin)
function requiresBandOwner(req, res, next) {
    if (req.band?.member?.role == 'owner') {
        next();
    } else {
        res.status(403).send("User must have 'owner' role in the band. You can contact the owner of the band to have your role changed.")
    }
}

// Middleware, requires that the user is 'core' member or 'owner' of the band (or admin)
function requiresBandCoreMember(req, res, next) {
    if (req.band?.member?.role == 'owner' || req.band?.member?.role == 'core') {
        next();
    } else {
        res.status(403).send("User must have 'owner' role in the band. You can contact the owner of the band to have your role changed.")
    }
}

module.exports = {loadBand, requiresBandMember, requiresBandCoreMember, requiresBandOwner}