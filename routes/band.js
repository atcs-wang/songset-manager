const express = require('express');
const { requiresUser, requiresUsername, requiresSuperUser } = require('./user.js');
const bandApi = require('../db/band_api.js');

let bandRouter = express.Router();

bandRouter.route( ['/','/list'])
    .get(requiresUser, async (req, res) => { //Show all bands for the user
        let [bandlist] = await bandApi.getAllBandsByUser(req.user.user_id);
        res.render("band/list", { bandlist });
    })
    .post(requiresUsername, async (req, res) => { // Handle creating a new band

        console.log(req.body.name, req.user.user_id);
        let [{ insertId }] = await bandApi.createBand(req.body.name, req.user.user_id);
        await bandApi.createBandMemberWithUsername(req.body.nickname, insertId, "owner", req.user.username);
        res.redirect(`./${insertId}`);
    });


// Get band information for any route involving a band_id. 
// Get the membership of the user in the band.
// saves band and membership info as req.band and res.locals.band 
bandRouter.route('/:band_id*')
    .all( requiresUser )
    .all( async (req, res, next) => {
        let [[band]] = await bandApi.getBand(req.params.band_id);
        if (!band) {
            return res.status(404).send("Band does not exist");
        }
        let [[member]] = await bandApi.getBandMemberByUser(req.user.user_id, req.params.band_id);
        if (req.user.privilege == 'Admin') {
            if (member)
                member.role = 'owner';
            else 
                member = {nickname : null, role : 'owner'} 
        }
        band.member = member;        
        req.band = band;
        res.locals.band = band;
        console.log(band);
        next();
    });


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


bandRouter.route('/:band_id/')
    // Show information about a band
    .get(requiresBandMember, (req, res) => {
        res.render("band/profile");
    })
    .post(requiresBandOwner, async (req, res) => {
        if (req.body.method == "update") {
            // update username.
            if (req.body.name) {
                await bandApi.updateBandName(req.band.band_id, req.body.name);
            } 
            res.redirect('back');
        }
        else if (req.body.method == "delete") {
            await bandApi.deleteBand(req.band.band_id);
            res.redirect('../');
        }
    })

let memberRouter = express.Router();

bandRouter.all("/:band_id/members", (req, res) => res.redirect(`/band/${band.band_id}/member/list`));


bandRouter.use("/:band_id/member", memberRouter);

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
                if (affectedRows == 0) {
                    res.status(422).send(`No such username "${req.body.username}" exists. Please go back and try a different username.`);
                    return;
                }
            } catch (e) {
                if (e.code == 'ER_DUP_ENTRY') {
                    return res.status(422).send(`There's already a member with the username "${req.body.username}" or the nickname "${req.body.nickname}" in this band.`);
                }
            } 
        }
        else {
            try {
                await bandApi.createBandMember(req.body.nickname, req.band.band_id, req.body.role);
            } catch (e) {
                if (e.code == 'ER_DUP_ENTRY') {
                    return res.status(422).send(`There's already a member with the nickname "${req.body.nickname}" in this band.`);
                }
            } 
        }
        res.redirect(`back`);

    });


memberRouter.route("/:nickname")
    .get(requiresBandOwner, async (req, res) => {
        let [rolelist] = await bandApi.getAllBandRoles();
        let [[member]] = await bandApi.getBandMember(req.params.nickname, req.band.band_id);
        if (! member) {
            res.status(404).send("Band member does not exist")
            return;
        }
        res.render("band/member/edit", {member, rolelist});
    })
    .post(requiresBandOwner, async (req, res) => { // Handle updating/deleting a member of the band
        if (req.body.method == "update") {
            // TODO handle various kinds of errors.
            let affectedRows;
            // Disallow changing one's own username or role in the band, only nickname changes
            if (req.band.member.nickname == req.params.nickname) {
                try {
                    [{ affectedRows }] = await bandApi.updateBandMemberNickname(req.params.nickname, req.band.band_id, req.body.nickname)
                } catch (e) {
                    if (e.code == 'ER_DUP_ENTRY') {
                        return res.status(422).send(`There's already a member with the nickname "${req.body.nickname}" in this band.`);
                    }
                } 
            }
            else {
                try {
                    [{ affectedRows }] = await bandApi.updateBandMember(req.params.nickname, req.band.band_id, req.body.role, req.body.nickname, req.body.username);
                } catch (e) {
                    if (e.code == 'ER_DUP_ENTRY') {
                        return res.status(422).send(`There's already a member with the username "${req.body.username}" or the nickname "${req.body.nickname}" in this band.`);
                    }
                } 
            }
            if (affectedRows == 1) 
                return res.redirect(`./${req.body.nickname}`) //redirect to (new) URL for nickname
        }
        else if (req.body.method == "delete") {
            // TODO handle various kinds of errors.

            //Disallow deleting oneself from the band.
            if (req.band.member.nickname == req.params.nickname) {
                return res.status(422).send("You can't delete your own membership from the band!")
            }
            [{ affectedRows }] = await bandApi.deleteBandMember(req.params.nickname, req.band.band_id);
            if (affectedRows == 1)                
                return res.redirect(`/band/${band.band_id}/member/list`);
        }

        res.redirect(`back`); 
    });


// // Go to special "confirmation" page about deleting a song
// bandRouter.get("/:songid/delete", (req, res) => {
//     res.render("songs/songdelete", { categorylist, keylist, song: songlist[0]});
// });


// // Handle deleting a song
// bandRouter.post("/:songid/delete", (req, res) => {
//     res.send(req.body); //TODO
// });


// // Handle deleting a song
// bandRouter.post("/:songid/archive", (req, res) => {
//     res.send(req.body); //TODO
// });

// // Handle updating a song
// bandRouter.post('/:songid/', (req, res) => {
//     res.send(req.body); //TODO
// });



module.exports = bandRouter;