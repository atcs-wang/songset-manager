const songApi = require('../song_api');
const db = require('../db_pool');

let [a, b, user_id, band_id, songCount] = process.argv;
songCount = Number(songCount);
console.log(user_id)
console.log(band_id)
console.log(songCount);

let randomTags = ['Happy', 'Fast', 'Hard', 'Hit', 'Sad', 'Slow', 'Easy', 'Deep Cut'];
let randomKeys = ['A', 'A minor', 'B minor', 'C', 'D minor', 'D', 'E', 'E minor', 'F', 'G'];


const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ   abcdefghijklmnopqrstuvwxyz   0123456789';
function randomString(length){
    let result = '';
    for (let c = 0; c < length; c++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

let promises = [];
for (let i =0; i < songCount; i++) {
    let promise = songApi.createSong(user_id,band_id, randomString(10), randomString(8), 
                randomKeys[Math.floor(Math.random() * randomKeys.length)], 
                Math.floor(Math.random() * 100 + 60), 
                randomTags.slice(Math.floor(Math.random() * (randomTags.length-2)), Math.floor(Math.random() * (randomTags.length-2) + 2)).join(","), 
                randomString(20));
    promises.push(promise);
}

Promise.all(promises).then( () => {
    console.log("Done, you can stop the process now.");
}).catch( (error) => {
    console.error(error);
});
