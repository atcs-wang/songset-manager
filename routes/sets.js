const DEBUG = true;

const express = require('express');
const dbApi = require('../db/api');

let setsRouter = express.Router();

//Show all sets
setsRouter.get('', (req, res) => {
    res.status(404).send("Coming soon!");
});

// Handle creating a new set
setsRouter.post('', (req, res) => {
    res.status(404).send("Coming soon!");
});

// Go to special "confirmation" page about deleting a set
setsRouter.get("/:setid/delete", (req, res) => {
    res.status(404).send("Coming soon!");
});


// Handle deleting a set
setsRouter.post("/:setid/delete", (req, res) => {
    res.status(404).send("Coming soon!");
});

// Handle updating information about a set
setsRouter.post('/:setid/update', (req, res) => {
    res.status(404).send("Coming soon!");
});

// Show information about a set, including list of songs in it
setsRouter.get('/:setid/', (req, res) => {
    res.status(404).send("Coming soon!");
});

// Handle adding songs to a set
setsRouter.post('/:setid/add/:songid', (req, res) => {
    res.status(404).send("Coming soon!");
});

// Handle removing a song from a set
setsRouter.post('/:setid/remove/:songid', (req, res) => {
    res.status(404).send("Coming soon!");
});

// Handle changing information about a song in a set
setsRouter.post('/:setid/update/:songid', (req, res) => {
    res.status(404).send("Coming soon!");
});


module.exports = setsRouter;