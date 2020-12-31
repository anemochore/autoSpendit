//#정기인세 등
//총액만. 현금으로.
//'상호'는 IT2팀 정기인세
//'날짜'는 전월 마지막 날로.
//'환급'에 체크

//comments should be on seperate lines! 

//read v from sheet

(async () => {
  //URL 확인
  if(document.location.origin+document.location.pathname != 'https://app.spendit.kr/expenses') {
    alert('https://app.spendit.kr/expenses 페이지에서 실행해주세요.');
    return;
  }

  //globals, var to re-use
  const RIGHT_SEL = 'div.modal-desc div';
  let el, elBase;

  //폴리시 확인
  elBase = document.querySelector('ul#user>li#policy');
  if(elBase.innerText != v.policy) {
    el = await clickAndWait_(elBase.querySelector('div'), 'ul', elBase);
    el = [...el.querySelectorAll('li>a')].filter(el => el.innerText == v.policy)[0];
    await clickAndWait_(el, document.querySelector('div#alarm-pop'));
  }

  //상단 '추가' 버튼 클릭
  //다음 기다릴 대상은 '미지정' 오른쪽 삼각형 버튼
  el = await clickAndWait_(document.querySelector('div#application button.btn-icon'), 'div#expense-modal-split-left button');


  //'현금' 클릭
  el = await clickAndWait_(el, 'button+div>ul>div', el.parentNode);
  el = [...el.parentNode.querySelectorAll('div')].filter(el => el.innerText == '현금')[0];
  await clickAndWait_(el, el.parentNode.parentNode.parentNode);

  //금액
  await cInput_('금액*', v.price, null, 'div>input#price', true);

  //상호
  await cInput_('상호*', v.sangho, 'div>input+div');

  //날짜
  elBase = getRightDivs_('날짜*');
  el = elBase.querySelector('div>input');
  el = await clickAndWait_(el, 'table', elBase);
  let th = el.querySelector('div.rdtDays th.rdtSwitch');
  let thisYear = parseInt(th.innerText.split(' ').pop());
  let thisMonth = parseInt(th.getAttribute('data-value'));

  let yearDiff = thisYear - v.year;
  //assert yearDiff == 1
  if(yearDiff > 1 || yearDiff < 0) {
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

  //카테고리
  await cInput_('카테고리', v.cat, 'div>input+ul>div:last-child');
  await clickAndWait_(null, 'div:not(.spacer)+div:not(.spacer)+div.spacer+div:not(.spacer)+div:not(.spacer)', getRightDivs_()[0]);

  //도서명(카테고리 선택 후 나타남)
  await cInput_('도서명', v.title, 'div>input+ul>div:last-child');

  //예산항목(태그)(카테고리 선택 후 나타남)
  await cInput_('예산항목', v.tag, 'div>input+ul>div:last-child');

  //메모
  await cInput_('메모', v.memo);

  //환급(off일 때만 on으로)
  el = getRightDivs_()[0].querySelector('div.switch.off');
  if(el) callReactEH_(el);

  //'저장' 버튼
  document.querySelectorAll('ul.expense-button-bottom>li>button')[1].click();


  //utils
  async function cInput_(strToFind, value, reactEHSelector = null, firstSelector = 'div', noSelectInput = false) {
    const elBase = getRightDivs_(strToFind);
    let el = [...elBase.querySelectorAll(firstSelector)].pop();
    if(!noSelectInput)
      el = await clickAndWait_(el, 'input', elBase);
    setReactElValue_(el, value);

    if(reactEHSelector) {
      el = await clickAndWait_(el, reactEHSelector, elBase);
      callReactEH_(el);
    }
  }

  function clickAndWait_(elToClick, elToWaitOrSelector = null, selectOn = document.documentElement) {
    return new Promise((resolve, reject) => {
      let selector;
      if(!elToWaitOrSelector)
        elToWaitOrSelector = elToClick;
      else if(typeof(elToWaitOrSelector) == 'string') {
        selector = elToWaitOrSelector;
        //if selected el is already present, not good-_-
        elToWaitOrSelector = selectOn;
      }

      let observer;
      if(!selector) {
        observer = new MutationObserver(m => {
          observer.disconnect();
          //console.info(elToWaitOrSelector, 'resolved');
          resolve(elToWaitOrSelector);
        });
      }
      else {
        observer = new MutationObserver(m => {
          [...selectOn.querySelectorAll(selector)].forEach(el => {
            observer.disconnect();
            //console.info(el, 'resolved');
            resolve(el);
          });
        });
      }
      observer.observe(elToWaitOrSelector, {childList: true, subtree: true, attributes: true, characterData: true});
      if(elToClick) elToClick.click();
      //console.info(elToClick, 'clicked');
    });
  }

  function setReactElValue_(el, value) {
    const nativeInputValueElSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
    const inputEvent = new Event('input', {bubbles: true});

    nativeInputValueElSetter.call(el, value);
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
      divs = divs.filter(el => el.textContent == selText)[0].parentNode;

    return divs;
  }

})();