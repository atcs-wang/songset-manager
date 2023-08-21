const express = require('express');
const { requiresBandMember, requiresBandCoreMember } = require('../middleware/band');
const songApi = require('../db/song_api');
const setlistApi = require('../db/setlist_api');

let setlistRouter = express.Router();

setlistRouter.route(['/','/all'])
    .get( requiresBandMember, async (req, res) => { //Show all setlists
        let [setlists] = await setlistApi.getSetlistsByBand(req.band.band_id);
        res.render("setlist/all", { setlists , archive : false});    
        
    })
    .post(requiresBandCoreMember, async (req, res) => { // Handle creating a new setlist
        let [{ insertId }] = await setlistApi.createSetlist(req.user.user_id, req.band.band_id, 
                req.body.name, req.body.date, req.body.descr);
        
        res.redirect(`./${insertId}`);
    });

setlistRouter.route(['/','/archive'])
    .get( requiresBandMember, async (req, res) => { //Show all setlists
        let [setlists] = await setlistApi.getArchivedSetlistsByBand(req.band.band_id);
        res.render("setlist/all", { setlists , archive : true});    
    });

setlistRouter.route('/:setlist_id/')
    .get(requiresBandMember, async (req, res) => {    // Show information about a setlist
        let [[[setlist]],[songs]] = await setlistApi.getSetlist(req.params.setlist_id, req.band.band_id)
        
        if (setlist) {
            let [songlist] = await songApi.getSongsByBand(req.band.band_id);
            setlist.songs = songs;
            console.log(setlist);
            res.render("setlist/detail", {setlist, songlist});
        }
        else {
            res.status(404).send("No such setlist exists for this band. It may have been deleted or never created.");
        }
    })
    .post(requiresBandCoreMember, async (req, res) => {
        if (req.body.method == "update") {             // update setlist details.

            await setlistApi.updateSetlist(req.params.setlist_id, req.band.band_id, 
                req.body.name, req.body.date, req.body.descr, req.body.song_id, req.body.note);
            res.redirect('back');
        }
        else if (req.body.method == "delete") {
            await setlistApi.deleteSetlist(req.params.setlist_id, req.band.band_id);
            res.redirect('back');
        } 
        else if (req.body.method == "archive") {
            await setlistApi.archiveSetlist(req.params.setlist_id, req.band.band_id);
            res.redirect('back');
        }
        else if (req.body.method == "unarchive") {
            await setlistApi.unarchiveSetlist(req.params.setlist_id, req.band.band_id);
            res.redirect('back');
        }  else {
            res.status(422).send("POST request missing acceptable method")
        }

    })

module.exports = setlistRouter;