// Dependency: list.js, initializes List

var options = {
    valueNames: [ 
        'name', 
        {name: 'date-yyyymmdd', attr: 'data-date'},
        'date-pretty',
        'descr', 
        'songs',
        {name: 'updated-at', attr: 'data-updated-at'},
        
    ],
    searchColumns: ['name', 'date-pretty', 'date-yyyymmdd', 'descr', 'songs'],
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

var setlistList = new List('setlists', options);