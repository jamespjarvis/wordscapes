#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const convertToJSON = file => {
  const words = fs.readFileSync(file, "utf8");
  return words
    .split("\n")
    .map(x => x.toUpperCase())
    .filter(i => i.length);
};

const dirPath = path.resolve(
  __dirname,
  process.argv[2].substr(0, process.argv[2].lastIndexOf("/"))
);

const rawWords = convertToJSON(path.resolve(__dirname, process.argv[2]));

// const rawWords = JSON.parse(
//   fs.readFileSync(path.resolve(__dirname, process.argv[2]), "utf8")
// );

const all = new Map();

for (let i = 0; i < rawWords.length; i++) {
  const wordLength = rawWords[i].length;
  if (all.has(wordLength)) {
    all.set(wordLength, [...all.get(wordLength), rawWords[i]]);
  } else {
    all.set(wordLength, [rawWords[i]]);
  }
}

[...all.keys()].forEach(k => {
  const list = all.get(k);
  fs.writeFileSync(path.resolve(dirPath, `${k}.json`), JSON.stringify(list));
});

fs.writeFileSync(
  `${dirPath}/all.json`,
  JSON.stringify([...all.values()].reduce((a, c) => [...a, ...c], []))
);
