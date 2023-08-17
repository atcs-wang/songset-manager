var options = {
    valueNames: [ 
        'title', 
        'artist',   
        { name: 'tags', attr: 'data-tags' }, 
        'key', 
        'tempo', 
        { name: 'last-played', attr: "data-last-played"},
        { name: 'recent-set', attr: "data-recent-set"}

    ],
    searchColumns: ['title', 'artist', 'tags', 'key', 'tempo','last-played', 'recent-set'],
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