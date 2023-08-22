// Dependency: list.js, initializes List

var options = {
    valueNames: [ 
      { data: ['song-id'] },       
        'title', 
        { name: 'song-link', attr: 'href' }, 
        'artist',   
        { name: 'tags', attr: 'data-tags' }, 
        'key', 
        'tempo', 
        { name: 'last-played-yyyymmdd', attr: "data-last-played"},
        'last-played-pretty'
    ],
    searchColumns: ['title', 'artist', 'tags', 'key', 'tempo','last-played-yyyymmdd', 'last-played-pretty', 'recent-set'],
    page: 10,
    pagination: [{
        name: "paginationTop",
        paginationClass: "paginationTop",
        outerWindow: 1
      }, {
        paginationClass: "paginationBottom",
        innerWindow: 3,
        outerWindow: 2
      }]
};

var songList = new List('songlist', options);