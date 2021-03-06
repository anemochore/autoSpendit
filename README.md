# autoSpendit

## 버전 히스토리

- 2021-2-5: 지출이 세금계산서일 경우 지원하기 위해 보고서 코드 업데이트
- 2021-1-29: dom 변경 반영
- 2021-1-7: 정기인세 작동 확인. 소소한 업데이트
- 2021-1-5: 정기지출(선인세/번역료, 외주비) 지출, 보고서 스크립트 완료
- 2021-1-4: 계약금 지출, 보고서 스크립트 완료


## todo

### 세금계산서 보고서에서 지출을 선택한 다음, 카테고리와 예산항목을 자동으로 입력하게 하면 더 좋을 듯.

### 정기지출 시 pdf 자동 첨부
현재는 pdf를 수동으로 첨부해야 하는데, 1) 일단 cors로 pdf를 가져올 방법이 없어 보이고, 2) 어찌어찌 가져온다 해도 리액트 input 요소에 file을 첨부하는 방법은 연구가 필요하다.


## todo -> done

### sheetify

- 구글 시트에서는 플레인 텍스트 파일을 가져오는 게 불가능해서 js 코드에 html 태그를 붙여서 importXml로 가져와야 한다. 
- 이렇게 가져온 코드가 여러 행이면 구글 시트에서 복사해서 브라우저 콘솔에 붙일 때 큰따옴표 이스케이핑이 생겨 코드가 작동하지 않게 된다. 따라서 뭔가 미니파이가 필요함. `?.` 같은 거 지원하는 서비스를 못 찾겠으나 어쨌든 [이걸](https://javascript-minifier.com/) 쓰고 있다. 
- 근데 이렇게 만든 html 파일조차 importXml에서는 < >를 태그로 인식해서 가지고 온 내용이 중간에 짤린다. 따라서 이 html 파일에서 < >도 이스케이프해야 한다. 
- 현재는 이걸 수동으로 하고 있는데 너무나 귀찮으므로, 자동화할 필요가 있다. importXml은 정적 페이지만 가져올 수 있으므로 웹 서버나 웹 앱이 필요하다. 헤로쿠까지 가지 말고 쉽게쉽게 가기 위해 런킷의 엔드포인트를 쓰기로 결정. 
- 그래서 대충대충 미니파이 대신 빈 행만 없애고 html 붙이고 < > 이스케이프하는 코드를 짠 게 [이거](https://runkit.com/anemochore/sheetify). js=파일명 이런 식으로 매개변수를 '대충' 받는다. 
- 근데... 이 엔드포인트가 작동을 했다 안 했다 한다. 한 열 번 중 한 번은 에러가 남. 그래서인지 구글 시트에서 importXml도 안 된다. 
- 아... 매우 귀찮다. 
- 2021-2-19 그래서 [이 글](https://anidiots.guide/hosting/repl)을 참고해서 repl.it에 호스팅하기로 했다. ~~어차피 노드를 쓰는 거니 미니파이도 uglify-js를 쓰기로 함.~~ 내 코드가 후져서인지 미니파이하면 실행이 안 되서 미니파이는 패스. 결과물은 [이거](https://repl.it/@anemochore/sheetify). importXml도 importHtml로 바꿔서 일단은 잘 작동되는 걸 확인했다. 이제 좀 유지보수가 쉬워지겠네 휴.


