// Important - must add .no-autoinit to the .tap-target elements
document.addEventListener('DOMContentLoaded', function() {
    var elems = document.querySelectorAll('.tap-target');
    var instances = M.TapTarget.init(elems, {});

    instances.forEach((i) => {
        i.open();
    });
  });