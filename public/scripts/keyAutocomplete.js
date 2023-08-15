document.addEventListener('DOMContentLoaded', function() {
    var elems = document.querySelectorAll('.autocomplete.key');
    var instances = M.Autocomplete.init(elems, {
        minLength: 0,
        data: {'C': null, 'Db': null, 'D': null, 'Eb': null, 'E': null, 'F': null, 
                'F#': null, 'G': null, 'Ab': null, 'A': null, 'Bb': null, 'B': null, 
                'C minor': null, 'C# minor': null, 'D minor': null, 'D# minor': null, 
                'E minor': null, 'F minor': null, 'F# minor': null, 'G minor': null, 
                'G# minor': null, 'A minor': null, 'Bb minor': null, 'B minor': null}});
  });