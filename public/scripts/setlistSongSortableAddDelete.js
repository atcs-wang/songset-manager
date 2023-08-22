// Dependency: 
// sortable.js, which initializes Sortable
// list.js, initializes List
// songListInit.js, which initializes songList
// ejs.js, which initializes ejs

const editSetlistForm = document.querySelector("#editSetlistForm");

async function sendUpdatePost(){
    const response = await fetch(window.location.href, {
        method: "POST",
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
        body: new URLSearchParams(new FormData(editSetlistForm))
    });
    const {error} = await response.json(); 
    if (error) {
        throw Error(error);
    };
}

const setlistSongsList = document.querySelector("#setlist-songs")
new Sortable(setlistSongsList, {
    handle: '.handle', // handle's class
    group: 'shared',
    animation: 150,
    onUpdate: async (event) => {
        try{
            await sendUpdatePost();
        } catch(e){
            M.toast({html: `ERROR: RE-ordering failed. Refresh page.`});
            console.error(e);    
        }
    } //whenever resorted, send update to server.
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
    elm.addEventListener('click', async () => {
        try {
            let [song] = songList.get("song-id", elm.dataset.songId);
            let html = ejs.render(newSongTemplate, {song: song._values})
            document.querySelector("#setlist-songs").innerHTML += html;
            await sendUpdatePost();
            M.Tooltip.init(document.querySelectorAll('.tooltipped'), {});
            listenForSongDelete();
            M.toast({html: `Added ${song._values.title}`});    
        } catch(e) {
            M.toast({html: `ERROR: Did not add ${song._values.title}. Refresh page.`});
            console.error(e);        
        }
    })
});

// (re-)set all song delete listeners
function listenForSongDelete(){
    document.querySelectorAll(".remove-song").forEach((elm) => {
        elm.onclick = async () => {
            try{
                elm.closest("li").remove();
                await sendUpdatePost();
                M.toast({html: `Removed ${elm.dataset.title}`});    
            } catch(e) {
                M.toast({html: `ERROR: Did not add ${elm.dataset.title}. Refresh page.`});    
                console.error(e);    
            }
        };
    });
}

listenForSongDelete();

