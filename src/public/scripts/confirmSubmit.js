// For any submit-type forms or submit buttons buttons that warrant confirmation, 
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

document.querySelectorAll("button[type=submit].confirm-submit").forEach( button => {

    if (button.dataset.requireRetype){
        button.form.addEventListener("submit", (event) => { 
            if (event.submitter == button) {
                let attempt = prompt(button.dataset.confirmMsg || `Please retype "${button.dataset.requireRetype}" to confirm.`)
                if (attempt == null) {
                    event.preventDefault();
                    return false;
                } else if (attempt == button.dataset.requireRetype) {
                    return true;
                }
                else {
                    alert(button.dataset.retypeFailureMsg || `You did not correctly retype "${button.dataset.requireRetype}", and the operation was not confirmed.`)
                    event.preventDefault();
                    return false;
                }
            }
            return true;
        }) ;
    } else {
        button.form.addEventListener("submit", (event) => {
            if (event.submitter == button) {

                if (confirm(button.dataset.confirmMsg || `Please confirm.`)){
                    return true;
                } else {
                    event.preventDefault();
                    return false;
                };
            }
            return true;

        } );
    }
});