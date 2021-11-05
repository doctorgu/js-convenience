const path = require('path')
const fs = require('fs')
const readline = require('readline')

/*
--summary
	Tx Msg:1,018,741 messages
->
02-Nov-2021 01:01:13.853 web01	Tx Msg:1,018,741 messages
*/
function prefixTimeServer(time, serverName, line) {
  return `${time} ${serverName} ${line}`
}
/*
--summary
02-Nov-2021 01:01:13.853 INFO [ajp-nio-0.0.0.0-8009-exec-5]
->
02-Nov-2021 01:01:13.853 web01 INFO [ajp-nio-0.0.0.0-8009-exec-5]
*/
function prefixServer(time, serverName, line) {
  const lineWithoutTime = line.substr(time.length).trimStart()
  return `${time} ${serverName} ${lineWithoutTime}`
}

/*
--summary
02-Nov-2021 01:01:13.853 INFO [ajp-nio-0.0.0.0-8009-exec-5]
->
02-Nov-2021 01:01:13.853
*/
function getTime(line) {
  const lines = line.split(' ')
  let timeStacks = []
  for (let i = 0; i < lines.length; i++) {
    const item = lines[i]
    timeStacks.push(item)
    if (isNaN(Date.parse(timeStacks.join(' ')))) {
      timeStacks.pop()
      return timeStacks.join(' ')
    }
  }

  throw `Wrong format: line: ${line}, timeStacks: ${timeStacks.join(' ')}`
}

/*
--summary
Prefix time and server to line
*/
async function getNormalizedLines(lineSeparator, path, serverName) {
  const fileStream = fs.createReadStream(path)

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  })
  // Note: we use the crlfDelay option to recognize all instances of CR LF
  // ('\r\n') in input.txt as a single line break.

  let timeCur = ''
  const linesNew = []
  for await (const line of rl) {
    const isBlankStarted = /^\s/.test(line)

    let lineNew = ''
    if (!isBlankStarted && line) {
      timeCur = getTime(line)
      lineNew = prefixServer(timeCur, serverName, line)
    } else {
      lineNew = prefixTimeServer(timeCur, serverName, line)
    }

    linesNew.push(lineNew)
  }

  return linesNew
}

/*
--summary
Merge two or more catalina log and sort by time
--example
web01.log:
02-Nov-2021 00:05:37.000 test 1
02-Nov-2021 00:05:37.010 test 2

web02.log:
02-Nov-2021 00:05:37.005 test 1
02-Nov-2021 00:05:37.015 test 2

mergeEachServerCatalinaLog(
  '\n',
  [
    {
      path: 'C:\\web01.log',
      serverName: 'web01',
    },
    {
      path: 'C:\\web02.log',
      serverName: 'web02',
    },
  ],
  'C:\\web01_web02.log'
)

web01_web02.log:
02-Nov-2021 00:05:37.000 web01 test 1
02-Nov-2021 00:05:37.005 web02 test 1
02-Nov-2021 00:05:37.010 web01 test 2
02-Nov-2021 00:05:37.015 web02 test 2
*/
async function mergeEachServerCatalinaLog(
  lineSeparator,
  timeLength,
  pathAndServerNames,
  fullPathDest
) {
  let linesMerged = []
  for (let i = 0; i < pathAndServerNames.length; i += 1) {
    const item = pathAndServerNames[i]
    const { path, serverName } = item
    const lines = await getNormalizedLines(lineSeparator, path, serverName)
    linesMerged = [...linesMerged, ...lines]
  }

  linesMerged.sort((a, b) =>
    a.substr(0, timeLength).localeCompare(b.substr(0, timeLength))
  )

  const content = linesMerged.join(lineSeparator)
  fs.writeFileSync(fullPathDest, content)
  console.log('OK')
}

mergeEachServerCatalinaLog(
  '\n',
  [
    {
      path: 'C:\\web01.log',
      serverName: 'web01',
    },
    {
      path: 'C:\\web02.log',
      serverName: 'web02',
    },
  ],
  'C:\\web01_web02.log'
)
