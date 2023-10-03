// Dependency: MaterializeCSS, which initailizes M

//Initializes any .chips elements also with the .tags or .tags-readonlyclass

//Any .chips.tags elements will be assumed part of a form, and given a hidden input
//with the name 'tags' to transmit content.

// For either, use the "data-tags" HTML attribute for class="chips tags" elements
// to specify initial content in comma-separated format

// Add "tags-readonly" to remove the X marks and remove user ability to add input
// Non-readonly tags create a hidden input sibling element with the name "tags" that maintains
// the values of the chips in comma-separated format

document.addEventListener('DOMContentLoaded', function() {

    let elems = document.querySelectorAll('.chips.tags');

    M.Chips.init(elems, {
        placeholder: "Tags: (Hit 'Enter')",
        secondaryPlaceholder: "+Tag (Hit 'Enter')"
    });

    // Prefill all tags with data-tags
    for(let elm of elems){
        let instance = M.Chips.getInstance(elm);
        if (elm.dataset.tags) {
            let tagsData = elm.dataset.tags.split(',').filter( t => (t != ''))
            tagsData.forEach(t => instance.addChip({tag: t}));    
        }
    }

    // Any form with a tags input, on submit creates 
    // a hidden input with the name 'tags' and the comma-separated list of tags
    let forms = document.querySelectorAll('form');

    for (let form of forms) {
        if (form.querySelector(".chips.tags")) {
            form.addEventListener('submit', (event) => {
                let tagsElm = form.querySelector(".chips.tags")
                let tagsInstance = M.Chips.getInstance(tagsElm);
                let tagsData = tagsInstance.chipsData.map(e => e.tag);
                let tagsString = tagsData.join(",");

                let hiddenInput = document.createElement("input");
                hiddenInput.setAttribute("type", "hidden");
                hiddenInput.setAttribute("name", "tags");
                hiddenInput.setAttribute("value", tagsString);
                form.appendChild(hiddenInput)
                return true;
            })
        }
    }

    //  for readonly elements, remove all input related aspects 
    let readonlyElems = document.querySelectorAll('.chips.tags.readonly');

    for(let elm of readonlyElems){

        elm.classList.remove("input-field");
        elm.querySelectorAll("input").forEach( i => i.remove());        

        var readonlyChips = elm.querySelectorAll('.chip > i.close');
        for (let elm of readonlyChips){
            elm.remove();
        }
    }

});