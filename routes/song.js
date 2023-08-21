const express = require('express');
const { requiresBandMember, requiresBandCoreMember } = require('../middleware/band');

const songApi = require('../db/song_api');
const {getSetlistsBySong} = require('../db/setlist_api');

let songRouter = express.Router();

songRouter.route(['/','/list'])
    .get( requiresBandMember, async (req, res) => { //Show all songs
        let [songlist] = await songApi.getSongsByBand(req.band.band_id);
        res.render("song/list", { songlist , archive : false});
    })
    .post(requiresBandCoreMember, async (req, res) => { // Handle creating a new song
        let [{ insertId }] = await songApi.createSong(req.user.user_id, req.band.band_id, 
                req.body.title, req.body.artist, req.body.key, 
                req.body.tempo, req.body.tags, req.body.notes);
        
        res.redirect(`./${insertId}`);
    });

songRouter.route(['/','/archive'])
    .get( requiresBandMember, async (req, res) => { //Show all songs
        let [songlist] = await songApi.getArchivedSongsByBand(req.band.band_id);
        res.render("song/list", { songlist , archive : true}); 
    });

songRouter.route('/:song_id/')
    .get(requiresBandMember, async (req, res) => {    // Show information about a song
        let [[song]] = await songApi.getSong(req.params.song_id, req.band.band_id);

        if (song) {
            let [setlists] = await getSetlistsBySong(req.params.song_id, req.band.band_id);
            res.render("song/detail", {song, setlists});
        }
        else {
            res.status(404).send("No such song exists for this band. It may have been deleted or never created.");
        }
    })
    .post(requiresBandCoreMember, async (req, res) => {
        if (req.body.method == "update") {             // update song details.
            await songApi.updateSong(req.params.song_id, req.band.band_id, 
                req.body.title, req.body.artist, req.body.key, 
                req.body.tempo, req.body.tags, req.body.notes);
            if (req.body.archive) {
                if (req.body.archive == "archive") {
                    await songApi.archiveSong(req.params.song_id, req.band.band_id);
                }
                else if (req.body.archive == "unarchive") {
                    await songApi.unarchiveSong(req.params.song_id, req.band.band_id);
                } 
            }
            res.redirect('back');
        }
        else if (req.body.method == "archive") {
            await songApi.archiveSong(req.params.song_id, req.band.band_id);
            res.redirect('back');
        }
        else if (req.body.method == "unarchive") {
            await songApi.unarchiveSong(req.params.song_id, req.band.band_id);
            res.redirect('back');
        }
        else if (req.body.method == "delete") {
            await songApi.deleteSong(req.params.song_id, req.band.band_id);
            if (req.body.redirect == 'archive') {
                res.redirect(`/band/${req.band.band_id}/song/archive`);
            }
            else res.redirect(`/band/${req.band.band_id}/song/list`);
        } 
         else {
            res.status(422).send("POST request missing acceptable method")
        }

    })

module.exports = songRouter;