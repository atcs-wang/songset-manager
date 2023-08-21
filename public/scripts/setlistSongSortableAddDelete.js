// Dependency: 
// sortable.js, which initializes Sortable
// list.js, initializes List
// songListInit.js, which initializes songList
// ejs.js, which initializes ejs
new Sortable(document.querySelector("#setlist-songs"), {
    handle: '.handle', // handle's class
    group: 'shared',
    animation: 150
});

const newSongTemplate = `
<li>
<input type="hidden" form="editSetlistForm" name="song_id" value="<%= song['song-id'] %>">

<div class="collapsible-header valign-wrapper">
    <i class="material-icons handle">music_note</i>
    <div>
        <a href="<%= song['song-link'] %>" target="_blank">
            <%= song['title'] %>
        </a>
        <span>
        </span>
    </div>
    <span class="badge right"><i class="material-icons red-text remove-song" data-title="<%= song['title'] %>">delete</i>
    </span>
</div>
<div class="collapsible-body">
    <div class="input-field">
        <label>Performance Notes:</label>
        <input type="text" form="editSetlistForm" name="note" value="">
    </div>

    <br>
    Artist: <strong><%= song['artist']%></strong>
    <br>
    Tags: <div class="chips tags readonly no-autoinit">
        <% for (tag of song['tags'].split(",")) {
            if (tag != '') {%>
                <div class="chip"><%=tag%></div>
        <%}}%>
    </div>
    <br>
    (Typical) Key: <strong><%=song['key']%></strong> 
    <br>
    Tempo: <strong><%=song['tempo']%></strong>
    <br>
    Most Recent Set: <strong><a href="/set/<%=song['recent-set-id'] %>"><%= song['recent-set-name'] %></a> - <span><%= song['last-played-pretty'] %></span> </strong>

</div>

</li>
`

document.querySelectorAll(".add-song").forEach((elm) => {
    elm.addEventListener('click', () => {

        let [song] = songList.get("song-id", elm.dataset.songId);
        let html = ejs.render(newSongTemplate, {song: song._values})
        document.querySelector("#setlist-songs").innerHTML += html;
        listenForSongDelete();
        M.toast({html: `Added ${song._values.title}`});
    })
});

// (re-)set all song delete listeners
function listenForSongDelete(){
    document.querySelectorAll(".remove-song").forEach((elm) => {
        elm.onclick = () => {
            elm.closest("li").remove();
            M.toast({html: `Removed ${elm.dataset.title}`});    
        };
    });
}

listenForSongDelete();
