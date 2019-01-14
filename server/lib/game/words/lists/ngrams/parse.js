const fs = require("fs");

const convertToJSON = file => {
  const words = fs.readFileSync(file, "utf8");
  return words
    .split("\n")
    .map(x => x.toUpperCase())
    .filter(i => i.length);
};

const rawWords = convertToJSON("./words.txt");

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
  fs.writeFileSync(`./${k}.json`, JSON.stringify(list));
});

fs.writeFileSync(
  "./all.json",
  JSON.stringify([...all.values()].reduce((a, c) => [...a, ...c], []))
);
