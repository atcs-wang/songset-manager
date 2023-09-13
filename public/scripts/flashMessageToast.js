document.querySelectorAll(".flash-info").forEach(
    (elm) => {
        M.toast({html: elm.innerHTML,
            displayLength: 4000})
    }
)

document.querySelectorAll(".flash-error").forEach(
    (elm) => {
        M.toast({html: elm.innerHTML, 
            classes: "red-text pulse",
            displayLength: 6000})
    }
)