const fs = require("fs");
const path = require("path");

function* findFiles(dir, excludePattern) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  for (const file of files) {
    if (file.isDirectory()) {
      yield* findFiles(path.join(dir, file.name), excludePattern);
    } else {
      const fullPath = path.join(dir, file.name);
      if (!excludePattern.test(fullPath)) {
        yield fullPath;
      }
    }
  }
}

/*
--Example
function write() {
  const rootSrc = "C:\\source\\src";
  const rootDest = "C:\\source\\dest";
  const excludePattern =
    /\\\.git\\|\\target\\|\\\.settings\\|\.project|\.classpath/;
  const pathAdded = "D:\\Temp\\added.txt";
  const pathRemoved = "D:\\Temp\\removed.txt";
  const pathChanged = "D:\\Temp\\changed.txt";
  const mapSrcDest = [
    ["\\common\\", "\\api-common\\"],
  ];

  const pathsSrc = [...findFiles(rootSrc, excludePattern)];
  const pathsDest = [...findFiles(rootDest, excludePattern)];

  const { added, removed, changed } = getAddedRemovedChanged(
    rootSrc,
    rootDest,
    pathsSrc,
    pathsDest,
    mapSrcDest
  );
  fs.writeFileSync(pathAdded, added.join("\n"));
  fs.writeFileSync(pathRemoved, removed.join("\n"));
  fs.writeFileSync(pathChanged, changed.join("\n"));
}
*/
function getAddedRemovedChanged(
  rootSrc,
  rootDest,
  pathsSrc,
  pathsDest,
  mapSrcDest
) {
  function getNewSrc(pathSrc, mapSrcDest) {
    let pathSrcNew = pathSrc;

    for (let i = 0; i < mapSrcDest.length; i++) {
      const [src, dest] = mapSrcDest[i];
      if (pathSrc.includes(src)) {
        pathSrcNew = pathSrc.replace(src, dest);
        break;
      }
    }

    return pathSrcNew;
  }

  function getAdded(rootSrc, rootDest, pathsSrc, pathsDest, mapSrcDest) {
    const added = [];

    for (let nDest = 0; nDest < pathsDest.length; nDest++) {
      const dest = pathsDest[nDest];
      const src = rootSrc + dest.substr(rootDest.length);
      const srcMapped = getNewSrc(src, mapSrcDest);
      if (!pathsSrc.includes(srcMapped)) {
        added.push(dest);
      }
    }

    return added;
  }

  function getChanged(rootSrc, rootDest, pathsDest, mapSrcDest) {
    const changed = [];

    for (let nDest = 0; nDest < pathsDest.length; nDest++) {
      const dest = pathsDest[nDest];
      const src = rootSrc + dest.substr(rootDest.length);
      const srcMapped = getNewSrc(src, mapSrcDest);
      if (!fs.existsSync(srcMapped)) continue;

      const sizeSrc = fs.statSync(srcMapped).size;
      const sizeDest = fs.statSync(dest).size;
      if (sizeSrc !== sizeDest) {
        changed.push(`${srcMapped}>${dest}`);
      }
    }

    return { changed };
  }

  const added = getAdded(
    rootSrc,
    rootDest,
    pathsSrc,
    pathsDest,
    mapSrcDest.map(([src, dest]) => [dest, src])
  );
  const removed = getAdded(rootDest, rootSrc, pathsDest, pathsSrc, mapSrcDest);
  const { changed } = getChanged(
    rootSrc,
    rootDest,
    pathsDest,
    mapSrcDest.map(([src, dest]) => [dest, src])
  );

  return { added, removed, changed };
}

module.exports = {
  findFiles,
  getAddedRemovedChanged,
};
