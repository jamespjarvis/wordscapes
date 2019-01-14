#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const {
  initializeArrayWithRange,
  getCharacterFrequencies
} = require("../../utils");

const dirPath = path.resolve(__dirname, process.argv[2]);

const wordLists = initializeArrayWithRange(6, 3).map(n =>
  require(`${dirPath}/${n}.json`)
);

const keyList = wordLists[3]
  .map(word =>
    word
      .split("")
      .sort()
      .join("")
  )
  .sort((a, b) => b - a);

const masterList = wordLists.reduce((a, c) => [...a, ...c], []);

const keyDictionary = keyList.reduce((acc, word) => {
  const sortedLetters = word
    .split("")
    .sort()
    .join("");

  acc[sortedLetters] = acc[sortedLetters]
    ? [...acc[sortedLetters], word]
    : [word];
  return acc;
}, {});

const masterDictionary = masterList.reduce((acc, word) => {
  const sortedLetters = word
    .split("")
    .sort()
    .join("");
  const key = Object.keys(keyDictionary).find(k => {
    const splitKey = k.split("");
    const keyCharacterFrequencies = getCharacterFrequencies(k.split(""));
    if (sortedLetters.split("").every(c => splitKey.includes(c))) {
      const f = getCharacterFrequencies(sortedLetters.split(""));
      return sortedLetters
        .split("")
        .every(c => f[c] <= keyCharacterFrequencies[c]);
    }
    return false;
  });

  if (key) {
    if (acc[key]) {
      acc[key] = !acc[key].includes(word) ? [...acc[key], word] : acc[key];
    } else {
      acc[key] = [word];
    }
  }

  return acc;
}, {});

const filteredDictionary = Object.keys(masterDictionary).reduce((acc, curr) => {
  if (masterDictionary[curr] && masterDictionary[curr].length >= 6) {
    acc[curr] = masterDictionary[curr];
  }
  return acc;
}, {});

fs.writeFile(
  `${dirPath}/dictionary.json`,
  JSON.stringify(filteredDictionary),
  err => {
    if (err) throw err;
    console.log("DONE");
  }
);
