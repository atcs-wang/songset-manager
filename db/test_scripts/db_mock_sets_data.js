const setlistApi = require('../setlist_api');
const db = require('../db_pool');

let [a, b, user_id, band_id, setlistCount] = process.argv;
setlistCount = Number(setlistCount);
console.log(user_id)
console.log(band_id)
console.log(setlistCount);

const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ   abcdefghijklmnopqrstuvwxyz   0123456789';
function randomString(length){
    let result = '';
    for (let c = 0; c < length; c++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

function randomDate(start, end) {
    var date = new Date(+start + Math.random() * (end - start));
    return date;
  }

let promises = [];
for (let i =0; i < setlistCount; i++) {
    let promise = setlistApi.createSetlist(user_id,band_id, randomString(10), 
    randomDate(new Date(2020, 0, 1), new Date()),
                randomString(20));
    promises.push(promise);
}

Promise.all(promises).then( () => {
    console.log("Done, you can stop the process now.");
}).catch( (error) => {
    console.error(error);
});
