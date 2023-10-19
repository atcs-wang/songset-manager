const express = require('express');
const { requiresBandMember, requiresBandCoreMember } = require('../middleware/band');

const songApi = require('../db/song_api');
const {getSetlistsBySong} = require('../db/setlist_api');

let songRouter = express.Router();

songRouter.route(['/','/all'])
    .get( requiresBandMember, async (req, res) => { //Show all songs
        let [songlist] = await songApi.getSongsByBand(req.band.band_id);
        res.render("song/all", { songlist , archive : false});
    })
    .post(requiresBandCoreMember, async (req, res) => { // Handle creating a new song
        if (req.body.method == 'create') { 
            try {
                let [{ insertId }] = await songApi.createSong(req.user.user_id, req.band.band_id, 
                    req.body.title, req.body.artist, req.body.key, 
                    req.body.tempo, req.body.tags, req.body.notes);
                req.flash('info', `Added '${req.body.title}'`);
            } catch (e) {
                res.status(500);
                req.flash('error', `Failed to add '${req.body.title}'`);
            }
            res.redirect('back');
        } else {
            res.status(422).send("POST request missing acceptable method")
        }
    });

songRouter.route(['/','/archive'])
    .get( requiresBandMember, async (req, res) => { //Show all songs
        let [songlist] = await songApi.getArchivedSongsByBand(req.band.band_id);
        res.render("song/all", { songlist , archive : true}); 
    });

songRouter.route('/:song_id/')
    .get(requiresBandMember, async (req, res) => {    // Show information about a song
        let [[song]] = await songApi.getSong(req.params.song_id, req.band.band_id);

        if (song) {
            let [setlists] = await getSetlistsBySong(req.params.song_id, req.band.band_id);
            res.render("song/detail", {song, setlists});
        }
        else {
            req.flash('error', "No such song exists for this band. It may be deleted.")
            res.status(404).redirect(req.baseUrl);
        }
    })
    .post(requiresBandCoreMember, async (req, res) => {
        let [[{title}]] = await songApi.getSongTitle(req.params.song_id, req.band.band_id);

        if (req.body.method == "update") {             // update song details.
            try {
                let [{changedRows}] = await songApi.updateSong(req.params.song_id, req.band.band_id, 
                    req.body.title, req.body.artist, req.body.key, 
                    req.body.tempo, req.body.tags, req.body.notes);
                if (changedRows){
                    title = req.body.title;
                    req.flash('info', `Updated '${title}'`);
                }
                
                if (req.body.archive) {
                    if (req.body.archive == "archive") {
                        let [{changedRows}] = await songApi.archiveSong(req.params.song_id, req.band.band_id);
                        if (changedRows)
                            req.flash('info', `Archived '${title}'`);
        
                    }
                    else if (req.body.archive == "unarchive") {
                        let [{changedRows}] = await songApi.unarchiveSong(req.params.song_id, req.band.band_id);
                        if (changedRows)
                            req.flash('info', `Unarchived '${title}'`);

                    } 
                }
            } catch (e) {
                req.flash('error', `Failed to update '${title}'`);
            }
            res.redirect('back');
        }
        else if (req.body.method == "archive") {
            let [{changedRows}] = await songApi.archiveSong(req.params.song_id, req.band.band_id);
            if (changedRows)
                req.flash('info', `Archived '${title}'`);
            res.redirect('back');
        }
        else if (req.body.method == "unarchive") {
            let [{changedRows}] = await songApi.unarchiveSong(req.params.song_id, req.band.band_id);
            if (changedRows)
                req.flash('info', `Unarchived '${title}'`);
            res.redirect('back');
        }
        else if (req.body.method == "delete") {
            let [{affectedRows}] = await songApi.deleteSong(req.params.song_id, req.band.band_id);
            if (affectedRows)
                req.flash('info', `Deleted '${title}'`);
            if (req.body.redirect == 'archive') {
                res.redirect(req.baseUrl + `/archive`);
            }
            else res.redirect(req.baseUrl + `/all`);
        } 
        else {
            res.status(422).send("POST request missing acceptable method")
        }

    })

module.exports = songRouter;