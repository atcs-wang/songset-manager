// Dependency: MaterializeCSS, which initailizes M

var elems = document.querySelectorAll('.collapsible.expandable');
var instance = M.Collapsible.init(elems, {
  accordion: false
});