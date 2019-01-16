const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const initialize2DArray = (w, h, val = null) =>
  Array.from({ length: h }).map(() => Array.from({ length: w }).fill(val));

const deepFlatten = arr =>
  [].concat(...arr.map(v => (Array.isArray(v) ? deepFlatten(v) : v)));

const createElement = str => {
  const el = document.createElement("div");
  el.innerHTML = str;
  return el.firstElementChild;
};

const uniqueElements = arr => [...new Set(arr)];

const initializeArrayWithRange = (end, start = 0, step = 1) =>
  Array.from(
    { length: Math.ceil((end - start + 1) / step) },
    (v, i) => i * step + start
  );

const bifurcateBy = (arr, fn) =>
  arr.reduce((acc, val, i) => (acc[fn(val, i) ? 0 : 1].push(val), acc), [
    [],
    []
  ]);

const initializeArrayWithValues = (n, val = 0) => Array(n).fill(val);

const shuffle = ([...arr]) => {
  let m = arr.length;
  while (m) {
    const i = Math.floor(Math.random() * m--);
    [arr[m], arr[i]] = [arr[i], arr[m]];
  }
  return arr;
};

const countOccurrences = (arr, val) =>
  arr.reduce((a, v) => (v === val ? a + 1 : a), 0);

const chunk = (arr, size) =>
  Array.from({ length: Math.ceil(arr.length / size) }, (v, i) =>
    arr.slice(i * size, i * size + size)
  );

const getCharacterFrequencies = words => {
  return words.reduce((a, c) => {
    const chars = c.split("");
    chars.forEach(char => {
      a[char] = a[char] ? a[char] + 1 : 1;
    });
    return a;
  }, {});
};

const getCharacterPairFrequencies = words => {
  const pairFrequencies = words.reduce((a, c) => {
    const pairs = chunk(c.split(""), 2)
      .filter(x => x.length === 2)
      .map(p => p.join(""));
    pairs.forEach(p => {
      a[p] = a[p] ? a[p] + 1 : 1;
    });
    return a;
  }, {});
  return Object.keys(pairFrequencies)
    .sort((a, b) => pairFrequencies[b] - pairFrequencies[a])
    .map(pair => ({ pair, freq: pairFrequencies[pair] }));
};

const initializeArrayWithSeed = (arr, n) => {
  const result = [];
  const getRandom = () => {
    const word = arr[Math.floor(Math.random() * arr.length)];
    return result.includes(word) ? getRandom() : word;
  };

  for (let i = 0; i < n; i++) {
    const r = getRandom();
    result.push(r);
  }
  return result;
};

const importAll = ctx => {
  let keys = ctx.keys();
  let values = keys.map(ctx);
  return keys.reduce((o, k, i) => {
    o[k] = values[i];
    return o;
  }, {});
};

const median = arr => {
  const mid = Math.floor(arr.length / 2),
    nums = [...arr].sort((a, b) => a - b);
  return arr.length % 2 !== 0 ? nums[mid] : (nums[mid - 1] + nums[mid]) / 2;
};

const isAnagram = (str1, str2) => {
  const normalize = str =>
    str
      .toLowerCase()
      .replace(/[^a-z0-9]/gi, "")
      .split("")
      .sort()
      .join("");
  return normalize(str1) === normalize(str2);
};
const swap = (chars, i, j) => {
  let tmp = chars[i];
  chars[i] = chars[j];
  chars[j] = tmp;
};

const getAnagrams = input => {
  const anagrams = [];
  const chars = input.split("");
  const length = chars.length;
  const counter = initializeArrayWithValues(length, 0);

  anagrams.push(input);

  let i = 0;

  while (i < length) {
    if (counter[i] < i) {
      swap(chars, i % 2 === 1 ? counter[i] : 0, i);
      counter[i]++;
      i = 0;
      anagrams.push(chars.join(""));
    } else {
      counter[i] = 0;
      i++;
    }
  }

  return anagrams;
};

const readFound = filePath => {
  const data = JSON.parse(fs.readFileSync(filePath));
  console.log(data);
};

const UUIDGeneratorNode = () =>
  ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
    (c ^ (crypto.randomBytes(1)[0] & (15 >> (c / 4)))).toString(16)
  );

const generateId = () =>
  Math.random()
    .toString(36)
    .substr(2, 10);

module.exports = {
  generateId,
  UUIDGeneratorNode,
  readFound,
  getAnagrams,
  initialize2DArray,
  deepFlatten,
  createElement,
  uniqueElements,
  initializeArrayWithRange,
  bifurcateBy,
  initializeArrayWithValues,
  shuffle,
  countOccurrences,
  getCharacterFrequencies,
  getCharacterPairFrequencies,
  initializeArrayWithSeed,
  importAll,
  median,
  isAnagram
};
