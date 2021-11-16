function getMatches(experienceString) {
    const list = []
    const matches = experienceString.matchAll(/(?<yyyyFrom>\d{4})\.(?<mmFrom>\d{2}) ~ (?<yyyyTo>\d{4})\.(?<mmTo>\d{2})\t(?<company>.+?)\t(?<role>.+?)\n- (?<language>.+?)\n- (?<db>.+?)\n/g)
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
    const company = match.groups.company
    const role = match.groups.role
    const description = `Language: ${match.groups.language} / DB: ${match.groups.db}`
    const duration = ((parseInt(yyyyTo) - parseInt(yyyyFrom)) * 12) + (parseInt(mmTo) - parseInt(mmFrom)) + 1

    const experience = {
        "index": -1,
        "name": company,
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
            "name": company,
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

async function patch(experiences) {
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
patchAll(`1997.02 ~ 1997.02	디지타워 시스템	물류관리 시스템
- VB 5.0, Access VBA
- Access
1997.03 ~ 1997.08	태영 시스템	병원 관리 프로그램
- VB 5.0
- Access
`)
*/
async function patchAll(experienceString) {
    const matches = getMatches(experienceString)
    const experiences = []
    for (let i = 0; i < matches.length; i += 1) {
        const experience = getExperience(matches[i])
        experiences.push(experience)
        const result = await patch(experiences)
        console.log(i, result)
    }
}
