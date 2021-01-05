(async () => {
  const urlParams = new URLSearchParams(window.location.search);
  let js = urlParams.get('js');

  //const proxy = 'https://cors-anywhere.herokuapp.com/';  //to bypass cors
  const response = await fetch(js);
  let txt = await response.text();

  txt = txt
  .replace(/(^| +)\/\/.*/gm, '')                //주석 삭제
  .split('\n').map(line => line.trim())         //행별로 공백 삭제
  .filter(line => line).join(' ')               //빈 행 삭제
  .replace(/</g, '&lt;').replace(/>/g, '&lt;'); //<> 이스케이프

  const table = document.createElement('table');
  const pre = document.createElement('pre');
  pre.textContent = txt;
  table.appendChild(pre);
  document.body.appendChild(table);
})();