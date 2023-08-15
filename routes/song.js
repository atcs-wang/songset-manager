const express = require('express');
const { requiresBandMember, requiresBandCoreMember } = require('../middleware/band');

const songApi = require('../db/song_api');

let songRouter = express.Router();

songRouter.route(['/','/list'])
    .get( requiresBandMember, async (req, res) => { //Show all songs
        if (req.query.search) {
            let [songlist] = await songApi.searchSongsByBand(req.band.band_id, req.query.search);
            res.render("song/list", { songlist , search: req.query.search, archive : false});    
        } else {
            let [songlist] = await songApi.getSongsByBand(req.band.band_id);
            res.render("song/list", { songlist , archive : false});    
        }
    })
    .post(requiresBandCoreMember, async (req, res) => { // Handle creating a new song
        let [{ insertId }] = await songApi.createSong(req.user.user_id, req.band.band_id, 
                req.body.title, req.body.artist, req.body.key, 
                req.body.tempo, req.body.tags, req.body.notes);
        
        res.redirect(`./${insertId}`);
    });

songRouter.route(['/','/archive'])
    .get( requiresBandMember, async (req, res) => { //Show all songs
        if (req.query.search) {
            let [songlist] = await songApi.searchArchivedSongsByBand(req.band.band_id, req.query.search);
            res.render("song/list", { songlist , search: req.query.search, archive : true});    
        } else {
            let [songlist] = await songApi.getArchivedSongsByBand(req.band.band_id);
            res.render("song/list", { songlist , archive : true});    
        }
    });

songRouter.route('/:song_id/')
    // Show information about a song
    .get(requiresBandMember, (req, res) => {
        res.render("song/detail");
    })
    .post(requiresBandCoreMember, async (req, res) => {
        if (req.body.method == "update") {             // update song details.
            await songApi.updateSong(req.params.song_id, req.band.band_id, 
                req.body.title, req.body.artist, req.body.key, 
                req.body.tempo, req.body.tags, req.body.notes);
            res.redirect('back');
        }
        else if (req.body.method == "delete") {
            await songApi.deleteSong(req.params.song_id, req.band.band_id);
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

    })


module.exports = songRouter;