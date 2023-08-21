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
    <i class="material-icons handle tooltipped" 
        data-tooltip="Drag to rearrange" data-position="right">music_note</i>
    <div class="tooltipped" data-tooltip="Click to expand details" data-position="top">
        <strong class="blue-text text-darken-3">    
            <%= song['title'] %>
        </strong>
        <span>
        </span>
    </div>
    <span class="badge tooltipped" data-tooltip="Remove" data-position="top">
        <i class="material-icons red-text remove-song" data-title="<%= song['title'] %>">delete</i>
    </span>
</div>
<div class="collapsible-body">


    Title: <a href="<%= song['song-link'] %>" target="_blank"
                class="tooltipped" data-tooltip="Edit song details" data-position="top">
                <%= song.title %>
            </a>
    <br>
    Artist: <strong><%= song['artist']%></strong>
    <br>
    (Typical) Key: <strong><%=song['key']%></strong> 
    <br>
    Tempo: <strong><%=song['tempo']%></strong>
    <br>
    Tags: <div class="chips tags readonly no-autoinit">
        <% for (tag of song['tags'].split(",")) {
            if (tag != '') {%>
                <div class="chip"><%=tag%></div>
        <%}}%>
    </div>
    <br>
    Most Recent Set: <strong>
        <a href="/set/<%=song['recent-set-id'] %>"><%= song['recent-set-name'] %></a> - <span><%= song['last-played-pretty'] %></span>
    </strong>
    <div class="input-field">
        <label>Add a Performance Note:</label>
        <input type="text" form="editSetlistForm" name="note" value="">
    </div>
</div>

</li>
`

document.querySelectorAll(".add-song").forEach((elm) => {
    elm.addEventListener('click', () => {

        let [song] = songList.get("song-id", elm.dataset.songId);
        let html = ejs.render(newSongTemplate, {song: song._values})
        document.querySelector("#setlist-songs").innerHTML += html;
        M.Tooltip.init(document.querySelectorAll('.tooltipped'), {});
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
