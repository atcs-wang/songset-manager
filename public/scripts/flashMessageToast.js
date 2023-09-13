function flashInfo(content){
    return M.toast({html: content,
        displayLength: 4000});
}
function flashError(content){
    return M.toast({html: content, 
        classes: "red-text pulse",
        displayLength: 6000})
}
document.querySelectorAll(".flash-info").forEach(
    (elm) => flashInfo(elm.innerHTML)
)

document.querySelectorAll(".flash-error").forEach(
    (elm) => flashError(elm.innerHTML)
)

