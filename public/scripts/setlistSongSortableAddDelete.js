// Dependency: 
// sortable.js, which initializes Sortable
// list.js, initializes List
// songListInit.js, which initializes songList
// ejs.js, which initializes ejs
// flashMessageToast.js, which initializes flashInfo and flashError functions

const editSetlistSongForm = document.querySelector("#editSetlistSongForm");
if (editSetlistSongForm) {
    editSetlistSongForm.onsubmit = () => false;
}
async function sendUpdateSongsPost(){
    const body = new URLSearchParams(new FormData(editSetlistSongForm));
    body.set("method", 'update-songs');
    const response = await fetch(window.location.href, {
        method: "POST",
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        body: body
    });
    const {error} = await response.json(); 
    if (error) {
        throw Error(error);
    }
}


const setlistSongsList = document.querySelector("#setlist-songs")
if (setlistSongsList) {
    new Sortable(setlistSongsList, {
        handle: '.handle', // handle's class
        group: 'shared',
        animation: 150,
        onUpdate: async (event) => {
            try{
                await sendUpdateSongsPost();
                // I think this is too much!
                // flashInfo(`Re-ordered ${event.item.dataset.title}`);
            } catch(e){
                console.error(e);    
                flashInfo(`Failed to re-order songs. Refresh page.`);
            }
        } //whenever resorted, send update to server.
    });
}


const newSongTemplate = `
<li data-title="<%= song.title %>" data-song-id="<%= song['song-id'] %>">
    <input type="hidden" form="editSetlistSongForm" name="song_id" value="<%= song['song-id'] %>">
    
    <div class="collapsible-header valign-wrapper">
    <% if (allowEdit) { %>                                
        <i class="material-icons handle tooltipped" 
            data-tooltip="Drag to rearrange" data-position="left">drag_handle</i>
        <% } else {%>
            <i class="material-icons">drag_handle</i>
        <% } %>
        <div class="ch-content">
            <strong class="blue-text text-darken-3 tooltipped" data-tooltip="Click to expand details" data-position="top">
                <%= song.title %>
            </strong>
            <% if (allowEdit || song.note) { %> 
                <input class="song-note" type="text" form="editSetlistSongForm" 
                    name="note" maxlength=100 placeholder="Enter a performance note" value="<%=song.note%>" <%if (!allowEdit) {%> readonly <%}%> >
            <% } %>
        </div>
        <% if (allowEdit) { %>                                
        <span class="badge tooltipped" data-tooltip="Remove" data-position="top">
            <i class="material-icons red-text remove-song" >delete</i>
        </span>
        <% } %>
    </div>
    <div class="collapsible-body">
        
        Title: <a href="<%= song['song-link'] %>" 
            class="tooltipped" data-tooltip="Edit song details" data-position="top">
            <%= song.title %>
        </a>
        <br>Artist: <strong><%= song.artist%></strong>
        <br>(Typical) Key: <strong><%=song.key%></strong> 
        <br>Tempo: <strong><%=song.tempo%></strong>
        <br>Last Played: <strong>
            <span><%= song['last-played-pretty'] %></span> 
        </strong>
        <br>Tags: <div class="chips tags readonly no-autoinit">
            <% for (tag of song.tags.split(",")) {
                if (tag != '') {%>
                    <div class="chip"><%=tag%></div>
            <%}}%>
            </div>        
    </div>
</li>
`

document.querySelectorAll(".add-song").forEach((elm) => {
    elm.addEventListener('click', async () => {
        let [song] = songList.get("song-id", elm.dataset.songId);
        let html = ejs.render(newSongTemplate, {song: song._values, allowEdit: true})
        setlistSongsList.innerHTML += html;
        try {
            await sendUpdateSongsPost();
            M.Tooltip.init(document.querySelectorAll('.tooltipped'), {});
            listenForSongDelete();
            listenForSongNoteUpdate();
            flashInfo(`Added '${song._values.title}'`);    
        } catch(e) {
            console.error(e);    
            flashInfo(`Failed to add '${song._values.title}'. Refresh page.`);
            setlistSongsList.removeChild(setlistSongsList.lastChild);
        }
    })
});

// (re-)set all song delete listeners
function listenForSongDelete(){
    document.querySelectorAll(".remove-song").forEach((elm) => {
        elm.onclick = async () => {
            let li = elm.closest("li");
            try{
                li.remove();
                await sendUpdateSongsPost();
                flashInfo(`Removed '${li.dataset.title}'`);
            } catch(e) {
                console.error(e);    
                flashInfo(`Failed to remove '${li.dataset.title}'. Refresh page.`);    
            }
        };
    });
}

// (re-)set all song note update listeners
function listenForSongNoteUpdate(){
    document.querySelectorAll("input.song-note").forEach((elm) => {
        // Prevent clicking the note from expanding the collapsible
        elm.onclick = (event) => {
            event.stopPropagation();
        }
        // Send update post when input changed
        elm.onchange = async () => {
            let li = elm.closest("li");
            try{
                await sendUpdateSongsPost();
                flashInfo(`Updated note for '${li.dataset.title}'`);    
            } catch(e) {
                console.error(e);    
                flashInfo(`Failed to update note for '${li.dataset.title}'. Refresh page.`);    
            }
        };
    });
}

listenForSongDelete();
listenForSongNoteUpdate();

