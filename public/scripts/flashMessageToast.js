document.querySelectorAll(".flash-info").forEach(
    (elm) => {
        M.toast({html: elm.innerHTML})
    }
)