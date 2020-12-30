(async () => {
  const v = {
    policy: '[HM]원천징수',
    price: 500000,
    sangho: '박수현',
    year: 2020,
    month: 11,  //0 is january
    day: 24,
    cat: '선급금_계약금',
    tag: '컨텐츠비_원고료_IT2팀',
    memo: '도서: [스벨트 앤 새퍼 인 액션]',
  };

  policyEl = document.querySelector('li#policy>div');
  if(policyEl.innerText != v.policy) {
    const elToWait = policyEl.parentNode;
    await clickAndWait_(policyEl, elToWait);

    policyEl = policyEl.nextSibling;
    policyEl = [...policyEl.querySelectorAll('div>li')].filter(el => el.innerText == v.policy)[0];
    await clickAndWait_(policyEl.querySelector('a'), elToWait);
  }

  function clickAndWait_(elToClick, elToWait, selector = '') {
    return new Promise(resolve => {
      let observer = new MutationObserver(m => {
        console.log(m);
        observer.disconnect();
        resolve();
      });
      observer.observe(elToWait, {
        childList: true,
        characterData: true,
        subtree: true,
      });
      elToClick.click();
    });
  }
})();