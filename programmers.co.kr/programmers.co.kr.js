function getMatchesForExperience(experienceString) {
    const list = []
    // const matches = experienceString.matchAll(/(?<yyyyFrom>\d{4})\.(?<mmFrom>\d{2}) ~ (?<yyyyTo>\d{4})\.(?<mmTo>\d{2})\t(?<company>.+?)\t(?<role>.+?)\n- (?<language>.+?)\n- (?<db>.+?)\n/g)
    const matches = `${experienceString}0000-00`.matchAll(/(?<yyyyFrom>\d{4})\.(?<mmFrom>\d{2}) ~ (?<yyyyTo>\d{4})\.(?<mmTo>\d{2})\t(?<companyWork>.*?)\t(?<companyContact>.+?)\t(?<role>.+?)\t(?<language>.+?)\t(?<db>.+?)\t(?<detail>.+?)(?=^\d{4}\.\d{2})/gsm)
    return [...matches]
}

function getExperience(match) {
    const yyyyFrom = match.groups.yyyyFrom
    const mmFrom = match.groups.mmFrom
    const yyyyTo = match.groups.yyyyTo
    const mmTo = match.groups.mmTo
    // 2021.08 -> 2021-08-01
    const startAt = `${yyyyFrom}-${mmFrom}-01`
    const endAt = `${yyyyTo}-${mmTo}-01`
    const companyWork = match.groups.companyWork
    const companyContact = match.groups.companyContact
    const role = match.groups.role
    
    const description = `Language: ${match.groups.language}
DB: ${match.groups.db}
${match.groups.detail.trim() ? '기여 내용:\n' + match.groups.detail : ''}`
    const duration = ((parseInt(yyyyTo) - parseInt(yyyyFrom)) * 12) + (parseInt(mmTo) - parseInt(mmFrom)) + 1

    const experience = {
        "index": -1,
        "name": companyContact,
        "description": description,
        "link": "",
        "analyzed_link": "",
        "development_unrelated": false,
        "role": role,
        "team_description": "",
        "start_at": new Date(startAt),
        "end_at": new Date(endAt),
        "company": {
            "id": -1,
            "name": companyContact + (companyWork ? ` (${companyWork} 파견)` : ''),
            "ceo_name": "",
            "company_url": "",
            "home_url": null,
            "company_id": null
        },
        "parts": [],
        "tags": [],
        "duration": duration
    }

    return experience
}

async function patchExperience(experiences) {
    experiences = experiences.map((ex, i) => {
        const index = (i === experiences.length - 1) ? -1 : null
        return { ...ex, index }
    })
    const body = {"resume": { "experiences": experiences }}

    const result = await fetch("https://programmers.co.kr/api/resumes/262984", {
      "headers": {
        "accept": "application/json, text/plain, */*",
        "accept-language": "en-US,en;q=0.9,ko;q=0.8,zh-CN;q=0.7,zh;q=0.6",
        "content-type": "application/json",
        "sec-ch-ua": "\"Chromium\";v=\"98\", \" Not A;Brand\";v=\"99\", \"Google Chrome\";v=\"98\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\"",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin"
      },
      "referrer": "https://programmers.co.kr/job_profiles/edit",
      "referrerPolicy": "strict-origin-when-cross-origin",
      "body": JSON.stringify(body),
      "method": "PATCH",
      "mode": "cors",
      "credentials": "include"
    });

    return result
}

/*
--summary
Insert all my job experiences to programmers.co.kr site
--remark
Text format is customized for only my resume, so someone need to used this function must change code.
--example
patchExperienceAll(`2021.08 ~ 2021.12	배달의민족	예우	배달의민족 VOC 시스템 – DB 운영, 튜닝	Java, Javascript, Linux Shell, NodeJS, Python	mySQL 8.0, SQLite	개발과 운영의테이블, 인덱스, 함수 등의 스키마가 다른 경우 생김
-> 스키마 비교 기능(NodeJS)
개발에서 스키마의 변경이 언제 발생했는 지 모름
-> 변경점 관리 기능 (NodeJS)
조회 속도 느림
-> SQL 튜닝, 테이블 파티셔닝으로 조회 속도 향상
`)
*/
async function patchExperienceAll(experienceString) {
    const matches = getMatchesForExperience(experienceString)
    const experiences = []
    for (let i = 0; i < matches.length; i += 1) {
        const experience = getExperience(matches[i])
        experiences.push(experience)
        const result = await patchExperience(experiences)
        console.log(i, result)
    }
    console.log('OK')
}


function getNameValues(value, separator) {
    const nameValues = []

    const lines = value.split(/\r*\n/)
    for (let i = 0; i < lines.length; i += 1) {
        const line = lines[i].trim()
        if (!line || line.startsWith('#')) continue
        
        const items = line.split(separator)

        const nameParam = `custom_testcases[${i}][inputs][]`
        for (j = 0; j < items.length - 1; j += 1) {
            const valueParam = items[j].trim()
            nameValues.push([nameParam, valueParam])
        }

        const nameRet = `custom_testcases[${i}][output]`
        const valueRet = items[items.length - 1]
        nameValues.push([nameRet, valueRet])
    }

    return nameValues
}

/*
--summary
Submit test case by appending input and clicking [확인] button
--example
addTestCase(`
[1, 1] | 4 | -1
[1, 1, 4] | 4 | 2
[1, 1] | 0 | 0
[1, 1, 1] | 2 | 2
`)
*/
function addTestCase(value, separator = '|') {
    const nameValues = getNameValues(value, separator)

    const noForm = ($('#applicant-testcase-form').length === 0)

    if (noForm) {
        const btn = $('div.testcase-button > a:contains(테스트 케이스)')
        if (btn.length) {
            btn.click()
            setTimeout(() => {
                addTestCase(value, separator)
            }, 1000)
            return
        }
    }
    
    $('#applicant-testcase-form').find('input').remove()

    nameValues.forEach(([name, value]) => {
        const input = $(`<input name="${name}" />`).val(value)
        $('#applicant-testcase-form').append(input)
    })
    
    $('#applicant-testcase-modal .add-testcase').click()
}

/*
--summary
Print all test case separated by separator
--remark
Last item is return in each row
--example
console.log(getTestCase())
[1, 1] & 4 & -1
[1, 1, 4] & 4 & 2
[1, 1] & 0 & 0
[1, 1, 1] & 2 & 2
*/
function getTestCase(separator = '|') {
    const parameters = []
    const returns = []
    $('#applicant-testcase-form').find('input').each(function () {
        const m = this.name.match(/custom_testcases\[(?<i>\d+)\]\[(?<io>inputs|output)\]/)
        if (m) {
            const i = parseInt(m.groups.i)
            if (m.groups.io === 'inputs') {
                parameters[i] = parameters[i] ? `${parameters[i]} ${separator} ${this.value}` : this.value
            } else {
                returns[i] = this.value
            }
        }
    })

    const list = []
    returns.forEach((ret, i) => {
        list.push(`${parameters[i]} ${separator} ${returns[i]}`)
    })

    return list.join('\n')
}

/*
--summary
Add for...next statement by reading current shortcut text

--example
// show using default value
for
->
for (let i = 0; i < list.length; i += 1) {
}
// show using parameter
for.j.targets
->
for (let j = 0; j < targets.length; j += 1) {
}
*/
function addFor() {
    function getCode(toks) {
        let indent = '    '
        let what = 'for'
        let inc = 'i'
        let target = 'list'
        let templateFor = `{indent}for (let {inc} = 0; {inc} < {target}.length; {inc} += 1) {\n{indent}}`

        const line = toks.map(tok => tok.string).join('')
        const m = line.match(/^(?<indent>\s*)(?<what>\w+)(\.(?<inc>\w+)\.(?<target>\w+))*/)
        if (!m) {
            return templateFor
                .replace(/{inc}/g, inc)
                .replace(/{target}/g, target)
                .replace(/{indent}/g, indent)
        }

        what = m.groups.what
        if (what === 'for') {
            if (m.groups.inc !== undefined)
                inc = m.groups.inc

            if (m.groups.target !== undefined)
                target = m.groups.target

            if (m.groups.indent !== undefined)
                indent = m.groups.indent
        }

        return templateFor
            .replace(/{inc}/g, inc)
            .replace(/{target}/g, target)
            .replace(/{indent}/g, indent)
    }
    
    const editor = document.querySelector('.CodeMirror').CodeMirror;
    const doc = editor.getDoc()
    const cursor = doc.getCursor()
    const toks = editor.getLineTokens(cursor.line)
    const code = getCode(toks)
    doc.replaceRange(code, { line: cursor.line, ch: 0 }, { line: cursor.line, ch: cursor.ch })
}

/*
--summary
Apply shortcuts 
--example
applyShortcuts()
*/
function applyShortcuts() {
    $(document).on('keydown', function (e) {
        if (e.ctrlKey) {
            // [Ctrl] + K to click [코드 실행] button
            if (e.keyCode === 'K'.charCodeAt(0)) {
                e.stopPropagation()
                $('#run-code').click()
            }
            // [Ctrl] + [Space] to insert snippet
            else if (e.keyCode === ' '.charCodeAt(0)) {
                addFor()
            }
        }
    })
}
