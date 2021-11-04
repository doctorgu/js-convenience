# wiki-editor-helper
Wiki Editor helper function to use in Chrome DevTools

## How to use

### 스크립트 준비
1. Wiki 문서가 편집인 상태에서 F12를 눌러 DevTools을 연다
1. [Source] 탭 선택
1. 하위 탭 중 [Snippets] 탭 선택
1. [+ New snippet] 선택하고 wiki.js의 내용을 붙여넣기
1. Console 영역이 보이지 않으면 [Esc] 키를 눌러 Console 영역 표시
1. Console 영역의 헤더 부분에 [top]이 선택되었다면 [wysiwygTextarea_ifr (editpage.action)] 선택

### Wiki 작업
1. 테이블의 셀을 2개 이상 선택

### 스크립트 실행
1. Sniffet의 맨 마지막 줄로 가서 함수를 입력하고 [Ctrl] + [Enter] 키를 눌러 실행

```javascript
// 선택된 셀의 내용을 전부 삭제
empty()

// 선택된 셀의 영역을 오른쪽으로 1열만큼 확장
extendSelection(1, 'right')
```
