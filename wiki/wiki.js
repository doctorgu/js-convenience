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
    iterateSelected((td, i, row, col) => {
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
iterateSelected((td, i, rw, cl) => console.log(`td.innerHTML:${td.innerHTML}, i:${i}, rw:${rw}, cl:${cl}`))
*/
function iterateSelected(callbackFn) {
    const list = [...document.querySelectorAll("th[data-mce-selected='1'],td[data-mce-selected='1']")]
    list.forEach((td, i) => callbackFn(td, i, td.parentElement.rowIndex, td.cellIndex))
}

// -------------------------------------------------------------

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
            hNew += parseInt(mNew / 60)
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
                row1: selected.row1 - count,
                row2: selected.row1 - 1,
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
                col1: selected.col1 + 1,
                col2: selected.col1 + count,
            }
            break;
    }
    console.log(selected, selectedNew)
    
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
"@홍길동"으로 표시되는 a 태그의 사용자 정보 중 username, display, userkey를 다른 사용자 것으로 변경
--example
replaceAllUser(
    { username: 'id1', display: '홍길일', userkey: '8a90bc14772b0b27017b393465e4044b' },
    { username: 'id2', display: '홍길이', userkey: '8a90bc14772b0b27017b393465e4044b' }
)
*/
function replaceAllUser(from = {}, to = {}) {
    [...document.querySelectorAll('a')].forEach(a => {
        for (let i = 0; i < a.attributes.length; i += 1) {
            const attr = a.attributes[i]

            if (attr.value.indexOf(from.username) !== -1) {
                attr.value = attr.value.replace(from.username, to.username)
            }
            if (attr.value.indexOf(from.display) !== -1) {
                attr.value = attr.value.replace(from.display, to.display)
            }
            if (attr.value.indexOf(from.userkey) !== -1) {
                attr.value = attr.value.replace(from.userkey, to.userkey)
            }
        }

        if (a.innerText.indexOf(from.display) !== -1) {
            a.innerText = to.display
        }
    })
}

/*
--summary
time 태그의 datetime attribute와 innerText를 동시에 변경함
--example
replaceDate('2021-11-15', '2021-11-17')

<time datetime="2021-11-15" class="non-editable" contenteditable="false" onselectstart="return false;">15 Nov 2021</time>
->
<time datetime="2021-11-17" class="non-editable" contenteditable="false" onselectstart="return false;">17 Nov 2021</time>
*/
function replaceDate(from, to) {
    function formatDate(date, isStandard) {
        const yyyy = date.getFullYear().toString()
        const mm = (date.getMonth() + 1).toString().padStart(2, '0')
        const dd = date.getDate().toString().padStart(2, '0')

        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
        const monthName = monthNames[date.getMonth()]

        if (isStandard) {
            return `${yyyy}-${mm}-${dd}`
        }
        else {
            return `${dd} ${monthName} ${yyyy}`
        }
    }

    if (!from.getDate) {
        from = new Date(from)
    }
    if (!to.getDate) {
        to = new Date(to)
    }

    const list = [...document.querySelectorAll('time')]
    list.forEach(t => {
        const datetime = new Date(t.getAttribute('datetime'))
        const display = t.innerText

        if (datetime.getTime() === from.getTime()) {
            t.setAttribute('datetime', formatDate(to, true))
            t.innerText = formatDate(to, false)
        }
    })
}

/*
--summary
전체 time 태그의 datetime attribute, 전체 사용자용 a  태그의 data-username을 리턴함
--example
getAllDateUser() // ['2021-11-15', '2021-11-17', '{ username: 'id1', display: '홍길동', userkey: '1234' }', '{ username: 'id2', display: '홍길순', userkey: '12345' }']
*/
function getAllDateUser() {
    const dateElems = [...document.querySelectorAll('time')]
    const dates = [...new Set(dateElems.map(t => t.getAttribute('datetime')).sort())]

    const userElems = [...document.querySelectorAll('a')]
                    .filter(a => !!a.getAttribute('data-username'))
    const users = [...new Set(userElems.map(t => (`{ username: '${t.getAttribute('data-username')}', display: '${t.getAttribute('data-linked-resource-default-alias')}', userkey: '${t.getAttribute('userkey')}' }`)).sort())]
    
    return [...dates, ...users]
}

/*
--summary
선택된 셀 안에 탭과 줄바꿈으로 구분된 텍스트를 붙여넣음.
--example
pasteTsvToTable('a\tb\n1\t2')
*/
function pasteTsvToTable(value) {
    const list = []
    const rows = value.split(/\r?\n/)
    for (let rw = 0; rw < rows.length; rw++) {
        const cells = rows[rw].split('\t')
        list.push(cells)
    }

    iterateSelected((td, i, row, col) => {
        if (row < list.length && col < list[row].length) {
            td.innerText = list[row][col]
        }
    })    
}
