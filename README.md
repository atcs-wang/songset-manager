An inventory-style webapp (Node/Express/EJS/MySQL) for managing your bands' setlists.
Currently hosted at [songsets.up.railway.app/](https://songset-manager-production.up.railway.app/).

## Features:
- Auth0 powered login
- Users can create and join bands, allowing collaboration with different roles (owner, core, readonly).
- Each band maintains their own library of songs and setlists of those songs
- Easily add, delete, and reorder songs within setlists, plus add performance notes for each song in the list.
- See a song's history of use across setlists.
- Songs can be searched/sorted by title, tags, last date played, etc. 
- Setlists can be searched/sorted by name, date, last updated, songs, etc.
- Songs and setlists can be archived (and unarchived), maintaining complete records while reducing clutter for future setlists.

## Notable Libraries used:
- [mysql2](https://www.npmjs.com/package/mysql2) 
- [MaterializeCSS](https://materializecss.com/)
- [EJS](https://ejs.co/)
- [List.js](https://listjs.com/docs/)
- [SortableJS](http://sortablejs.github.io/Sortable/)

### Big TODOs:
- Server-side form validation
- API and route testing
- (More) Client-Side-Rendering
- Session-based notifications for confirmation of actions 

### Small TODOs:
- Patch out use of EJS on browser side
- Refactor create setlist form into partial
- Allow create setlist on Band profile page
- Move song/set related heads/footers into partials
- Add song page's list of sets to include performance notes of that song
