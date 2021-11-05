const fs = require('fs')
const readline = require('readline')

/*
--summary
Read long text file line by line and create new short text file by adding only filtered line
--example
// Add line when only 'abc' text exists
filterLine(
  function (line) {
    if (line.indexOf('abc') !== 1) return line
    else return null
  },
  '\n',
  [
    'D:\\Temp\\userLog-2021-10-04.0.log',
    'D:\\Temp\\userLog-2021-10-04.1.log',
    'D:\\Temp\\userLog-2021-10-04.2.log',
  ],
  'D:\\Temp\\filtered.log'
)
*/
async function filterLine(filterFn, lineSeparator, fullPathSrc, fullPathDest) {
  const fullPathsSrc = !fullPathSrc.length ? [fullPathSrc] : fullPathSrc

  const list = []

  for (let i = 0; i < fullPathsSrc.length; i++) {
    const pathSrcCur = fullPathsSrc[i]

    const fileStream = fs.createReadStream(pathSrcCur)

    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity,
    })
    // Note: we use the crlfDelay option to recognize all instances of CR LF
    // ('\r\n') in input.txt as a single line break.

    for await (const line of rl) {
      const lineNew = filterFn(line)
      if (lineNew !== null) {
        list.push(lineNew)
      }
    }
  }

  const content = list.join(lineSeparator)
  fs.writeFileSync(fullPathDest, content)
  console.log('OK')
}
