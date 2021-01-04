//(async () => {

  function escapeHtml(text) {
    var map = {
      //'&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      //'"': '&quot;',
      //"'": '&#039;'
    };
    
    //return text.replace(/[&<>"']/g, function(m) { return map[m]; });
    return '<html><body><table><pre>' + text.replace(/[<>]/g, function(m) { return map[m]; }) + '</pre></table></body></html>';
  }

//})();


