const DEBUG = true;

const express = require('express');
const dbApi = require('../db/api');

let songsRouter = express.Router();

let songcatsRouter = require("./songcats.js");
songsRouter.use("/category", songcatsRouter);

// Temp data
const categorylist = [{categoryId : 1, categoryName : "Hymn"}, {categoryId : 2, categoryName : "Praise"}];
const keylist =  [{keyId : 1, keyName : "G Major"},{keyId : 2, keyName : "C Major"}];
const songlist =  [{songId: 1, title: "Amazing Grace", artist: null, categoryId : 1, category: "Hymn", 
                    keyId : 2, key : "C Major", lastPlayedDate: "20230421", lastPlayedDateReadable: "Apr 21, 2023", notes:"Great hymn."},
                    {songId: 2, title: "How Great is Our God", artist: "Chris Tomlin", categoryId : 2, category: "Praise", 
                    keyId : 1, key : "G Major", lastPlayedDate: "20230228", lastPlayedDateReadable: "Feb 28, 2023", notes:"Great song."}
                ]

//Show all songs
songsRouter.get('/', (req, res) => {
    res.render("songs/songlist", { categorylist, keylist, songlist, listTitle: null});
});

// Handle creating a new song
songsRouter.post('/', (req, res) => {
    res.send(req.body); //TODO //TODO
});

// Go to special "confirmation" page about deleting a song
songsRouter.get("/:songid/delete", (req, res) => {
    res.render("songs/songdelete", { categorylist, keylist, song: songlist[0]});
});


// Handle deleting a song
songsRouter.post("/:songid/delete", (req, res) => {
    res.send(req.body); //TODO
});


// Handle deleting a song
songsRouter.post("/:songid/archive", (req, res) => {
    res.send(req.body); //TODO
});

// Handle updating a song
songsRouter.post('/:songid/', (req, res) => {
    res.send(req.body); //TODO
});


// Show information about a song, including list of sets it is in
songsRouter.get('/:songid/', (req, res) => {
    res.render("songs/songdetail", { categorylist, keylist, song: songlist[0] });
});


module.exports = songsRouter;