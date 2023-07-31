// For any submit-type inputs that warrant confirmation, 
// add "confirm-submit." as class
// OPTIONAL attributes: 
//  data-confirm-msg
//  data-require-retype 
//  data-retype-failure-msg
document.querySelectorAll("form.confirm-submit").forEach( form => {
    if (form.dataset.requireRetype){
        form.addEventListener("submit", (event) => { 
            let attempt = prompt(form.dataset.confirmMsg || `Please retype "${form.dataset.requireRetype}" to confirm.`)
            if (attempt == null) {
                event.preventDefault();
                return false;
            } else if (attempt == form.dataset.requireRetype) {
                return true;
            }
            else {
                alert(form.dataset.retypeFailureMsg || `You did not correctly retype "${form.dataset.requireRetype}", and the operation was not confirmed.`)
                event.preventDefault();
                return false;
            }
        }) ;
    } else {
        form.addEventListener("submit", (event) => {
            if (confirm(form.dataset.confirmMsg || `Please confirm.`)){
                return true;
            } else {
                event.preventDefault();
                return false;
            };
        } );
    }
});
