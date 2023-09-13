const express = require('express');
const { requiresUser, requiresUsername } = require('../middleware/user.js');
const {loadBand, requiresBandMember, requiresBandOwner}  = require('../middleware/band.js');
const bandApi = require('../db/band_api.js');
const {getUpcomingSetlistsByBand} = require('../db/setlist_api.js')
let bandRouter = express.Router();

bandRouter.route( ['/','/list'])
    .get(requiresUser, async (req, res) => { //Show all bands for the user
        let [bandlist] = await bandApi.getAllBandsByUser(req.user.user_id);
        res.render("band/list", { bandlist });
    })
    .post(requiresUsername, async (req, res) => { // Handle creating a new band
        let [{ insertId }] = await bandApi.createBand(req.body.name, req.user.user_id);
        await bandApi.createBandMemberWithUsername(req.body.nickname, insertId, "owner", req.user.username);
        res.redirect(req.baseUrl + `/${insertId}`);
    });


// Get band information for any route involving a band_id. 
// Get the membership of the user in the band.
// Saves band and membership info as req.band and res.locals.band 
bandRouter.route('/:band_id*').all( loadBand('band_id') );


bandRouter.route('/:band_id/')
    // Show information about a band
    .get(requiresBandMember, async (req, res) => {
        let [setlists] = await getUpcomingSetlistsByBand(req.band.band_id);
        res.render("band/profile", {setlists});
    })
    .post(requiresBandOwner, async (req, res) => {
        if (req.body.method == "update") {
            // update username.
            if (req.body.name) {
                let [results] = await bandApi.updateBandName(req.band.band_id, req.body.name);
                if (results.changedRows)
                    req.flash('info', `Band name updated to '${req.body.name}'`)
            } 
            res.redirect('back');
        }
        else if (req.body.method == "delete") {
            let [results] = await bandApi.deleteBand(req.band.band_id);
            if (results.affectedRows)
                req.flash('info', `Band '${req.band.name}' deleted`)
            res.redirect(req.baseUrl);
        }
    })

let memberRouter = express.Router();


bandRouter.use(["/:band_id/member","/:band_id/members"], memberRouter);

memberRouter.route( ['/','/list'])
    .get(requiresBandMember, async (req, res) => {
        let [rolelist] = await bandApi.getAllBandRoles();

        let [memberlist] = await bandApi.getAllBandMembersByBand(req.band.band_id);
        res.render("band/member/list", {memberlist, rolelist});
    })
    .post(requiresBandOwner, async (req, res) => { // Handle creating a new member of the band
        
        if (req.body.username) {
            try {
                let [{ affectedRows }] = await bandApi.createBandMemberWithUsername(req.body.nickname, req.band.band_id, req.body.role, req.body.username);
                if (affectedRows) {
                    req.flash('info', `'${req.body.username}' added to band with the nickname '${req.body.nickname}'`)
                } else {
                    req.flash('error', `No such username '${req.body.username}' exists.`)
                    res.status(422);                    
                }
            } catch (e) {
                if (e.code == 'ER_DUP_ENTRY') {
                    req.flash('error', `There's already a member with username '${req.body.username}' or nickname '${req.body.nickname}'.`);
                    res.status(422);
                }
            } 
        }
        else {
            try {
                let [{ affectedRows }] = await bandApi.createBandMember(req.body.nickname, req.band.band_id, req.body.role);
                if (affectedRows) {
                    req.flash('info', `'${req.body.nickname}' added to band`)
                } else {
                    req.flash('error', `'Failed to add ${req.body.nickname}' to band`)
                    res.status(422);                    
                }
            } catch (e) {
                if (e.code == 'ER_DUP_ENTRY') {
                    req.flash('error', `There's already a member with nickname '${req.body.nickname}'.`);
                    res.status(422);
                }
            } 
        }
        res.redirect(`back`);

    });


// Members can be located by username OR nickname, since both are unique
memberRouter.route("/:nickname")
    .get(requiresBandOwner, async (req, res) => {
        let [rolelist] = await bandApi.getAllBandRoles();
        let [[member]] = await bandApi.getBandMember(req.params.nickname, req.band.band_id);
        if (! member) {
            req.flash('error', `No such band member with nickname '${req.params.nickname}'`)
            res.status(404).redirect(req.baseUrl)
            return;
        }
        res.render("band/member/edit", {member, rolelist});
    })
    .post(requiresBandOwner, async (req, res) => { // Handle updating/deleting a member of the band
        if (req.body.method == "update") {
            // handle each update separately.

           
            // Disallow changing one's own username or role
            if (req.band.member.nickname != req.params.nickname) {
                // Update username
                if (req.body.username ) {
                    try {
                        let [{ changedRows }] = await bandApi.updateBandMemberUser(req.params.nickname, req.band.band_id, req.body.username);
                        if (changedRows == 1) {
                            req.flash('info', `Associated user updated to '${req.body.username}'`)
                        }
                    } catch (e) {
                        if (e.code == 'ER_DUP_ENTRY') {
                            res.status(422)
                            req.flash('error', `There's already a member with username '${req.body.username}'`);
                        }
                        else if (e.code.startsWith('ER_NO_REFERENCED_ROW')){
                            req.flash('error', `No user with username '${req.body.username}'`);
                        } else {
                            req.flash('error', `Username was not updated to '${req.body.username}'`);
                        }
                    } 
                }
                // Update role
                if (req.body.role && req.band.member.nickname != req.params.nickname ) {
                    try {
                        let [{ changedRows }] = await bandApi.updateBandMemberRole(req.params.nickname, req.band.band_id, req.body.role);
                        if (changedRows == 1) {
                            req.flash('info', `Role updated to '${req.body.role}'`)
                        }
                    } catch (e) {
                        req.flash('error', `Role was not updated to '${req.body.role}'`);
                    } 
                }
            }

            // (lastly) Update nickname
            if (req.body.nickname && req.body.nickname != req.params.nickname ) {                
                try {
                    let [{ changedRows }] = await bandApi.updateBandMemberNickname(req.params.nickname, req.band.band_id, req.body.nickname)
                    if (changedRows == 1) {
                        req.flash('info', `Nickname updated to'${req.body.nickname}'`)
                        return res.redirect(req.baseUrl + `/${req.body.nickname}`) //redirect to (new) URL for nickname
                    }
                } catch (e) {
                    if (e.code == 'ER_DUP_ENTRY') {
                        res.status(422)
                        req.flash('error', `There's already a member with nickname '${req.body.nickname}'`);
                    }
                    else {
                        req.flash('error', `Nickname was not updated to '${req.body.nickname}'`);
                    }
                } 
            }
            res.redirect(`back`); 
        }
        else if (req.body.method == "delete") {
            // TODO handle various kinds of errors.

            //Disallow deleting oneself from the band.
            if (req.band.member.nickname == req.params.nickname) {
                req.flash('error', "You can't delete your own membership from the band!");
                return res.status(422).redirect('back')
            }
            [{ affectedRows }] = await bandApi.deleteBandMember(req.params.nickname, req.band.band_id);
            if (affectedRows == 1) {
                req.flash('info', `Removed '${req.params.nickname}' from band`);
                return res.redirect(req.baseUrl);
                // return res.redirect(`/band/${req.band.band_id}/member/list`);
            }            
            res.redirect(`back`); 

        }  else {
            res.status(422).send("POST request missing acceptable method")
        }

    });





module.exports = bandRouter;