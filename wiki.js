/*
--summary
여러 행의 예상소요시간(분), 예상시작시간 열을 선택하고 실행하면 예상소요시간(분)을 이전 예상시작시간에 더해서 현재 예상시작시간을 자동으로 입력함
--remark
예상소요시간(분)을 더한 값을 예상시작시간 열에 표시하므로 실제로는 예상종료시간이 맞으나 이전부터 되어있는 걸 바꾸기 어려워 열 이름은 그대로 둠
--example
// 07:59에 시작해서 예상시작시간 열을 자동 입력
setHhmm('07:59')
*/
function setHhmm(hhmmStart) {
    function getHhmm(duration, hhmmOld) {
        const mat = hhmmOld.match(/(\d{2}):(\d{2})/)
        const h = parseInt(mat[1])
        const m = parseInt(mat[2])
        
        let hNew = h
        let mNew = m + duration
        if (mNew >= 60) {
            hNew += mNew / 60
            mNew = mNew % 60
        }

        return hNew.toString().padStart(2, '0')
                + ':'
                + mNew.toString().padStart(2, '0')
    }

    const list = [...document.querySelectorAll("td[data-mce-selected='1']")]

    let duration = 0
    let hhmm = hhmmStart
    let hhmmOld = ''

    list.forEach((td, i) => {
        const isDuration = (i % 2) === 0

        if (isDuration) {
            duration = parseInt(td.innerText)
        }
        else {
            hhmmOld = hhmm
            hhmm = getHhmm(duration, hhmmOld)
            td.innerText = hhmm
            td.style.textAlign = 'center'
        }
    })
}

/*
--summary
작업 확인 열의 아이콘을 [완료]로 변경
*/
function setCompleted() {
    const list = [...document.querySelectorAll("td[data-mce-selected='1']")]
    list.forEach((td, i) => td.innerHTML = `<img class="editor-inline-macro" data-macro-default-parameter="" data-macro-name="status" data-macro-parameters="colour=Green|title=완료" data-macro-schema-version="1" width="88" height="18" src="/plugins/servlet/status-macro/placeholder?=&amp;0=&amp;colour=Green&amp;title=%EC%99%84%EB%A3%8C">`)
}
/*
--summary
작업 확인 열의 아이콘을 [대기]로 변경
*/
function setWait() {
    const list = [...document.querySelectorAll("td[data-mce-selected='1']")]
    list.forEach((td, i) => td.innerHTML = `<img class="editor-inline-macro" data-macro-default-parameter="" data-macro-name="status" data-macro-parameters="colour=Grey|title=대기" data-macro-schema-version="1" width="88" height="18" src="/plugins/servlet/status-macro/placeholder?=&amp;0=&amp;colour=Grey&amp;title=%EB%8C%80%EA%B8%B0">`)
}

/*
--summary
내용 삭제
*/
function empty() {
    const list = [...document.querySelectorAll("td[data-mce-selected='1']")]
    list.forEach((td, i) => td.innerText = ``)
}

/*
--summary
선택 셀을 확장
--example
// 현재 셀의 정보가 {row1: 4, row2: 5, col1: 4, col2: 4}일 때 1만큼 오른쪽으로 확장
extendSelection(1, 'right')
// 결과: {row1: 4, row2: 5, col1: 5, col2: 5} 
*/
function extendSelection(count, direction) {
    const list = [...document.querySelectorAll("td[data-mce-selected='1']")]

    const selected = getSelectedRegion()

    let selectedNew = {}
    switch (direction) {
        case 'down':
            selectedNew = {
                row1: selected.row2 + 1,
                row2: selected.row2 + count,
                col1: selected.col1,
                col2: selected.col2,
            }
            break;
        case 'up':
            selectedNew = {
                row1: selected.row1 - 1,
                row2: selected.row1 - count,
                col1: selected.col1,
                col2: selected.col2,
            }
            break;
        case 'left':
            selectedNew = {
                row1: selected.row1,
                row2: selected.row2,
                col1: selected.col1 - count,
                col2: selected.col1 - 1,
            }
            break;
        case 'right':
            selectedNew = {
                row1: selected.row1,
                row2: selected.row2,
                col1: selected.col1 + count,
                col2: selected.col1 + 1,
            }
            break;
    }

    const tbl = document.querySelector("td[data-mce-selected='1']").closest("table")

    for (let rw = selectedNew.row1; rw <= selectedNew.row2; rw += 1) {
        for (let cl = selectedNew.col1; cl <= selectedNew.col2; cl += 1) {
            const tdNew = tbl.querySelector(`tbody > tr:nth-child(${rw + 1}) > td:nth-child(${cl + 1})`)
            if (!tdNew)
                throw (`rw:${rw}, cl:${cl} not exists.`)

            tdNew.setAttribute("data-mce-selected", '1')
        }
    }
}

/*
--summary
선택 셀의 네 모서리 위치 정보를 리턴함
--example
// 시작 행: 5, 종료 행: 6, 시작 열: 5, 종료 열: 5인 경우
getSelectedRegion()
// 결과: {row1: 4, row2: 5, col1: 4, col2: 4}
*/
function getSelectedRegion() {
    let row1 = 999, row2 = 0, col1 = 999, col2 = 0
    iterateSelected((td, i, col, row) => {
        if (row < row1) row1 = row
        if (row > row2) row2 = row

        if (col < col1) col1 = col
        if (col > col2) col2 = col
    })

    return { row1, row2, col1, col2, }
}

/*
--summary
선택된 각 셀에 대해 callbackFn 함수를 호출
--example
// 모든 선택 셀의 정보를 출력
iterateSelected((td, i, cl, rw) => console.log(`td.innerHTML:${td.innerHTML}, i:${i}, cl:${cl}, rw:${rw}`))
*/
function iterateSelected(callbackFn) {
    const list = [...document.querySelectorAll("td[data-mce-selected='1']")]
    list.forEach((td, i) => callbackFn(td, i, td.cellIndex, td.parentElement.rowIndex))
}

