//use 'hey' when using in console

(async () => {
  const urlParams = new URLSearchParams(window.location.search);
  let js = urlParams.get('js');

  //deprecated: to bypass cors
  //const proxy = 'https://cors-anywhere.herokuapp.com/';  

  let txt;
  if(!js) txt = hey;
  else {
    const response = await fetch(js);
    txt = await response.text();
  }

  txt = txt
  .replace(/(^| +)\/\/.*/gm, '')          //주석 삭제
  .split('\n').map(line => line.trim())   //행별로 공백 삭제
  .filter(line => line).join(' ')         //빈 행 삭제
  .replace(/</g, '&lt;')                  //<> 이스케이프(여는 태그만 해도 됨)

  if(!js) {
    let win = window.open('', 'angela he', 'width=500,height=600,' + 'left=' + (window.screenX + (window.outerWidth - 500) / 2) + ',top=' + (window.screenY + (window.outerHeight - 740) / 2));
    txt = '<html><table><pre>'+txt+'</pre></table></html>';
    win.document.documentElement.textContent = txt;
    console.log(txt);
    win.document.close();
  }
  else {
    const table = document.createElement('table');
    const pre = document.createElement('pre');
    pre.textContent = txt;
    table.appendChild(pre);
    document.body.appendChild(table);
  }
})();