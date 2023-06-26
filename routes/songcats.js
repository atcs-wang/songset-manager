const DEBUG = true;

const express = require('express');
const dbApi = require('../db/api');

let songcatsRouter = express.Router();

// Temp data
const categorylist = [{categoryId : 1, categoryName : "Hymn", songCount: 100}, {categoryId : 2, categoryName : "Praise", songCount: 21}];


const songlist =  [{songId: 1, title: "Amazing Grace", artist: null, categoryId: 1, categoryName: "Hymn", 
                    keyId: 2, keyName : "C Major", lastPlayedDateFormatted: "Mar 21, 2023", notes:"Great hymn."},
                    {songId: 2, title: "How Great is Our God", artist: "Chris Tomlin", categoryId: 2, categoryName: "Praise", 
                    keyId: 1, keyName : "G Major", lastPlayedDateFormatted: "Mar 28, 2023", notes:"Great song."}
                ]
        
//Show all song categories
songcatsRouter.get('/', (req, res) => {
    res.render("songs/category/catlist", { categorylist, listTitle: null});
});
 
// Handle creating a new song category
songcatsRouter.post('/', (req, res) => {
    res.send(req.body); //TODO
});

// Go to special "confirmation" page about deleting a song category
songcatsRouter.get("/:songcatid/delete", (req, res) => {
    res.render("songs/category/catdelete", { category: categorylist[0]});

});


// Handle deleting a song category
songcatsRouter.post("/:songcatid/delete", (req, res) => {
    res.send(req.body); //TODO
});

// Handle updating a song category
songcatsRouter.post('/:songcatid/update', (req, res) => {
    res.send(req.body); //TODO
});

// Show information about a category, including list of songs in that category
songcatsRouter.get('/:songcatid/', (req, res) => {
    res.render("songs/songlist", { categorylist, keylist, songlist, category, listTitle: "Songs in category " + req.params.songcatid});
});

module.exports = songcatsRouter;