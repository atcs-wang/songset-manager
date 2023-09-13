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
    .post(requiresBandCoreMember, async (req, res) => { 
        if (req.body.method == 'create') {  // Handle creating a new setlist
            let [{ insertId }] = await setlistApi.createSetlist(req.user.user_id, req.band.band_id, 
                    req.body.name, req.body.date, req.body.descr);
            
            res.redirect(req.baseUrl + `/${insertId}`);
        } else if (req.body.method == "archive") {
            let [{changedRows}] = await setlistApi.archiveSetlistsBeforeDate(req.band.band_id, req.body.date);
            req.flash("info", `Archived ${changedRows} sets`)
            res.redirect('back');
        }else {
            res.status(422).send("POST request missing acceptable method")
        }
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
            res.render("setlist/detail", {setlist, songlist});
        }
        else {
            req.flash('error', "No such setlist exists for this band. It may be deleted.")
            res.status(404).redirect(req.baseUrl);
        }
    })
    .post(requiresBandCoreMember, async (req, res) => {
        let [[{name}]] = await setlistApi.getSetlistName(req.params.setlist_id, req.band.band_id);

        if (req.body.method == "update-details") {             // update setlist details.
            try {
                let [{changedRows}] = await setlistApi.updateSetlistDetails(req.params.setlist_id, req.band.band_id, 
                    req.body.name, req.body.date, req.body.descr);   
                if (changedRows){
                    req.flash('info', `Updated '${req.body.name}' details`);
                } 
            } catch (e) {
                req.flash('error', `Failed to update '${name}' details`);
            }
            res.redirect('back');

        } else if (req.body.method == 'update-songs') { //this is an AJAX call; respond with JSON
            try {
                await setlistApi.updateSetlistSongs(req.params.setlist_id, req.band.band_id, 
                    req.body.song_id, req.body.note);    
                res.json({});
            } catch (e) {
                res.json({error: e});
            }
        } else if (req.body.method == 'create') { 
            try {
                let [{ insertId }] = await songApi.createSong(req.user.user_id, req.band.band_id, 
                    req.body.title, req.body.artist, req.body.key, 
                    req.body.tempo, req.body.tags, req.body.notes);

                await setlistApi.addSetlistSong(req.params.setlist_id, req.band.band_id, 
                    insertId, null); 

                req.flash('info', `Added '${req.body.title}'`);   
            } catch (e) {
                res.status(500);
                req.flash('error', `Failed to add '${req.body.title}' to '${name}'.`);
            }
            res.redirect('back');
        }
        else if (req.body.method == "archive") {
            let [{changedRows}] = await setlistApi.archiveSetlist(req.params.setlist_id, req.band.band_id);
            if (changedRows)
                req.flash('info', `Archived '${name}'`);
            res.redirect('back');
        }
        else if (req.body.method == "unarchive") {
            let [{changedRows}] = await setlistApi.unarchiveSetlist(req.params.setlist_id, req.band.band_id);
            if (changedRows)
                req.flash('info', `Unarchived '${name}'`);
            res.redirect('back');
        } 
        else if (req.body.method == "delete") {
            let [{changedRows}] = await setlistApi.deleteSetlist(req.params.setlist_id, req.band.band_id);
            if (changedRows)
                req.flash('info', `Deleted '${name}'`);

            if (req.body.redirect == 'archive') {
                res.redirect(req.baseUrl + `/archive`);
            }
            else res.redirect(req.baseUrl + `/all`);
        } 
        else {
            res.status(422).send("POST request missing acceptable method")
        }

    })

module.exports = setlistRouter;