//#정기인세 등
//총액만. 현금으로.
//'상호'는 IT2팀 정기인세
//'날짜'는 전월 마지막 날로.
//'환급'에 체크

//보고서 생성
//정기지출 폴리시
//제목 입력: 정기인세(21년 1월)_팀(담당자) / [스벨트 앤 새퍼 인 액션] 번역계약금 지급(박수현)
//내용 입력
//지출 추가
//구글 시트를 pdf로 저장해서 첨부
//예산항목: ...
//제출

(async () => {
  const v = {
    policy: '[HM]원천징수',
    title: '[HM][스벨트 앤 새퍼 인 액션] 번역계약금 지급(박수현)',
    sangho: '박수현',
    regNo: '810314-1111111',
    price: 500000,
    year: 2020,
    month: 11,  //0 is january
    day: 28,
    bank: '국민은행',
    accountOwner: '박수현',
    accountNo: '812702-04-125807',
    docNo: '한빛-2702-0407',
    agreementNo: 'HM202009011',
    content: '계약 특이사항',
  };


  //URL 확인
  if(document.location.origin+document.location.pathname != 'https://app.spendit.kr/reports') {
    alert('https://app.spendit.kr/reports 페이지에서 실행해주세요.');
    return;
  }

  //globals, var to re-use
  const RIGHT_SEL = 'div#report-document>div:last-child div';
  let el, elBase;

  //폴리시 확인
  elBase = document.querySelector('ul#user>li#policy');
  if(elBase.innerText != v.policy) {
    el = await clickAndWait_(elBase.querySelector('div'), 'ul', elBase);
    el = [...el.querySelectorAll('li>a')].filter(el => el.innerText == v.policy)[0];
    await clickAndWait_(el, document.querySelector('div#alarm-pop'));
  }

  //상단 '추가' 버튼 클릭
  el = await clickAndWait_(document.querySelector('div#application button.btn-icon'), 'div.swal2-container button.swal2-confirm');  //다음 기다릴 대상은 '생성' 버튼

  //'생성' 클릭
  await clickAndWait_(el, 'div#report-document');
  await clickAndWait_(null, 'div#alarm-pop.disabled');  //알림 사라질 때까지 기다려야.

  //'지급처(이름)' 클릭
  await cInput_('지급처(이름)', v.sangho);

  //주민등록번호
  await cInput_('주민등록번호', v.regNo);

  //실지급금액
  await cInput_('실지급금액', v.price);
/*
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
  if(yearDiff == 1) monthOffset = 12

  let monthCount = thisMonth + monthOffset - v.month;
  for(let i=0; i<monthCount; i++)
    await clickAndWait_(el.querySelector('th.rdtPrev'), el);

  let dayEls = [...elBase.querySelectorAll('td[class="rdtDay"], td.rdtActive')];
  dayEls[v.day-1].click();
*/
  //은행명
  await cInput_('은행명', v.bank);

  //예금주
  await cInput_('예금주', v.accountOwner);

  //계좌번호
  await cInput_('계좌번호', v.accountNo);

  //전자결재문서
  await cInput_('전자결재문서', v.docNo);

  //계약서
  await cInput_('계약서', v.agreementNo);

  //내용
  //await cInput_('내용', v.content, null, 'div', 'textarea');

  //document.querySelectorAll('ul.expense-button-bottom>li>button')[1].click();  //'저장'


  //utils
  async function cInput_(strToFind, value, firstSelector = 'div', tag = 'input') {
    const elBase = getRightDivs_(strToFind);
    let el = elBase.querySelector(firstSelector);
    el = await clickAndWait_(el, tag, elBase);
    setReactElValue_(el, value, tag);

    callReactEH_(el);

    console.log(document.querySelector('div#alarm-pop.disabled'));
    await clickAndWait_(elBase.previousSibling, document.querySelector('div#alarm-pop.disabled'));
    await clickAndWait_(null, 'div#alarm-pop');  //not working. todo+++
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
          console.log(elToWaitOrSelector, 'resolved');
          resolve(elToWaitOrSelector);
        });
      }
      else {
        observer = new MutationObserver(m => {
          [...selectOn.querySelectorAll(selector)].forEach(el => {
            observer.disconnect();
            console.log(el, 'resolved');
            resolve(el);
          });
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
    const inputEvent = new Event(tag, {bubbles: true});

    nativeInputValueElSetter.call(el, value);
    el?._valueTracker.setValue(value);
    el.dispatchEvent(inputEvent);
  }

  function callReactEH_(el) {
    const reh = Object.keys(el).filter(el => el.startsWith('__reactEventHandlers$'))[0];
    if(el[reh].onMouseDown)
      el[reh].onMouseDown.call();
    else if(el[reh].onClick)
      el[reh].onClick.call();
    else
      console.warn('no event handler found on', el);
  }

  function getRightDivs_(selText = null) {
    let divs = [...document.querySelectorAll(RIGHT_SEL)];
    if(selText)
      divs = divs.filter(el => el.textContent == selText).pop().nextSibling;

    return divs;
  }

})();