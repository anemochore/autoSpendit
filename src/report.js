//read v from sheet

(async () => {
  //URL 확인
  if(document.location.origin+document.location.pathname != 'https://app.spendit.kr/reports') {
    alert('https://app.spendit.kr/reports 페이지에서 실행해주세요.');
    return;
  }

  //vars to re-use
  let el, elBase;

  //폴리시 확인
  elBase = document.querySelector('ul#user>li#policy');
  if(elBase.innerText != v.policy) {
    el = await clickAndWait_(elBase.querySelector('div'), 'ul', elBase);
    el = [...el.querySelectorAll('li>a')].filter(el => el.innerText == v.policy)[0];
    await clickAndWait_(el, document.querySelector('div#alarm-pop'));
  }

  //상단 '추가' 버튼 클릭
  el = await clickAndWait_(document.querySelector('div#application div.button-group>button'), 'div.swal2-container button.swal2-confirm');  //'생성' 기다림

  //생성
  await clickAndWait_(el, 'div#report-document');
  await clickAndWait_(null, 'div#alarm-pop.disabled');  //알림 사라질 때까지 기다려야.
  await sleep(300);  //-_-...

  //제목
  elBase = document.querySelector('div#report-document header');
  await cInput_(null, v.title, 'h3', 'input', elBase);

  //세금계산서일 때는 보고서 타입 변경
  if(v.tax.startsWith('세금계산서')) {
    elBase = getRightDivs_('보고서 타입')
    await clickAndWait_(elBase.querySelector('button'), 'button', elBase);
    el = [...elBase.querySelectorAll('div>div+button+div>div')].filter(el => el.innerText == '세금계산서')[0];
    el = await clickAndWait_(el, 'div.swal2-popup button.swal2-confirm');  //'변경' 기다림
    await clickAndWait_(el, 'div#report-document');
    await clickAndWait_(null, 'div#alarm-pop.disabled');  //알림 사라질 때까지 기다려야.
    await sleep(300);  //-_-...
  }
  
  //지급처(이름)...실지급금액
  await cInput_('지급처(이름)', v.sangho);
  await cInput_('주민등록번호', v.regNo);
  await cInput_('실지급금액', v.price);

  //지급희망일
  elBase = getRightDivs_('지급희망일');
  el = elBase.querySelector('div>input');
  el = await clickAndWait_(el, 'table', elBase);
  let th = el.querySelector('div.rdtDays th.rdtSwitch');
  let thisYear = parseInt(th.innerText.split(' ').pop());
  let thisMonth = parseInt(th.getAttribute('data-value'));

  let yearDiff = thisYear - v.year;
  if(yearDiff > 1 || yearDiff < 0) {  //assert yearDiff == 1
    alert('1년 전만 지원합니다!');
    return;
  }

  let monthOffset = 0;
  if(yearDiff == 1) monthOffset = 12;

  let monthCount = thisMonth + monthOffset - v.month;
  for(let i=0; i<monthCount; i++)
    await clickAndWait_(el.querySelector('th.rdtPrev'), el);

  let dayEls = [...elBase.querySelectorAll('td[class="rdtDay"], td.rdtActive')];
  dayEls[v.day-1].click();

  //은행명...계약서
  await cInput_('은행명', v.bank);
  await cInput_('예금주', v.accountOwner);
  await cInput_('계좌번호', v.accountNo);
  await cInput_('전자결재문서', v.docNo);
  await cInput_('계약서', v.agreementNo);

  //내용
  await cInput_('내용', v.content, 'div', 'textarea');

  //첨부 파일(pdf)
  /*
  if(v._pdf) {
    const proxy = 'https://cors-anywhere.herokuapp.com/';  //to bypass cors
    const response = await fetch(proxy + v._pdf);  //로그인 필요... not working!!!
    const blob = await response.blob();

    const file = new File([blob], v._pdfName || '첨부.pdf', {type:'application/pdf'});
    const list = new DataTransfer();
    list.items.add(file);

    el = document.querySelector('input#searchFile');
    el.files = list.files;  //is it working? no...
  }
  */

  //지출 추가
  await clickAndWait_(getRightDivs_('지출 추가'), 'div.spendit-modal-container>div input[type="checkbox"]');
  elBase = document.querySelector('div.spendit-modal-container>div');
  el = [...elBase.querySelectorAll('div')].filter(el => el.innerText.trim().split('\n') == v.sangho)[0]
  .parentNode.firstChild.querySelector('input');  //체크박스
  el = await clickAndWait_(el, 'footer button', elBase);  //'1건의 지출 추가' 버튼 기다림
  el = await clickAndWait_(el, 'div[class*="actions"] button[class*="confirm"]');  //'추가' 버튼 기다림
  el = await clickAndWait_(el, 'div#report-view>div>ul>li>button');  //'제출' 버튼 기다림

  //제출
  alert('완료. 세금계산서는 지출 카테고리와 예산항목을 수정해야 하고, 정기지출은 수동으로 pdf 파일을 첨부해야 함)');
  document.querySelector('div.add-file-field').scrollIntoView();

  //el = await clickAndWait_(el, 'div.spendit-modal-container>div>footer button');
  //el.click();


  //utils
  function sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
  }

  async function cInput_(strToFind, value, firstSelector = 'div', tag = 'input', elBase = null) {
    if(!elBase) elBase = getRightDivs_(strToFind);
    if(!elBase || !value) return;

    let el = elBase.querySelector(firstSelector);
    el = await clickAndWait_(el, tag, elBase);
    setReactElValue_(el, value, tag);
    callReactEH_(el);

    await clickAndWait_(null, 'div#alarm-pop');
    await sleep(500);  //-_-...
  }

  function clickAndWait_(elToClick, elToWaitOrSelector = null, selectOn = document.documentElement) {
    return new Promise((resolve, reject) => {
      let selector;
      if(!elToWaitOrSelector)
        elToWaitOrSelector = elToClick;
      else if(typeof(elToWaitOrSelector) == 'string') {
        selector = elToWaitOrSelector;
        elToWaitOrSelector = selectOn;  //if selected el is already present, not good-_-
      }

      let observer;
      if(!selector) {
        observer = new MutationObserver(m => {
          observer.disconnect();
          console.log(elToWaitOrSelector, 'resolved (selector not presented)');
          resolve(elToWaitOrSelector);
        });
      }
      else {
        observer = new MutationObserver(m => {
          let els = [...selectOn.querySelectorAll(selector)];
          if(els.length > 0) {
            observer.disconnect();
            console.log(els[els.length-1], 'resolved');
            resolve(els[els.length-1]);
          }
        });
      }
      observer.observe(elToWaitOrSelector, {childList: true, subtree: true, attributes: true, characterData: true});
      if(elToClick) elToClick.click();
      console.log(elToClick, 'clicked');
    });
  }

  function setReactElValue_(el, value, tag = 'input') {
    let nativeInputValueElSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
    if(tag == 'textarea')
      nativeInputValueElSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value").set;
    const inputEvent = new Event('input', {bubbles: true});  //use 'input' on textArea too.

    nativeInputValueElSetter.call(el, value);
    el.dispatchEvent(inputEvent);
  }

  function callReactEH_(el) {
    const reh = Object.keys(el).filter(el => el.startsWith('__reactEventHandlers$'))[0];
    if(el[reh].onMouseDown)
      el[reh].onMouseDown();
    else if(el[reh].onClick)
      el[reh].onClick();
    else if(el[reh].onBlur)
      el[reh].onBlur();
    //else if(el[reh].onKeyDown)
      //el[reh].onKeyDown(new KeyboardEvent('keydown', {bubbles: true, keyCode: 13, key: 'Enter'}));
    else
      console.warn('no event handler found on', el);
  }

  function getRightDivs_(selText) {
    const RIGHT_SEL = 'div#report-document>div:last-child div';

    let divs = [...document.querySelectorAll(RIGHT_SEL)];
    divs = divs.filter(el => el.textContent == selText).pop();
    
    //cannot use ?. since https://javascript-minifier.com/ does not supports it :(
    if(divs)
      divs = divs.nextSibling;
    else
      divs = null;

    return divs;
  }

})();