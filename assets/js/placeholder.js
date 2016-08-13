
(function() {
  // OPTIONAL: Add an extra class for styling, in browsers that support the placeholder attribute on fields.
  // http://stackoverflow.com/questions/8263891/simple-way-to-check-if-placeholder-is-supported
  if ('placeholder' in document.createElement('input') && 'placeholder' in document.createElement('textarea')) {
    var html = document.getElementsByTagName("html")[0]; html.className += " supports-placeholder";
  }
})();
